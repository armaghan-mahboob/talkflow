import Conversation from "../models/Conversation.js";

export const createConversation = async (req, res) => {
  try {
    const { participants } = req.body;

    if (!participants || participants.length !== 2) {
      return res.status(400).json({
        message: "Exactly two participants are required",
      });
    }

    // Check if a conversation already exists between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({ participants });
    }

    res.status(201).json({
      data: conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      participants: userId,
    }).populate("participants", "name email");

    res.json({
      data: conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
