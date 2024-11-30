import { Chat } from "../models/chatSchema.js";
import { verifyToken } from "../utils/tokenUtils.js";

export const setupSocketHandlers = (io) => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }
      
      const decoded = await verifyToken(token);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join personal room for private messages
    socket.join(socket.userId);

    // Handle joining specific chat rooms
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.userId} joined chat: ${chatId}`);
    });

    // Handle leaving chat rooms
    socket.on("leave_chat", (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.userId} left chat: ${chatId}`);
    });

    // Handle new messages
    socket.on("send_message", async (data) => {
      try {
        const { chatId, content } = data;
        
        const message = {
          sender: socket.userId,
          content,
          timestamp: new Date()
        };

        // Save message to database
        const chat = await Chat.findById(chatId);
        if (chat) {
          chat.messages.push(message);
          await chat.save();

          // Broadcast message to all users in the chat room
          io.to(chatId).emit("receive_message", {
            chatId,
            message
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", "Failed to send message");
      }
    });

    // Handle typing indicators
    socket.on("typing_start", (chatId) => {
      socket.to(chatId).emit("user_typing", {
        userId: socket.userId,
        chatId
      });
    });

    socket.on("typing_stop", (chatId) => {
      socket.to(chatId).emit("user_stopped_typing", {
        userId: socket.userId,
        chatId
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};
