// Redis cache client.
// Provides caching utilities for frequently accessed data (query results, session info).

const redis = require("redis");
const config = require("../../config");
const { info, error } = require("../utils/logger");

let client = null;

const getClient = async () => {
  if (!client) {
    client = redis.createClient({ url: config.redis.url });

    client.on("error", (err) => error("Redis error", err));
    client.on("connect", () => info("Redis connected"));

    await client.connect();
  }
  return client;
};

const get = async (key) => {
  const c = await getClient();
  const value = await c.get(key);
  return value ? JSON.parse(value) : null;
};

const set = async (key, value, ttlSeconds = 3600) => {
  const c = await getClient();
  await c.set(key, JSON.stringify(value), { EX: ttlSeconds });
};

const del = async (key) => {
  const c = await getClient();
  await c.del(key);
};

const disconnect = async () => {
  if (client) {
    await client.quit();
    client = null;
  }
};

module.exports = { get, set, del, disconnect };
