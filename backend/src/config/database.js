import mongoose from "mongoose";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

expand(config());

export default async function connectMongo() {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected succesfully!");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err.message);
    });
}
