import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import http from "http";
import dbConnection from "./db/dbconfig.js";
import authRouter from "./router/authRouter.js";
import dotenv from "dotenv";
import userRouter from "./router/userRouter.js";
import { GetStatusOffline, getStatusUpdate } from "./socket/OnandOffline.js";
import { GetAndSavedMessages } from "./socket/Messages.js";
import messageRouter from "./router/messageRouter.js";
dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const onlineUsers = {};
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    // cleanup onlineUsers mapping
    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        console.log("Removed user from onlineUsers:", userId);
      }
    }
  });

  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("User mapped:", userId, socket.id);
  });

  socket.on("makeOneline", (data) => {
    console.log("User is online", data);
    getStatusUpdate(data);
  });

  socket.on("makeOffline", (data) => {
    console.log("User is offline", data);
    GetStatusOffline(data);
  });

  socket.on("NewMessage", (data) => {
    console.log("New message received", data);
    GetAndSavedMessages(data, onlineUsers);
  });
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/message", messageRouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/profilepicture", express.static("assets/profilepictures"));
server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
