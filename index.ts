import app from "@/app";
import { prisma } from "@/lib/prisma";
import http from "http";
import { setupWebSocket } from "./src/websocket";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    console.log("🔄 Connecting to database...");
    await prisma.$connect();
    console.log("✅ Database connected");

    const server = http.createServer(app);
    setupWebSocket(server);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`💬 WebSocket server attached on path /ws`);
    });
  } catch (error) {
    console.error("❌ Failed to start server", error);
    process.exit(1);
  }
}

startServer();

