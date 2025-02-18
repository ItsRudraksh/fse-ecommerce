import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      html: `<p>Your OTP for email verification is: <b>${otp}</b></p>`,
    });
    console.log("OTP sent successfully to ${email}");
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};