import express from "express";
import apiRouter from "@/routers"

const app = express();

app.use(express.json());

// API ROUTES V1
app.use("/api/v1", apiRouter);


// DEFAULT ROUTES
app.get("/", (_, res) => {
  res.send("API is running");
});

export default app;
