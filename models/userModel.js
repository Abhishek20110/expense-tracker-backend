import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    phone: {
        type: String,
        required: true,
        // match: /^\d{3}-\d{3}-\d{4}$/, // Validate phone number format
    },
    role: {
        type: String,
        enum: ['admin', 'moderator', 'user'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    is_del: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, // Automatically update createdAt and updatedAt fields
});

const User = mongoose.model("User", userSchema);

export default User;