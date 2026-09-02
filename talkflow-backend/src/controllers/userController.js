import User from "../models/User.js";

export const lookupUser = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        message: "No user found with this email",
      });
    }

    res.json({
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Lookup user error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
