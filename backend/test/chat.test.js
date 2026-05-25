import request from "supertest";
import { app, server } from "../src/server.js";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import Chat from "../src/models/Chat.js";

let tokenA = "";
let tokenB = "";
let userAId = "";
let userBId = "";

beforeAll(async () => {
  const uri = process.env.MONGO_URI.replace(
    /whatsapp_clone/,
    "whatsapp_clone_test",
  );
  await mongoose.connect(uri);
  await Promise.all([User.deleteMany({}), Chat.deleteMany({})]);
  
  const userA = await request(app).post("/api/auth/register").send({
    name: "Alice",
    phone: "1111111111",
    password: "Pass123!",
  });
  tokenA = userA.body.token;
  userAId = userA.body.user.id;

  const userB = await request(app).post("/api/auth/register").send({
    name: "Bob",
    phone: "2222222222",
    password: "Pass123!",
  });
  tokenB = userB.body.token;
  userBId = userB.body.user.id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
});

describe("Chat flow", () => {
  let chatId = "";

  test("Create 1‑on‑1 chat (accessChat endpoint)", async () => {
    const res = await request(app)
      .post("/api/chats")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ participantId: userBId });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id");
    chatId = res.body._id;
    const participantIds = res.body.participants.map((p) => p._id);
    expect(participantIds).toEqual(expect.arrayContaining([userAId, userBId]));
  });

  test("Send a text message", async () => {
    const res = await request(app)
      .post(`/api/chats/${chatId}/message`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ content: "Hello Bob!" });
    expect(res.status).toBe(201);
    expect(res.body.content).toBe("Hello Bob!");
    expect(res.body.sender._id).toBe(userAId);
  });

  test("Retrieve last messages", async () => {
    const res = await request(app)
      .get(`/api/chats/${chatId}/messages?limit=10`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].content).toBe("Hello Bob!");
  });
});
