import http from "http";
import app from "./app.js";
import { config } from "dotenv";
config();

const server = http.createServer(app);

server.listen(process.env.PORT || 8080, () => {
  console.log(`Server running: http://localhost:${process.env.PORT}`);
});
