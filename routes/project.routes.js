// backend/routes/project.routes.js

import express from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  getSkillGap,
  updateProject
} from "../controllers/project.controller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET /api/projects
// - Any authenticated user can view the list
router.get("/", protect, getProjects);

// GET /api/projects/:id
// - Any authenticated user can view a specific project
router.get("/:id", protect, getProjectById);

// POST /api/projects
// - Only managers should be allowed to create
router.post("/", protect, authorize("manager"), createProject);

router.get("/:id/skill-gap",protect,requireRole("manager"),getSkillGap );

router.put(
  "/:id",
  protect,
  requireRole("manager"),
  updateProject
);

export default router;
