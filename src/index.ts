import express from "express";
import { json } from "body-parser";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes";
import conversationRoutes from "./routes/conversationRoutes";
import messageRoutes from "./routes/messageRoutes";
import { saveMessage } from "./controllers/messagesController";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: "*",
  },
});

app.use(json());
app.use("/auth", authRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation ${conversationId}`);
  });

  socket.on("sendMessage", async (message) => {
    const { conversationId, senderId, content } = message;

    console.log("Received message:", message);

    try {
      const savedMessage = await saveMessage(conversationId, senderId, content);
      console.log("Saved message:", savedMessage);

      io.to(conversationId).emit("newMessage", savedMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
