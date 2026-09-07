const SquadBot = require("./bot");
const { makeRoles } = require("./roles");

class SquadManager {
  constructor(config) {
    this.config = config;
    this.bots = [];
    this.roles = makeRoles(config.count);
  }

  start() {
    console.log(`Starting ${this.config.count} bots...`);
    this.roles.forEach((role, index) => {
      const bot = new SquadBot(this, index, role);
      this.bots.push(bot);
      setTimeout(() => bot.connect(), index * this.config.spawnDelay);
    });
  }

  online() {
    return this.bots.filter(b => b.state !== "offline").length;
  }

  handleChat(username, message) {
    if (username !== this.config.owner) return;
    if (!message.startsWith("!")) return;

    const parts = message.trim().split(/\s+/);
    const command = parts[0].toLowerCase();

    if (command === "!status") return this.status();
    if (command === "!follow") return this.broadcast(b => b.followOwner());
    if (command === "!stop") return this.broadcast(b => b.stopTask());
    if (command === "!guard") return this.broadcast(b => b.guard());
    if (command === "!explore") return this.byRole(["scout"], b => b.explore());
    if (command === "!gather" && parts[1]) return this.gather(parts[1].toLowerCase());
    if (command === "!auto") return this.auto();
    if (command === "!task" && parts.length >= 3) {
      const role = parts[1].toLowerCase();
      const task = parts.slice(2).join(" ");
      return this.byRole([role], b => this.runTask(b, task));
    }
  }

  runTask(bot, task) {
    if (task.startsWith("gather:")) return bot.gather(task.slice(7));
    if (task === "follow") return bot.followOwner();
    if (task === "explore") return bot.explore();
    if (task === "guard") return bot.guard();
  }

  gather(key) {
    const preferred = {
      wood: ["gatherer", "builder"],
      stone: ["miner", "builder"],
      coal: ["miner"],
      iron: ["miner"],
      diamond: ["miner"],
      food: ["farmer", "gatherer"]
    }[key] || ["miner"];

    this.byRole(preferred, b => b.gather(key));
  }

  auto() {
    this.gather("wood");
    this.gather("stone");
    this.gather("food");
    this.gather("iron");
    this.byRole(["scout"], b => b.explore());
    this.byRole(["guard"], b => b.guard());
  }

  byRole(roles, fn) {
    this.bots.filter(b => roles.includes(b.role)).forEach(fn);
  }

  broadcast(fn) {
    this.bots.forEach(fn);
  }

  status() {
    const counts = {};
    for (const b of this.bots) {
      counts[b.state] = (counts[b.state] || 0) + 1;
    }
    console.log("Squad status:", counts);
    console.table(this.bots.map(b => b.status()));
  }

  stopAll() {
    this.bots.forEach(b => b.stop());
  }
}

module.exports = SquadManager;
