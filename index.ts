import app from "@/app";
import { prisma } from "@/lib/prisma";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    console.log("🔄 Connecting to database...");
    await prisma.$connect();
    console.log("✅ Database connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server", error);
    process.exit(1);
  }
}

startServer();

