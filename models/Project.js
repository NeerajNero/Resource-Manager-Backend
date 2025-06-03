import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
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
    requiredSkills: [{
        type: String
    }],
    teamSize: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['planning', 'active', 'completed'],
        required: true
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

export const Project = mongoose.model('Project', projectSchema, "resourceManager-projects")