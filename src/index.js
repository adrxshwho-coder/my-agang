const config = require("./config");
const SquadManager = require("./manager");

const manager = new SquadManager(config);

console.log("======================================");
console.log("   MINECRAFT 50-BOT SURVIVAL SQUAD");
console.log("======================================");
console.log(`Server: ${config.host}:${config.port}`);
console.log(`Bots:   ${config.count}`);
console.log(`Owner:  ${config.owner}`);
console.log("--------------------------------------");

manager.start();

process.on("SIGINT", () => {
  console.log("\nStopping squad...");
  manager.stopAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  manager.stopAll();
  process.exit(0);
});
