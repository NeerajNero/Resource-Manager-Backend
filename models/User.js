import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['engineer', 'manager'],
        required: true
    },
    skills: [{
        type: String
    }],
    seniority: {
        type: String,
        enum: ['junior', 'mid', 'senior'],
        required: function () {
            return this.role === 'engineer'
        }
    },
    maxCapacity: {
        type: Number,
        enum: [50, 100],
        required: function () {
            return this.role === "engineer"
        }
    },
    department: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    try{
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        return next()
    }catch(error){
        return next(error)
    }
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema)