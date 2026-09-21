import Conversation from "../models/Conversation.js";

export const createConversation = async (req, res) => {
  try {
    const { participants } = req.body;

    if (!participants || participants.length !== 2) {
      return res.status(400).json({
        message: "Exactly two participants are required",
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: 2 },
    });

    let isNew = false;

    if (!conversation) {
      conversation = await Conversation.create({ participants });
      isNew = true;
    }

    conversation = await conversation.populate(
      "participants",
      "name email publicKey",
    );

    if (isNew) {
      const io = req.app.get("io");
      const onlineUsers = req.app.get("onlineUsers");

      participants.forEach((participantId) => {
        const socketId = onlineUsers.get(participantId);

        if (socketId) {
          io.to(socketId).emit("new-conversation", conversation);
        }
      });
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
    }).populate("participants", "name email publicKey");

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
