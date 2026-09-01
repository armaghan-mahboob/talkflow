import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { sendOtpEmail } from "../utils/mailer.js";

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Account not found. Please sign up first.",
      });
    }

    // Remove previous OTP for this email
    await Otp.deleteMany({ email });

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // OTP expires after 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({
      email,
      otp,
      expiresAt,
    });

    // Temporary: display OTP in terminal
    console.log(`OTP for ${email}: ${otp}`);

    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);

      return res.status(500).json({
        message: "Failed to send OTP email. Please try again.",
      });
    }

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
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const otpRecord = await Otp.findOne({
      email,
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
    const user = await User.findOne({ email });

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
        email: user.email,
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
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        message: "Email and name are required",
      });
    }

    // Check if account already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // Create new user
    const user = await User.create({
      email,
      name,
    });

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        email: user.email,
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
