// backend/routes/assignment.routes.js

import express from "express";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignment.controller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
const router = express.Router();

// GET /api/assignments
// - Managers see all; engineers see only their own
router.get("/", protect, getAssignments);

// POST /api/assignments
// - Only managers can create
router.post("/", protect, authorize("manager"), createAssignment);

// PUT /api/assignments/:id
// - Only managers can update
router.put("/:id", protect, authorize("manager"), updateAssignment);

// DELETE /api/assignments/:id
// - Only managers can delete
router.delete("/:id", protect, authorize("manager"), deleteAssignment);

export default router;
