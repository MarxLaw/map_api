const request = require("supertest");
const express = require("express");
const mongoose = require("../database/mongo"); // this already connects

const app = express();
app.use(express.json());
app.use("/mapping", require("../routes/mapping"));

afterAll(async () => {
  await mongoose.connection.close();
});

it("connects to MongoDB successfully", async () => {
  expect(mongoose.connection.readyState).toBe(1);
});

it("POST /mapping/reports returns 404 when db is empty", async () => {
  const res = await request(app).post("/mapping/reports").send({});
  expect(res.statusCode).toBe(404);
});
