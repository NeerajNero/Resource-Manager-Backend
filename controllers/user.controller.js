// backend/controllers/user.controller.js
import mongoose from "mongoose";
import { User } from "../models/user.js";
import { Assignment } from "../models/Assignment.js";

/**
 * @desc    Get all engineers (users with role === "engineer")
 * @route   GET /api/engineers
 * @access  Private (manager only)
 */
export const getEngineers = async (req, res) => {
  try {
    // Find all users whose role is "engineer"
    const engineers = await User.find({ role: "engineer" }).select(
      "-password"
    );
    return res.json(engineers);
  } catch (error) {
    console.error("Error fetching engineers:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * @desc    Get an engineer's available capacity
 * @route   GET /api/engineers/:id/capacity
 * @access  Private (manager or the engineer themself)
 */
export const getEngineerCapacity = async (req, res) => {
  const engineerId = req.params.id;

  // 1. Authorization check: only a manager or the engineer themself can access this endpoint
  if (
    req.user.role !== "manager" &&
    req.user._id.toString() !== engineerId
  ) {
    return res.status(403).json({ message: "Forbidden." });
  }

  try {
    // 2. Fetch the engineer’s basic info
    const engineer = await User.findById(engineerId).select(
      "name maxCapacity role"
    );
    if (!engineer || engineer.role !== "engineer") {
      return res.status(404).json({ message: "Engineer not found." });
    }

    // 3. Determine active assignments for "now"
    const now = new Date();
    // Active if assignment.startDate <= now <= assignment.endDate
    const activeAssignments = await Assignment.find({
      engineerId,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    // 4. Sum up the allocationPercentages of active assignments
    const totalAllocated = activeAssignments.reduce(
      (sum, a) => sum + a.allocationPercentage,
      0
    );

    // 5. Compute available capacity
    let available = engineer.maxCapacity - totalAllocated;
    if (available < 0) available = 0;

    // 6. Return the capacity information
    return res.json({
      engineerId,
      name: engineer.name,
      maxCapacity: engineer.maxCapacity,
      totalAllocated,
      availableCapacity: available,
      activeAssignmentsCount: activeAssignments.length,
    });
  } catch (error) {
    console.error("Error calculating capacity:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const getEngineerAvailability = async (req, res) => {
  try {
    const engineerId = req.params.id;

    // 1) Validate engineerId
    if (!mongoose.Types.ObjectId.isValid(engineerId)) {
      return res.status(400).json({ message: "Invalid engineer ID." });
    }

    // 2) Fetch the engineer to get maxCapacity
    const engineer = await User.findById(engineerId).select("maxCapacity");
    if (!engineer) {
      return res.status(404).json({ message: "Engineer not found." });
    }

    const now = new Date();

    // 3) Fetch ALL assignments for this engineer
    //    (no date filter; we need every endDate to find the furthest one)
    const allAssignments = await Assignment.find({ engineerId }).select(
      "allocationPercentage startDate endDate"
    );

    // 4) Compute how much is allocated right now
    //    (sum allocationPercentage for assignments whose startDate ≤ now ≤ endDate)
    const allocatedNow = allAssignments
      .filter((a) => a.startDate <= now && a.endDate >= now)
      .reduce((sum, a) => sum + a.allocationPercentage, 0);

    // 5) If they have any free capacity today, return today’s date
    if (allocatedNow < engineer.maxCapacity) {
      return res.json({ availableDate: now.toISOString() });
    }

    // 6) Otherwise, find the maximum endDate across all their assignments
    //    (this is when they truly become free again)
    let latestEnd = now;
    allAssignments.forEach((a) => {
      if (a.endDate > latestEnd) {
        latestEnd = a.endDate;
      }
    });

    return res.json({ availableDate: latestEnd.toISOString() });
  } catch (err) {
    console.error("Error in getEngineerAvailability:", err);
    return res
      .status(500)
      .json({ message: "Server error while computing availability." });
  }
};