require("dotenv").config();

const count = Math.max(1, Math.min(50, Number(process.env.BOT_COUNT || 50)));

module.exports = {
  host: process.env.MC_HOST || "localhost",
  port: Number(process.env.MC_PORT || 25565),
  version: process.env.MC_VERSION || false,
  auth: process.env.MC_AUTH || "offline",
  owner: process.env.MC_OWNER || "Owner",
  count,
  prefix: process.env.BOT_PREFIX || "EDITH",
  spawnDelay: Number(process.env.SPAWN_DELAY_MS || 2500),
  reconnectDelay: Number(process.env.RECONNECT_DELAY_MS || 8000)
};
