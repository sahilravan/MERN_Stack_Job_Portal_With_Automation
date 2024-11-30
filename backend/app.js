import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connection } from "./database/connection.js";
import { errorMiddleware } from "./middlewares/error.js";
import fileUpload from "express-fileupload";
import userRouter from "./routes/userRouter.js";
import jobRouter from "./routes/jobRouter.js";
import applicationRouter from "./routes/applicationRouter.js";
import chatRouter from "./routes/chatRouter.js";
import { newsLetterCron } from "./automation/newsLetterCron.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocketHandlers } from "./socket/socketHandlers.js";

const app = express();
config({ path: "./config.env" });

// Create HTTP server instance
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  }
});

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// API Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/chat", chatRouter);

// Initialize Socket.IO handlers
setupSocketHandlers(io);

newsLetterCron();
connection();
app.use(errorMiddleware);

// Export both app and server for proper socket.io integration
export { app, server };
