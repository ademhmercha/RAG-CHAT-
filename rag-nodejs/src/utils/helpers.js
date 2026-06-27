// General helper utilities.

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const truncate = (str, maxLength = 100) => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
};

const safeJsonParse = (str, fallback = {}) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

const now = () => new Date().toISOString();

module.exports = { sleep, truncate, safeJsonParse, now };
