const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use("/mapping", require("../routes/mapping"));

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mapping_test",
  );
});

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
