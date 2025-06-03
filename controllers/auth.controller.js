// backend/controllers/auth.controller.js
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

// @desc    Log in user & get JWT
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials (email not found)." });
    }

    // 2. Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid credentials (wrong password)." });
    }

    // 3. Sign JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 4. Return token + basic user info
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
};

// @desc    Get current user’s profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  // protect middleware has attached user to req.user
  const user = req.user;
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Optionally, you can fetch more details or populate as needed
  return res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    skills: user.skills,
    seniority: user.seniority,
    maxCapacity: user.maxCapacity,
  });
};
