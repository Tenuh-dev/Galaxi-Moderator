const fs = require("fs");
const path = require("path");

const dbPath = path.join(
  __dirname,
  "..",
  "database",
  "warnings.json"
);

function getWarnings() {
  try {
    const data = fs.readFileSync(dbPath, "utf8");

    if (!data.trim()) {
      return {};
    }

    return JSON.parse(data);

  } catch {
    return {};
  }
}

function saveWarnings(data) {
  fs.writeFileSync(
    dbPath,
    JSON.stringify(data, null, 2)
  );
}

function addWarning(userId) {
  const warnings = getWarnings();

  if (!warnings[userId]) {
    warnings[userId] = 0;
  }

  warnings[userId]++;

  saveWarnings(warnings);

  return warnings[userId];
}

function getWarningCount(userId) {
  const warnings = getWarnings();

  return warnings[userId] || 0;
}

function clearWarnings(userId) {
  const warnings = getWarnings();

  delete warnings[userId];

  saveWarnings(warnings);
}

module.exports = {
  addWarning,
  getWarningCount,
  clearWarnings
};
