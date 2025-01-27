import Task from "../models/taskModel.js";

// Add new task
export const addTask = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, description, dueDate, comments } = req.body;

        if (!title || !description || !dueDate) {
            return res.status(400).json({ message: "Title, description, and due date are required" });
        }

        if (!userId) {
            return res.status(400).json({ message: "User ID is missing" });
        }

        // Add new task in the database
        const newTask = new Task({ title, description, dueDate, comments, userId });
        await newTask.save();

        res.status(201).json({
            message: "Task added successfully",
            data: newTask
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to add new task" });
    }
};

// View all user tasks sorted by due date
export const viewAllTask = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is missing" });
        }

        const filters = {
            is_del: false,
            userId: userId, // Match userId correctly
        };

        // Find tasks and sort by dueDate in ascending order
        const tasks = await Task.find(filters).sort({ dueDate: 1 });

        res.status(200).json({
            message: "All tasks retrieved successfully",
            data: tasks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to view all tasks" });
    }
};

// View task details
export const viewTaskDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.taskId;

        if (!userId || !taskId) {
            return res.status(400).json({ message: "User ID and Task ID are required" });
        }

        // Find the task by taskId, userId, and make sure it's not deleted
        const task = await Task.findOne({ _id: taskId, userId: userId, is_del: false });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({
            message: "Task details retrieved successfully",
            data: task
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to view task details" });
    }
};

// Update a task
export const updateTask = async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.taskId;

        if (!userId || !taskId) {
            return res.status(400).json({ message: "User ID and Task ID are required" });
        }

        const { title, description, dueDate, comments } = req.body;
        const task = await Task.findOneAndUpdate(
            { _id: taskId, userId: userId, is_del: false },
            { title, description, dueDate, comments },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({
            message: "Task updated successfully",
            data: task
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to update task" });
    }
};

// Change task status
export const changeStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.taskId;

        if (!userId || !taskId) {
            return res.status(400).json({ message: "User ID and Task ID are required" });
        }

        const { status } = req.body;

        // Optionally validate the status value (e.g., "Pending", "In Progress", "Completed")
        const validStatuses = ["Pending", "In Progress", "Completed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const task = await Task.findOneAndUpdate(
            { _id: taskId, userId: userId, is_del: false },
            { status },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({
            message: "Task status updated successfully",
            data: task
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to update task status" });
    }
};

// Delete a task
export const deleteTask = async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.taskId;

        if (!userId || !taskId) {
            return res.status(400).json({ message: "User ID and Task ID are required" });
        }

        const task = await Task.findOneAndUpdate(
            { _id: taskId, userId: userId },
            { is_del: true },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({
            message: "Task deleted successfully",
            data: task
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to delete task" });
    }
};

// Get task summary
export const getTaskSummary = async (req, res) => {
    try {
        // Assuming userId is stored in req.userId by authentication middleware
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Define filter including userId and is_del
        const filter = { userId, is_del: false };

        // Get counts for each status
        const completedCount = await Task.countDocuments({ ...filter, status: 'Completed' });
        const pendingCount = await Task.countDocuments({ ...filter, status: 'Pending' });
        const inProgressCount = await Task.countDocuments({ ...filter, status: 'In Progress' });
        
        // Send the counts as JSON response
        res.json({
            completed: completedCount,
            pending: pendingCount,
            inProgress: inProgressCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
//get recent tast 
export const getRecentTasks = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const filter = { userId, is_del: false };

        const recentTasks = await Task.find(filter).sort({ createdAt: -1 }).limit(5);
        res.json(recentTasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get task statistics
export const getTaskStatistics = async (req, res) => {
    try {
        const userId = req.userId;
        console.log("User ID:", userId); // Log userId to ensure it's correct

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Define filter to exclude deleted tasks
        const filter = { userId, is_del: false };

        // Count tasks by status
        const completedCount = await Task.countDocuments({ ...filter, status: 'Completed' });
        const pendingCount = await Task.countDocuments({ ...filter, status: 'Pending' });
        const inProgressCount = await Task.countDocuments({ ...filter, status: 'In Progress' });
        const totalTasks = await Task.countDocuments(filter);

        // Calculate overdue tasks
        const currentDate = new Date();
        const overdueCount = await Task.countDocuments({
            ...filter,
            dueDate: { $lt: currentDate },
            status: { $ne: 'Completed' } // Exclude completed tasks from overdue count
        });

        console.log("Total Tasks:", totalTasks); // Log totalTasks to debug
        console.log("Overdue Tasks:", overdueCount); // Log overdueCount to debug

        // Gather statistics
        const statistics = {
            totalTasks,
            completedCount,
            pendingCount,
            inProgressCount,
            overdueCount // Include overdue count in the response
        };

        res.json(statistics);
    } catch (error) {
        console.error("Error fetching statistics:", error); // Log the full error
        res.status(500).json({ message: 'Server error' });
    }
};
