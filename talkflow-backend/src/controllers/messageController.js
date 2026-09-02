import Message from "../models/Message.js";

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
