// backend/routes/user.routes.js

import express from "express";
import {
  getEngineers,
  getEngineerCapacity,
  getEngineerAvailability
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET /api/engineers
// - Only managers can list all engineers
router.get("/", protect, authorize("manager"), getEngineers);

// GET /api/engineers/:id/capacity
// - Managers or the engineer themself can view capacity
router.get("/:id/capacity", protect, getEngineerCapacity);

router.get("/:id/availability",protect,(req, res, next) => {
    if (
      req.user.role === "manager" ||
      req.user._id.toString() === req.params.id
    ) {
      return next();
    }
    return res.status(403).json({ message: "Forbidden" });
  },
  getEngineerAvailability
);

export default router;
