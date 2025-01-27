import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import { 
    addCategory,
    getCategories,
    updateCategory,
    deleteCategory,
    getallCategories,
    getcatid
} from '../controllers/categoryController.js'; 

import userAuth from '../middleware/authMiddleware.js';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Warn if environment variables are missing
if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn("Warning: Cloudinary environment variables are missing!");
}

// Initialize router
const categoryRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage(); 
const upload = multer({ storage });

// Public routes
categoryRouter.get('/', getallCategories); // Get all categories

// Authenticated routes
categoryRouter.get('/my_categories', userAuth, getCategories); // Get user-specific categories
categoryRouter.get('/:categoryId', getcatid); // Get category by ID
categoryRouter.post('/add', upload.none(), userAuth, addCategory); // Add category
categoryRouter.put('/update/:categoryId', upload.none(), userAuth, updateCategory); // Update category
categoryRouter.delete('/delete/:categoryId', userAuth, deleteCategory); // Delete category

export default categoryRouter;
