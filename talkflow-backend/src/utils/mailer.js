import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"TalkFlow" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your TalkFlow verification code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
};
