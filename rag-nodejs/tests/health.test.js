const request = require("supertest");
const app = require("../src/app");

describe("GET /health", () => {
  it("should return 200 with health status", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("uptime");
    expect(res.body.data).toHaveProperty("environment");
  });
});
