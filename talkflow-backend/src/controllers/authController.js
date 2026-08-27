import Otp from "../models/Otp.js";

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    await Otp.deleteMany({ phone });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({
      phone,
      otp,
      expiresAt,
    });

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

    // OTP is valid
    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
