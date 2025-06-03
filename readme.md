# Engineering Resource Management System

A full‐stack application for managing engineering team assignments across projects.  
Built with React (TypeScript) + Tailwind (frontend) and Node.js + Express + Mongoose (backend).  

## Table of Contents

1. [Project Overview](#project-overview)  
2. [Core Features](#core-features)  
3. [Tech Stack](#tech-stack)  
4. [Getting Started](#getting-started)  
   - [Prerequisites](#prerequisites)  
   - [Clone & Install](#clone--install)  
   - [Environment Variables](#environment-variables)  
   - [Seeding the Database](#seeding-the-database)  
   - [Run Backend](#run-backend)  
   - [Run Frontend](#run-frontend)  
5. [Usage](#usage)  
   - [Manager Workflow](#manager-workflow)  
   - [Engineer Workflow](#engineer-workflow)  
6. [AI Tools & Workflow](#ai-tools--workflow)  
   - [Which AI Tools Were Used](#which-ai-tools-were-used)  
   - [How AI Accelerated Development](#how-ai-accelerated-development)  
   - [Challenges with AI-Generated Code](#challenges-with-ai-generated-code)  
   - [Validating AI Suggestions](#validating-ai-suggestions)  
7. [Testing & Validation](#testing--validation)  
8. [Deployment](#deployment)  
9. [Troubleshooting](#troubleshooting)  
10. [License](#license)  

---

## Project Overview

This application manages which engineers are assigned to which projects, tracks their capacity usage, and shows when they’ll be available next. It supports two user roles:

- **Manager**  
  - Create/Edit/Delete Projects  
  - Assign/Update/Delete Engineer Assignments  
  - See a dashboard of all engineers, their capacities, and availability  
  - View analytics (team utilization chart) and search/filter engineers by skill  
  - Perform skill‐gap analysis for any project  

- **Engineer**  
  - Log in and view only their own assignments and capacity  
  - View “My Profile” (edit skills, seniority, etc.)  

All data is persisted in MongoDB via Mongoose. Authentication is JWT‐based, with “engineer” vs. “manager” roles enforcing access control.

---

## Core Features

1. **Authentication & User Roles**  
   - JWT login (email + password) with two roles: `manager` and `engineer`.  
   - Engineers see only their own data; managers see everything.

2. **Engineer Management**  
   - CRUD for engineer profiles (name, skills, seniority, capacity, department).  
   - Capacity calculation: `maxCapacity − sum(activeAssignments)`.

3. **Project Management**  
   - CRUD for projects (name, description, dates, required skills, status, team size).  
   - Skill‐gap endpoint (`GET /api/projects/:id/skill-gap`).

4. **Assignment System**  
   - Assign engineers to projects with an allocation percentage (0–100).  
   - Capacity validation on create/update: cannot exceed `maxCapacity`.  
   - CRUD for assignments.

5. **Dashboard Views**  
   - **Manager Dashboard**:  
     - Team overview with capacity bars  
     - Search/filter engineers by skill  
     - Analytics chart (team‐wide utilization)  
     - Availability planning (next free date)  

   - **Engineer Dashboard**:  
     - My current and upcoming assignments  
     - My capacity bar  

6. **Search & Analytics**  
   - Filter engineers by skill substring.  
   - Filter projects by status (`planning`, `active`, `completed`).  
   - Recharts bar chart showing each engineer’s percent utilization.

7. **AI‐Powered Development Approach**  
   - AI tools were used throughout: Copilot, ChatGPT, etc.  
   - All AI‐generated code was manually validated.

---

## Tech Stack

- **Frontend**  
  - React + TypeScript  
  - Vite  
  - Tailwind CSS + ShadCN UI components  
  - React Hook Form (forms)  
  - Zustand (state management)  
  - Axios (HTTP client)  
  - Recharts (analytics chart)  
  - React Router v6  

- **Backend**  
  - Node.js + Express  
  - MongoDB with Mongoose  
  - JWT for authentication  
  - Bcrypt.js (password hashing)  
  - dotenv (env vars)  
  - cors  

- **Testing / Tools**  
  - Postman (API testing)  
  - MongoDB Compass (DB inspection)  
  - VSCode + GitHub Copilot + ChatGPT (AI assistance)  

---

## Getting Started

### Prerequisites

- **Node.js** v16+ & npm v8+  
- **MongoDB** (local or hosted)  
- **Git**  
- (Optional) yarn

### Clone & Install

```bash
# 1. Clone this repo
git clone https://github.com/NeerajNero/Resource-Manager-Frontend.git
cd resource‐manager

# 2. Install server (backend) dependencies
cd backend
npm install

# 3. Install client (frontend) dependencies
cd ../frontend
npm install
# Resource-Manager
