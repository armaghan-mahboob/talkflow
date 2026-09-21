import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import Message from "./models/Message.js";
import Conversation from "./models/Conversation.js";

import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

connectDB();

const onlineUsers = new Map(); // userId -> socketId

app.set("io", io);
app.set("onlineUsers", onlineUsers);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "TalkFlow server is running" });
});

const PORT = process.env.PORT || 5000;

function broadcastOnlineUsers() {
  io.emit("online-users", Array.from(onlineUsers.keys()));
}

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;

  console.log("Socket connected:", socket.id, "user:", userId);

  if (userId) {
    onlineUsers.set(userId, socket.id);
    broadcastOnlineUsers();
  }

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", socket.id, reason);

    if (userId) {
      onlineUsers.delete(userId);
      broadcastOnlineUsers();
    }
  });

  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on(
    "send-message",
    async ({ conversation, sender, ciphertext, nonce }) => {
      try {
        const message = await Message.create({
          conversation,
          sender,
          ciphertext,
          nonce,
          encrypted: true,
        });

        io.to(conversation).emit("receive-message", message);

        const conversationDoc = await Conversation.findById(conversation);

        if (conversationDoc) {
          conversationDoc.participants.forEach((participantId) => {
            const participantIdStr = participantId.toString();

            if (participantIdStr !== sender) {
              const socketId = onlineUsers.get(participantIdStr);

              if (socketId) {
                io.to(socketId).emit("new-message-notification", {
                  conversation,
                });
              }
            }
          });
        }
      } catch (error) {
        console.error("Send message socket error:", error);
      }
    },
  );
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
