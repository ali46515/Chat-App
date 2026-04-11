import http from "http";
import app from "./app.js";
import { config } from "dotenv";
import { initSocket } from "./modules/WebSocket/socket.js";
config();

const server = http.createServer(app);

initSocket(server);

server.listen(process.env.PORT || 8080, () => {
  console.log(`Server running: http://localhost:${process.env.PORT}`);
});
