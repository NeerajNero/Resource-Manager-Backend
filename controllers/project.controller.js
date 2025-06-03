// backend/controllers/project.controller.js
import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { Assignment } from "../models/Assignment.js";
import { User } from "../models/User.js";
/**
 * @desc    Get all projects
 * @route   GET /api/projects
 * @access  Private (any authenticated user)
 */
export const getProjects = async (req, res) => {
  try {
    // Populate manager’s name/email if you like:
    const projects = await Project.find()
      .populate("managerId", "name email");
    return res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * @desc    Get a project by ID
 * @route   GET /api/projects/:id
 * @access  Private (any authenticated user)
 */
export const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID." });
    }
    const project = await Project.findById(projectId)
      .populate("managerId", "name email");
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    return res.json(project);
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private (manager only)
 */
export const createProject = async (req, res) => {
  const {
    name,
    description,
    startDate,
    endDate,
    requiredSkills,
    teamSize,
    status,
  } = req.body;

  // req.user is attached by protect middleware
  const managerId = req.user._id;

  try {
    // Validate required fields
    if (
      !name ||
      !description ||
      !startDate ||
      !endDate ||
      !teamSize ||
      !status
    ) {
      return res
        .status(400)
        .json({ message: "Missing required project fields." });
    }

    // Create and save
    const newProject = new Project({
      name,
      description,
      startDate,
      endDate,
      requiredSkills: requiredSkills || [],
      teamSize,
      status,
      managerId,
    });

    const savedProject = await newProject.save();
    // Optionally populate manager info in the response:
    await savedProject.populate("managerId", "name email");

    return res.status(201).json(savedProject);
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const getSkillGap = async (req, res) => {
  try {
    const projectId = req.params.id;

    // 1) Validate projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID." });
    }

    // 2) Fetch project and its requiredSkills
    const project = await Project.findById(projectId).select("requiredSkills");
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    const requiredSkills = project.requiredSkills || [];

    // 3) Find all assignments for this project
    //    (you could filter by active dates, but for now include all)
    const assignments = await Assignment.find({ projectId }).select("engineerId");

    // 4) Get unique engineer IDs
    const engineerIds = assignments.map((a) => a.engineerId.toString());
    const uniqueEngineerIds = [...new Set(engineerIds)];

    // 5) Fetch those engineers and collect their skills
    const engineers = await User.find({
      _id: { $in: uniqueEngineerIds },
      role: "engineer",
    }).select("skills");

    // 6) Build a Set of all assigned skills
    const assignedSkillsSet = new Set();
    engineers.forEach((eng) => {
      eng.skills.forEach((skill) => {
        assignedSkillsSet.add(skill);
      });
    });
    const assignedSkills = Array.from(assignedSkillsSet);

    // 7) Compute missingSkills = requiredSkills - assignedSkills
    const missingSkills = requiredSkills.filter(
      (reqSkill) => !assignedSkillsSet.has(reqSkill)
    );

    return res.json({
      projectId,
      requiredSkills,
      assignedSkills,
      missingSkills,
    });
  } catch (err) {
    console.error("Error in getSkillGap:", err);
    return res
      .status(500)
      .json({ message: "Server error while computing skill gap." });
  }
};

/**
 * PUT /api/projects/:id
 * Updates a project’s fields (manager only).
 */
/**
 * PUT /api/projects/:id
 * Updates a project’s fields (manager only).
 */
export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const updates = req.body; // expect the same fields: name, description, dates, etc.

    // 1) Validate ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID." });
    }

    // 2) Find and update
    const updated = await Project.findByIdAndUpdate(
      projectId,
      { $set: updates },
      { new: true }
    ).populate("managerId", "name email");

    if (!updated) {
      return res.status(404).json({ message: "Project not found." });
    }

    return res.json(updated);
  } catch (err) {
    console.error("Error in updateProject:", err);
    return res
      .status(500)
      .json({ message: "Server error while updating project." });
  }
};
