const basePriority = {
  Electricity: "High",
  Water: "High",
  Road: "Medium",
  Garbage: "Low",
  Other: "Low",
};

const levels = ["Low", "Medium", "High", "Critical"];

export function calculatePriority(category, upvotes) {
  let index = levels.indexOf(basePriority[category] || "Low");

  if (upvotes >= 15) index = levels.length - 1;
  else if (upvotes >= 5) index = Math.min(index + 1, levels.length - 1);

  return levels[index];
}
