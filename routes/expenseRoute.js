import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import {
    getAllExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseById
} from '../controllers/expenseController.js';

import userAuth from '../middleware/authMiddleware.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const expenseRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all expenses
expenseRouter.get('/', userAuth, getAllExpenses);

// Add expense
expenseRouter.post('/add', upload.none(), userAuth, addExpense);

// Get expense by id
expenseRouter.get('/:expenseId', userAuth, getExpenseById);

// Update expense
expenseRouter.put('/update/:expenseId', upload.none(), userAuth, updateExpense);

// Delete expense
expenseRouter.delete('/delete/:expenseId', userAuth, deleteExpense);

// Delete expense copy according to app
expenseRouter.delete('//delete/:expenseId', userAuth, deleteExpense);

export default expenseRouter;
