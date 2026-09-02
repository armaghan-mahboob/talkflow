import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
  try {
    const { conversation, sender, content } = req.body;

    if (!conversation || !sender || !content) {
      return res.status(400).json({
        message: "Conversation, sender, and content are required",
      });
    }

    const message = await Message.create({
      conversation,
      sender,
      content,
    });

    res.status(201).json({
      message: "Message sent",
      data: message,
    });
  } catch (error) {
    console.error("Send message error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversation: conversationId }).sort({
      createdAt: 1,
    });

    res.json({
      data: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
