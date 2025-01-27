import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import userAuth from '../middleware/authMiddleware.js';

import {
    addTask,
    viewAllTask,
    viewTaskDetails,
    updateTask,
    changeStatus,
    deleteTask,
    getTaskSummary,
    getRecentTasks,
    getTaskStatistics
   
} from '../controllers/taskController.js';

dotenv.config();

const taskRoute = express.Router();

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

// Add a new task
taskRoute.post('/addtask', upload.none(), userAuth, addTask);

// View all tasks for the authenticated user
taskRoute.get('/mytasks', userAuth, viewAllTask);

// View details of a specific task
taskRoute.get('/task/:taskId', userAuth, viewTaskDetails);

// Update a specific task
taskRoute.put('/task/:taskId', userAuth, upload.none(),updateTask);

// Change the status of a specific task
taskRoute.patch('/task/status/:taskId', userAuth, changeStatus);

// Delete a specific task (soft delete)
taskRoute.delete('/task/:taskId', userAuth, deleteTask);
// Route to get task summary
taskRoute.get('/summary',userAuth, getTaskSummary);
//roye for recent tasks
taskRoute.get('/recent',userAuth, getRecentTasks);

//get statistic
taskRoute.get('/statistic',userAuth, getTaskStatistics);



export default taskRoute;
