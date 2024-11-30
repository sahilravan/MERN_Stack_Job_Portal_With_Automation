const Chat = require('../models/chatSchema.js');

const chatController = {
  // Create a new chat
  createChat: async (req, res) => {
    try {
      const { participants, jobApplication } = req.body;
      const newChat = new Chat({
        participants,
        jobApplication,
        messages: []
      });
      await newChat.save();
      res.status(201).json(newChat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get chat history
  getChatHistory: async (req, res) => {
    try {
      const { chatId } = req.params;
      const chat = await Chat.findById(chatId)
        .populate('participants', 'name email')
        .populate('messages.sender', 'name email');
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all chats for a user
  getUserChats: async (req, res) => {
    try {
      const { userId } = req.params;
      const chats = await Chat.find({ participants: userId })
        .populate('participants', 'name email')
        .populate('jobApplication', 'title');
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = chatController;
