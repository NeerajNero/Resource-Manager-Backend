// backend/controllers/assignment.controller.js

import { Assignment } from "../models/Assignment.js";
import { User } from "../models/User.js";
import { Project } from "../models/Project.js";
import mongoose from "mongoose";

/**
 * @desc    Get assignments
 * @route   GET /api/assignments
 * @access  Private (manager sees all; engineer only their own)
 */
export const getAssignments = async (req, res) => {
  try {
    let assignments;

    if (req.user.role === "manager") {
      // Manager: return all assignments, populated
      assignments = await Assignment.find()
        .populate("engineerId", "name email")
        .populate("projectId", "name");
    } else {
      // Engineer: only show assignments where engineerId === req.user._id
      assignments = await Assignment.find({ engineerId: req.user._id })
        .populate("engineerId", "name email")
        .populate("projectId", "name");
    }

    return res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * Helper to calculate overlapping allocation sum for an engineer within a date range.
 * Excludes `excludeAssignmentId` when updating.
 */
const calculateOverlappingAllocation = async (
  engineerId,
  newStart,
  newEnd,
  excludeAssignmentId = null
) => {
  // Find assignments for this engineer where date ranges overlap with [newStart, newEnd]:
  // Condition: existing.startDate <= newEnd && existing.endDate >= newStart
  const query = {
    engineerId,
    startDate: { $lte: newEnd },
    endDate: { $gte: newStart },
  };
  if (excludeAssignmentId) {
    query._id = { $ne: excludeAssignmentId };
  }
  const overlappingAssignments = await Assignment.find(query);

  // Sum their allocationPercentages
  return overlappingAssignments.reduce(
    (sum, a) => sum + a.allocationPercentage,
    0
  );
};

/**
 * @desc    Create a new assignment
 * @route   POST /api/assignments
 * @access  Private (manager only)
 */

export const createAssignment = async (req, res) => {
  try {
    const {
      engineerId,
      projectId,
      allocationPercentage,
      startDate,
      endDate,
      role,
    } = req.body;

    // 1) Validate engineerId + projectId
    if (
      !mongoose.Types.ObjectId.isValid(engineerId) ||
      !mongoose.Types.ObjectId.isValid(projectId)
    ) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    // 2) Fetch engineer to get maxCapacity
    const engineer = await User.findById(engineerId).select("maxCapacity");
    if (!engineer) {
      return res.status(404).json({ message: "Engineer not found." });
    }

    // 3) Sum up existing active assignments for this engineer
    const now = new Date();
    const activeAssignments = await Assignment.find({
      engineerId,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    const totalAllocatedSoFar = activeAssignments.reduce(
      (sum, a) => sum + a.allocationPercentage,
      0
    );

    // 4) Check if adding this new assignment would exceed capacity
    const newTotal = totalAllocatedSoFar + allocationPercentage;
    if (newTotal > engineer.maxCapacity) {
      return res
        .status(400)
        .json({ message: "Engineer’s capacity would be exceeded." });
    }

    // 5) All good—create the assignment
    const newAssignment = new Assignment({
      engineerId,
      projectId,
      allocationPercentage,
      startDate,
      endDate,
      role,
    });

    const saved = await newAssignment.save();

    // 6) Populate before returning
    const populated = await Assignment.findById(saved._id)
      .populate("engineerId", "name email")
      .populate("projectId", "name");

    return res.status(201).json(populated);
  } catch (err) {
    console.error("Error in createAssignment:", err);
    return res
      .status(500)
      .json({ message: "Server error while creating assignment." });
  }
};

/**
 * @desc    Update an existing assignment
 * @route   PUT /api/assignments/:id
 * @access  Private (manager only)
 */
export const updateAssignment = async (req, res) => {
  const assignmentId = req.params.id;
  const {
    engineerId,
    projectId,
    allocationPercentage,
    startDate,
    endDate,
    role,
  } = req.body;

  try {
    // 1. Find the existing assignment
    const existing = await Assignment.findById(assignmentId);
    if (!existing) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    // 2. Determine new values (fall back to existing if not provided)
    const newEngineerId = engineerId || existing.engineerId.toString();
    const newProjectId = projectId || existing.projectId.toString();
    const newAlloc =
      allocationPercentage != null
        ? allocationPercentage
        : existing.allocationPercentage;
    const newStart = startDate ? new Date(startDate) : existing.startDate;
    const newEnd = endDate ? new Date(endDate) : existing.endDate;

    if (newEnd < newStart) {
      return res
        .status(400)
        .json({ message: "endDate must be on or after startDate." });
    }

    // 3. Verify engineer exists and is “engineer”
    const engineer = await User.findById(newEngineerId);
    if (!engineer || engineer.role !== "engineer") {
      return res.status(404).json({ message: "Engineer not found." });
    }

    // 4. Verify project exists
    const project = await Project.findById(newProjectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // 5. Calculate overlapping allocation for this engineer, excluding this assignment
    const currentAllocatedExcl = await calculateOverlappingAllocation(
      newEngineerId,
      newStart,
      newEnd,
      assignmentId
    );

    if (currentAllocatedExcl + newAlloc > engineer.maxCapacity) {
      return res.status(400).json({
        message: `Cannot update: allocation (${newAlloc}%) + existing (${currentAllocatedExcl}%) exceeds engineer's max capacity (${engineer.maxCapacity}%).`,
      });
    }

    // 6. Update fields on the existing assignment
    existing.engineerId = newEngineerId;
    existing.projectId = newProjectId;
    existing.allocationPercentage = newAlloc;
    existing.startDate = newStart;
    existing.endDate = newEnd;
    if (role) existing.role = role;

    await existing.save();
    const populated = await Assignment.findById(existing._id)
  .populate("engineerId", "name email")
  .populate("projectId", "name");

    return res.json(populated);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * @desc    Delete an assignment
 * @route   DELETE /api/assignments/:id
 * @access  Private (manager only)
 */
export const deleteAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;

    // 1) Validate ID format
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignment ID." });
    }

    // 2) Try to find & delete in one step
    const deleted = await Assignment.findByIdAndDelete(assignmentId);

    if (!deleted) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    res.json({ message: "Assignment deleted successfully." });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
