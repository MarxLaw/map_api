const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.json());
app.use("/mapping", require("../routes/mapping"));

describe("Mapping API", () => {
  it("POST /mapping/reports returns 404 when no data", async () => {
    const res = await request(app).post("/mapping/reports").send({});
    expect(res.statusCode).toBe(404);
  });
});
