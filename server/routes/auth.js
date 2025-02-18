import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import pool from "../config/db.js";
import { auth } from "../middleware/auth.js";
import { sendOTP } from "../utils/email.js"; // Import the sendOTP function

const router = express.Router();

// Temporary storage for OTPs (replace with database in production)
const otpStorage = new Map();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    // Check if user already exists (in temporary storage or main database)
    const [existingUser] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (otpStorage.has(email)) {
      return res
        .status(400)
        .json({ message: "Email already has a pending verification" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    // Hash the OTP
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp.toString(), salt);

    // Store the hashed OTP and user data temporarily
    otpStorage.set(email, {
      name,
      password: password, // Store the plain password temporarily
      hashedOtp,
    });

    // Send OTP email
    try {
      await sendOTP(email, otp);
      res.status(200).json({
        message: "OTP sent to email for verification",
      });
    } catch (sendError) {
      console.error("Failed to send OTP email:", sendError);
      return res
        .status(500)
        .json({ message: "Failed to send OTP. Please try again." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const storedData = otpStorage.get(email);

    if (!storedData) {
      return res
        .status(400)
        .json({ message: "OTP expired or email not found" });
    }

    const { name, password, hashedOtp } = storedData;

    // Verify OTP
    const isMatch = await bcrypt.compare(otp.toString(), hashedOtp);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in the database
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    // Remove OTP from temporary storage
    otpStorage.delete(email);

    const token = jwt.sign(
      { id: result.insertId, isAdmin: false },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({ message: "Logged in successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: "Logged out successfully" });
});

router.get("/me", auth, async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, name, email, isAdmin FROM users WHERE id = ?",
      [req.user?.id]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;