import Expense from "../models/expenseModel.js";
import mongoose from "mongoose";

// Get all expenses
export const getAllExpenses = async (req, res) => {
    try {
        const user_id = req.userId;

        // Validate user_id
        if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({ status: 'error', message: 'Invalid or missing user ID' });
        }

        // Fetch expenses
        const expenses = await Expense.find({ user_id: mongoose.Types.ObjectId(user_id), is_del: false })
            .populate('category', 'name');

        if (expenses.length === 0) {
            return res.status(200).json({ status: 'success', message: 'No expenses found', data: [] });
        }

        res.status(200).json({
            status: 'success',
            message: 'Expenses fetched successfully',
            data: expenses,
        });
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({
            status: 'error',
            message: 'Error getting expenses',
            error: error.message,
        });
    }
};

//add Expense 
export const addExpense = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, amount, category , note , date } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!title || !amount || !category) {
            return res.status(400).json({ message: "Title, amount and category are required" });
        }
        const expense = new Expense({
            user_id: userId,
            title,
            amount,
            category,
            note,
            date,
        });
        await expense.save();
        res.status(201).json({ message: "Expense added successfully", data: expense });
    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).json({ message: "Error adding expense" });
    }
};
// Get expense by ID
export const getExpenseById = async (req, res) => {
    try {
        const userId = req.userId; // Get user ID from the authenticated user
        const expenseId = req.params.expenseId; // Get expenseId from URL params

        // Fetch the expense and populate the category name
        const expense = await Expense
            .findOne({ _id: expenseId })  // Find the expense by ID and ensure it matches the userId
            .populate('category', 'name');  // Populate category name

        // If the expense does not exist, return a 404 error
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        // Send the expense data if the user is authorized
        res.status(200).json(expense);

    } catch (error) {

        console.error("Error getting expense:", error); // Log any error
        res.status(500).json({ message: "Error getting expense" });
    }
};

// Update expense
export const updateExpense = async (req, res) => {
    try {
        const userId = req.userId; // Get user ID from the authenticated user (via middleware)
        const expenseId = req.params.expenseId; // Get expenseId from URL params
        const { title, amount, category, note, date } = req.body; // Get fields from request body

        // Ensure required fields are present
        if (!title || !amount || !category || !userId) {
            return res.status(400).json({ message: "Title, amount, category, and userID are required" });
        }

        // Find the expense by ID
        const expense = await Expense.findById(expenseId);

        // If no expense is found with the given ID
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        // Ensure that the user is the owner of the expense
        if (expense.user_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only update your own expenses" });
        }

        // Proceed to update the expense
        const updatedExpense = await Expense.findByIdAndUpdate(
            expenseId, // Find by expenseId
            {
                title,
                amount,
                category,
                note,
                date,
            },
            { new: true } // Ensure the updated document is returned
        );

        // Send the updated expense in the response
        res.status(200).json({
            success: true,
            message: "Expense updated successfully",
            data: updatedExpense,
        });
    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ message: "Error updating expense" });
    }
};
// Delete expense
export const deleteExpense = async (req, res) => {
    try {
        const userId = req.userId; // Get user ID from the authenticated user (via middleware)
        const expenseId = req.params.expenseId; // Get expenseId from URL params
        const expense = await Expense.findById(expenseId);
        
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        if (expense.user_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own expenses" });
        }
        await Expense.findByIdAndUpdate
        (expenseId, { is_del: true });
        res.status(200).json({ message: "Expense deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ message: "Error deleting expense" });
    }
};

