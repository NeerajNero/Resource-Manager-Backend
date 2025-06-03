// backend/routes/auth.routes.js
import express from "express";
import { login, getProfile } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/profile  (protected)
router.get("/profile", protect, getProfile);

export default router;
