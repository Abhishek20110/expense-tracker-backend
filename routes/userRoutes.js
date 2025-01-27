import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changePassword,
    updateProfilePicture,
    validatetoken,
} from '../controllers/userController.js'; // Adjust the path according to your project structure

import userAuth from '../middleware/authMiddleware.js';

// Initialize dotenv to load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize router
const userRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

// Register user (assuming registration may need form data)
userRouter.post('/register', upload.none(), registerUser);

// Login user (use multer for form-data without files)
userRouter.post('/login', upload.none(), loginUser);


// Validate user token
userRouter.get('/validate', userAuth, validatetoken );

// Get all users (Public route)
userRouter.get('/users', getAllUsers);

// Get my details (Protected route)
userRouter.get('/users/mydetails', userAuth, getUserById);

// Update my details (Protected route, use PUT for updates)
userRouter.put('/edit', upload.none(), userAuth, updateUser);

// Soft delete my account (Protected route)
userRouter.delete('/delete', userAuth, deleteUser);

// Change password (Protected route, use PUT for updates)
userRouter.put('/changepassword', userAuth, upload.none(), changePassword);

// Update profile picture (Protected route, use POST for file upload)
userRouter.post('/update-profile-picture', userAuth, upload.single('profile_picture'), updateProfilePicture);

export default userRouter;
