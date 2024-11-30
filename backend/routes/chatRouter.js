import express from "express";
import { isAuthenticated, isAuthorized, isChatParticipant, canInitiateChat, validateChatAccess } from "../middlewares/auth.js";
import { 
    createChat,
    getChat,
    getUserChats,
    sendMessage,
    deleteChat,
    markMessagesAsRead
} from "../controllers/chatController.js";

const router = express.Router();

// Chat creation and management routes
router.post("/create", isAuthenticated, canInitiateChat,validateChatAccess,createChat);

router.get("/get/:chatId", isAuthenticated, isChatParticipant, getChat);

router.get("/my-chats",isAuthenticated,getUserChats);

// Message management routes
router.post( "/message/:chatId", isAuthenticated, isChatParticipant, sendMessage);

router.put("/mark-read/:chatId", isAuthenticated, isChatParticipant, markMessagesAsRead);

// Chat deletion route
router.delete( "/delete/:chatId", isAuthenticated, isChatParticipant, deleteChat);

export default router;
