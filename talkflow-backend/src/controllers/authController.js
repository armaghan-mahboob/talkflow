import Otp from "../models/Otp.js";
import User from "../models/User.js";

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    // Check if the user exists
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        message: "Account not found. Please sign up first.",
      });
    }

    // Remove previous OTP for this phone
    await Otp.deleteMany({ phone });

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // OTP expires after 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({
      phone,
      otp,
      expiresAt,
    });

    // Temporary: display OTP in terminal
    console.log(`OTP for ${phone}: ${otp}`);

    res.json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        message: "Phone number and OTP are required",
      });
    }

    const otpRecord = await Otp.findOne({
      phone,
      otp,
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // Check whether the user already exists
    const user = await User.findOne({ phone });

    if (!user) {
      await Otp.deleteOne({ _id: otpRecord._id });

      return res.status(404).json({
        message: "Account not found. Please sign up first.",
      });
    }

    // OTP is valid and user exists
    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { phone, name } = req.body;

    if (!phone || !name) {
      return res.status(400).json({
        message: "Phone number and name are required",
      });
    }

    // Check if account already exists
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this phone number already exists",
      });
    }

    // Create new user
    const user = await User.create({
      phone,
      name,
    });

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
