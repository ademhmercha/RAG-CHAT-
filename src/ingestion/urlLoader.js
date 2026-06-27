// URL content loader.
// Fetches a web page via HTTP and extracts its visible text.

const axios = require("axios");

const extract = async (url) => {
  const response = await axios.get(url, { timeout: 30000 });
  const html = response.data;

  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return text;
};

module.exports = { extract };
