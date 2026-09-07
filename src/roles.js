const ROLE_PLAN = [
  ["commander", 1],
  ["miner", 10],
  ["gatherer", 8],
  ["farmer", 5],
  ["builder", 4],
  ["scout", 5],
  ["logistics", 5],
  ["guard", 8],
  ["nether", 2],
  ["end", 2]
];

function makeRoles(count) {
  const result = [];
  for (const [role, amount] of ROLE_PLAN) {
    for (let i = 0; i < amount && result.length < count; i++) {
      result.push(role);
    }
  }
  while (result.length < count) result.push("gatherer");
  return result;
}

module.exports = { ROLE_PLAN, makeRoles };
