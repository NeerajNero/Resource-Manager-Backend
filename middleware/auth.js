// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // Expect “Authorization: Bearer <token>” in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token string
      token = req.headers.authorization.split(" ")[1];
      // Verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user (omit password)
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found." });
      }
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token invalid." });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token." });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
};