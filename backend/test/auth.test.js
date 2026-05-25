import request from "supertest";
import { app, server } from "../src/server.js";
import mongoose from "mongoose";
import User from "../src/models/User.js";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
});

describe("Auth routes", () => {
  const userPayload = {
    name: "Test User",
    phone: "1234567890",
    email: "test@example.com",
    password: "Password123",
  };

  let token = "";

  test("POST /api/auth/register – success", async () => {
    const res = await request(app).post("/api/auth/register").send(userPayload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toMatchObject({
      name: userPayload.name,
      phone: userPayload.phone,
      email: userPayload.email,
    });
    token = res.body.token;
  });

  test("POST /api/auth/login – success", async () => {
    const res = await request(app).post("/api/auth/login").send({
      phoneOrEmail: userPayload.phone,
      password: userPayload.password,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(userPayload.email);
  });

  test("GET /api/users/me – protected route returns user profile", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      phone: userPayload.phone,
      email: userPayload.email,
    });
  });

  test("Rate limiting - more than 100 requests in 15 min returns 429", async () => {
    const promises = Array.from({ length: 101 }, () =>
      request(app).get("/api/users/me").set("Authorization", `Bearer ${token}`),
    );
    const results = await Promise.all(promises);
    const statusCodes = results.map((r) => r.status);
    expect(statusCodes).toContain(429);
  });
});
