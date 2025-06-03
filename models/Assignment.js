import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    engineerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    allocationPercentage: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true
    },
    role: {
        type: String,
        enum: ["Developer", "Tech Lead", "QA", "Designer", "DevOps", "Other"],
        default: "Developer"
    }
})

export const Assignment = mongoose.model('Assignment', assignmentSchema, "resourceManager-assignments")