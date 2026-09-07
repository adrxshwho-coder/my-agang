const TASKS = {
  wood: { blocks: ["oak_log", "birch_log", "spruce_log", "jungle_log", "acacia_log", "dark_oak_log", "mangrove_log", "cherry_log"] },
  stone: { blocks: ["stone", "cobblestone", "deepslate"] },
  coal: { blocks: ["coal_ore", "deepslate_coal_ore"] },
  iron: { blocks: ["iron_ore", "deepslate_iron_ore"] },
  diamond: { blocks: ["diamond_ore", "deepslate_diamond_ore"] },
  food: { blocks: ["wheat", "carrots", "potatoes", "beetroots"] }
};

const HOSTILES = new Set([
  "zombie", "skeleton", "spider", "creeper", "witch",
  "husk", "drowned", "stray", "enderman", "phantom",
  "pillager", "vindicator"
]);

module.exports = { TASKS, HOSTILES };
