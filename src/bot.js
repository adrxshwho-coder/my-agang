const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const collectblock = require("mineflayer-collectblock").plugin;
const minecraftData = require("minecraft-data");
const { TASKS, HOSTILES } = require("./tasks");

class SquadBot {
  constructor(manager, index, role) {
    this.manager = manager;
    this.index = index;
    this.role = role;
    this.name = `${manager.config.prefix}_${String(index + 1).padStart(2, "0")}`;
    this.bot = null;
    this.state = "offline";
    this.task = null;
    this.reconnectTimer = null;
    this.manualStop = false;
  }

  connect() {
    if (this.bot) return;

    this.manualStop = false;
    this.state = "connecting";

    const options = {
      host: this.manager.config.host,
      port: this.manager.config.port,
      username: this.name,
      auth: this.manager.config.auth
    };

    if (this.manager.config.version) options.version = this.manager.config.version;

    const bot = mineflayer.createBot(options);
    this.bot = bot;

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(collectblock);

    bot.once("spawn", () => {
      this.state = "idle";
      this.data = minecraftData(bot.version);
      this.movements = new Movements(bot, this.data);
      this.movements.canDig = true;
      this.movements.allow1by1towers = false;
      bot.pathfinder.setMovements(this.movements);

      this.say(`${this.role} ready.`);
      this.startRoleLoop();
    });

    bot.on("chat", (username, message) => {
      if (username === bot.username) return;
      this.manager.handleChat(username, message);
    });

    bot.on("health", () => {
      if (bot.food < 8 && this.role !== "farmer") this.tryEat();
    });

    bot.on("death", () => {
      this.state = "dead";
      setTimeout(() => {
        if (this.bot && this.bot.entity) this.state = "idle";
      }, 3000);
    });

    bot.on("kicked", reason => {
      console.log(`[${this.name}] kicked: ${String(reason)}`);
    });

    bot.on("error", err => {
      console.log(`[${this.name}] error: ${err.message}`);
    });

    bot.on("end", () => {
      this.state = "offline";
      this.bot = null;
      if (!this.manualStop) this.scheduleReconnect();
    });
  }

  scheduleReconnect() {
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), this.manager.config.reconnectDelay);
  }

  say(text) {
    try { this.bot?.chat(text); } catch {}
  }

  stop() {
    this.manualStop = true;
    clearTimeout(this.reconnectTimer);
    try { this.bot?.pathfinder.stop(); } catch {}
    try { this.bot?.quit("Squad shutdown"); } catch {}
    this.bot = null;
    this.state = "offline";
  }

  async followOwner() {
    if (!this.bot?.entity) return;
    const target = this.bot.players[this.manager.config.owner]?.entity;
    if (!target) return this.say(`I cannot see ${this.manager.config.owner}.`);
    this.task = "follow";
    this.state = "working";
    this.bot.pathfinder.setGoal(new goals.GoalFollow(target, 3), true);
  }

  stopTask() {
    this.task = null;
    this.state = "idle";
    try { this.bot?.pathfinder.setGoal(null); } catch {}
  }

  async gather(key) {
    if (!this.bot?.entity) return;
    const spec = TASKS[key];
    if (!spec) return;

    this.task = `gather:${key}`;
    this.state = "working";

    const blocks = spec.blocks
      .map(name => this.data?.blocksByName?.[name]?.id)
      .filter(Boolean);

    if (!blocks.length) return;

    try {
      const found = this.bot.findBlocks({
        matching: blocks,
        maxDistance: 64,
        count: 12
      });

      if (found.length) {
        await this.bot.collectBlock.collect(found, { ignoreNoPath: true });
      }
    } catch (err) {
      console.log(`[${this.name}] gather ${key}: ${err.message}`);
    } finally {
      this.state = "idle";
    }
  }

  explore() {
    if (!this.bot?.entity) return;
    const p = this.bot.entity.position;
    const dx = Math.floor((Math.random() * 2 - 1) * 120);
    const dz = Math.floor((Math.random() * 2 - 1) * 120);
    this.task = "explore";
    this.state = "working";
    this.bot.pathfinder.setGoal(new goals.GoalXZ(Math.floor(p.x + dx), Math.floor(p.z + dz)));
  }

  guard() {
    if (!this.bot?.entity) return;
    const owner = this.bot.players[this.manager.config.owner]?.entity;
    if (owner) {
      this.task = "guard";
      this.state = "working";
      this.bot.pathfinder.setGoal(new goals.GoalFollow(owner, 6), true);
    }
  }

  attackNearby() {
    if (!this.bot?.entity) return;
    let best = null;
    let distance = 10;

    for (const entity of Object.values(this.bot.entities)) {
      if (!entity || !entity.name || !HOSTILES.has(entity.name)) continue;
      const d = this.bot.entity.position.distanceTo(entity.position);
      if (d < distance) {
        best = entity;
        distance = d;
      }
    }

    if (best) {
      try {
        this.bot.attack(best);
        this.state = "combat";
      } catch {}
    }
  }

  tryEat() {
    if (!this.bot) return;
    const food = this.bot.inventory.items().find(i =>
      /bread|beef|porkchop|chicken|mutton|potato|carrot|apple|melon/.test(i.name)
    );
    if (!food) return;

    this.bot.equip(food, "hand").then(() => this.bot.consume()).catch(() => {});
  }

  startRoleLoop() {
    clearInterval(this.loop);
    this.loop = setInterval(() => {
      if (!this.bot?.entity) return;

      this.attackNearby();

      if (this.task === "follow" || this.task === "guard") return;
      if (this.task) return;

      if (this.role === "miner") this.gather("stone");
      else if (this.role === "gatherer") this.gather("wood");
      else if (this.role === "farmer") this.gather("food");
      else if (this.role === "scout") this.explore();
      else if (this.role === "guard") this.guard();
    }, 7000);
  }

  status() {
    return {
      name: this.name,
      role: this.role,
      state: this.state,
      task: this.task || "-"
    };
  }
}

module.exports = SquadBot;
