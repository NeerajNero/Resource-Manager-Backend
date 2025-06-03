// backend/seed/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";

// Import your models so we can use them
import { User } from "../models/User.js";
import { Project } from "../models/Project.js";
import { Assignment } from "../models/Assignment.js";

dotenv.config();

// 1) Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

// 2) Define sample data
const sampleUsers = [
  // Managers
  {
    email: "mgr1@example.com",
    name: "Manager One",
    role: "manager",
    department: "Operations",
    password: "mgrpass1",
  },
  {
    email: "mgr2@example.com",
    name: "Manager Two",
    role: "manager",
    department: "Engineering",
    password: "mgrpass2",
  },

  // Engineers (full-time)
  {
    email: "eng1@example.com",
    name: "Alice Engineer",
    role: "engineer",
    department: "Frontend",
    skills: ["React", "Node.js"],
    seniority: "mid",
    maxCapacity: 100, // full-time
    password: "engpass1",
  },
  {
    email: "eng2@example.com",
    name: "Bob Engineer",
    role: "engineer",
    department: "Backend",
    skills: ["Node.js", "Python"],
    seniority: "senior",
    maxCapacity: 100,
    password: "engpass2",
  },

  // Engineer (part-time)
  {
    email: "eng3@example.com",
    name: "Charlie Engineer",
    role: "engineer",
    department: "DevOps",
    skills: ["DevOps", "Docker", "AWS"],
    seniority: "junior",
    maxCapacity: 50, // part-time
    password: "engpass3",
  },
];

const sampleProjects = [
  {
    name: "Project Apollo",
    description: "Frontend redesign using React + TypeScript",
    startDate: new Date("2025-06-01"),
    endDate: new Date("2025-09-30"),
    requiredSkills: ["React", "TypeScript"],
    teamSize: 3,
    status: "active",
    // We'll fill managerId after inserting users
  },
  {
    name: "Project Zeus",
    description: "Backend APIs with Node.js and MongoDB",
    startDate: new Date("2025-07-15"),
    endDate: new Date("2025-11-15"),
    requiredSkills: ["Node.js", "MongoDB"],
    teamSize: 2,
    status: "planning",
  },
  {
    name: "Project Hermes",
    description: "DevOps pipeline and AWS infra setup",
    startDate: new Date("2025-05-01"),
    endDate: new Date("2025-08-01"),
    requiredSkills: ["DevOps", "AWS"],
    teamSize: 2,
    status: "active",
  },
];

const sampleAssignments = [
  // We'll fill engineerId and projectId after inserting users/projects
  {
    allocationPercentage: 50,
    startDate: new Date("2025-06-01"),
    endDate: new Date("2025-09-30"),
    role: "Developer",
  },
  {
    allocationPercentage: 50,
    startDate: new Date("2025-07-15"),
    endDate: new Date("2025-11-15"),
    role: "Tech Lead",
  },
  {
    allocationPercentage: 50,
    startDate: new Date("2025-05-01"),
    endDate: new Date("2025-08-01"),
    role: "DevOps",
  },
  {
    allocationPercentage: 100,
    startDate: new Date("2025-06-15"),
    endDate: new Date("2025-09-15"),
    role: "Developer",
  },
  {
    allocationPercentage: 50,
    startDate: new Date("2025-06-01"),
    endDate: new Date("2025-09-30"),
    role: "Developer",
  },
];

// 3) Seed function
const seed = async () => {
  try {
    // Connect
    await connectDB();

    // Optional: clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Assignment.deleteMany({});
    console.log("Cleared existing collections");

    // Insert Users (managers + engineers)
    const createdUsers = [];
    for (const u of sampleUsers) {
      const newUser = new User(u); // `pre("save")` hook will hash password automatically
      const savedUser = await newUser.save();
      createdUsers.push(savedUser);
    }
    console.log(`Inserted ${createdUsers.length} users`);

    // Map managers to projects
    // For simplicity: assign mgr1 to first project, mgr2 to second, mgr1 to third
    const manager1 = createdUsers.find((u) => u.role === "manager" && u.email === "mgr1@example.com");
    const manager2 = createdUsers.find((u) => u.role === "manager" && u.email === "mgr2@example.com");

    // Insert Projects
    const createdProjects = [];
    sampleProjects[0].managerId = manager1._id;
    sampleProjects[1].managerId = manager2._id;
    sampleProjects[2].managerId = manager1._id;

    for (const p of sampleProjects) {
      const newProject = new Project(p);
      const savedProject = await newProject.save();
      createdProjects.push(savedProject);
    }
    console.log(`Inserted ${createdProjects.length} projects`);

    // Now insert Assignments
    // We want to link each assignment to an engineer and a project.
    // Let’s pick:
    //  - assignment[0] → eng1 on project[0]
    //  - assignment[1] → eng2 on project[1]
    //  - assignment[2] → eng3 on project[2]
    //  - assignment[3] → eng1 on project[1]
    //  - assignment[4] → eng2 on project[0]

    const engineer1 = createdUsers.find((u) => u.role === "engineer" && u.email === "eng1@example.com");
    const engineer2 = createdUsers.find((u) => u.role === "engineer" && u.email === "eng2@example.com");
    const engineer3 = createdUsers.find((u) => u.role === "engineer" && u.email === "eng3@example.com");

    // Link them up:
    sampleAssignments[0].engineerId = engineer1._id; // eng1 → Apollo
    sampleAssignments[0].projectId = createdProjects[0]._id;

    sampleAssignments[1].engineerId = engineer2._id; // eng2 → Zeus
    sampleAssignments[1].projectId = createdProjects[1]._id;

    sampleAssignments[2].engineerId = engineer3._id; // eng3 → Hermes
    sampleAssignments[2].projectId = createdProjects[2]._id;

    sampleAssignments[3].engineerId = engineer1._id; // eng1 → Zeus (overlaps 50%)
    sampleAssignments[3].projectId = createdProjects[1]._id;

    sampleAssignments[4].engineerId = engineer2._id; // eng2 → Apollo (50% overlap)
    sampleAssignments[4].projectId = createdProjects[0]._id;

    const createdAssignments = [];
    for (const a of sampleAssignments) {
      const newAssignment = new Assignment(a);
      const savedAssignment = await newAssignment.save();
      createdAssignments.push(savedAssignment);
    }
    console.log(`Inserted ${createdAssignments.length} assignments`);

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seed();
