import User from "../models/userModel.js";
import Category from "../models/categoryModel.js";
import Expense from "../models/expenseModel.js";


//monthly expense
export const monthlyExpense = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        // Current month and last month date range
        const date = new Date();
        const firstDayThisMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDayThisMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        // Calculate last month's year and month
        const lastMonth = date.getMonth() === 0 ? 11 : date.getMonth() - 1;
        const lastMonthYear = date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear();

        const firstDayLastMonth = new Date(lastMonthYear, lastMonth, 1);
        const lastDayLastMonth = new Date(lastMonthYear, lastMonth + 1, 0);

        // Fetch expenses for this month and last month
        const thisMonthExpenses = await Expense.find({
            user_id: userId,
            date: { $gte: firstDayThisMonth, $lte: lastDayThisMonth },
            is_del: false,
        });

        const lastMonthExpenses = await Expense.find({
            user_id: userId,
            date: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
            is_del: false,
        });

        // Calculate total amounts
        const thisMonthAmount = thisMonthExpenses.reduce((acc, expense) => acc + expense.amount, 0);
        const lastMonthAmount = lastMonthExpenses.reduce((acc, expense) => acc + expense.amount, 0);

        res.status(200).json({
            success: true,
            message: "Monthly expense fetched successfully",
            data: { thisMonthAmount, lastMonthAmount },
        });
    } catch (error) {
        console.error("Error getting monthly expense:", error.message);
        res.status(500).json({ success: false, message: "Error getting monthly expense" });
    }
};

//last 7 days daily average
export const dailyAverage = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const date = new Date();
        const last7Days = new Date(date.setDate(date.getDate() - 7));
        const today = new Date();
        const expenses = await Expense.find({
            user_id: userId,
            date: { $gte: last7Days, $lte: today },
            is_del: false,
        });
        const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0);
       
        let dailyAverage = totalAmount / 7;
        //round total
        dailyAverage = Math.round(dailyAverage);
        
        res.status(200).json({
            success: true,
            message: "Daily average fetched successfully",
            data: { dailyAverage },
        });
    }
    catch (error) {
        console.error("Error getting daily average:", error.message);
        res.status(500).json({ success: false, message: "Error getting daily average" });
    }
};

//biggest expense and its category name
export const biggestExpense = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const expenses = await Expense.find({ user_id: userId, is_del: false })
           .sort({ amount: -1 })
           .limit(1);
        const biggestExpense = expenses[0];
        const category = await Category.findById(biggestExpense.category);
        res.status(200).json({
            success: true,
            message: "Biggest expense fetched successfully",
            data: { biggestExpense, category },
        });
    }
    catch (error) {
        console.error("Error getting biggest expense:", error.message);
        res.status(500).json({ success: false, message: "Error getting biggest expense" });
    }
};

//total Expenses
export const totalExpenses = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const expenses = await Expense.find({ user_id: userId, is_del: false });
        const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0);
        res.status(200).json({
            success: true,
            message: "Total expenses fetched successfully",
            data: { totalAmount },
        });
    }
    catch (error) {
        console.error("Error getting total expenses:", error.message);
        res.status(500).json({ success: false, message: "Error getting total expenses" });
    }
};

//permonth expense with month name 
export const perMonthExpense = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        // Fetch expenses for the user, sorted by date
        const expenses = await Expense.find({ user_id: userId, is_del: false })
            .sort({ date: 1 });

        // Initialize an object to store per-month expense
        const perMonthExpense = {};

        // Iterate through expenses and aggregate by month
        expenses.forEach((expense) => {
            const monthName = new Date(expense.date).toLocaleString("default", { month: "long" });
            if (!perMonthExpense[monthName]) {
                perMonthExpense[monthName] = 0;
            }
            perMonthExpense[monthName] += expense.amount;
        });

        // Convert the result to an array of objects
        const result = Object.keys(perMonthExpense).map((month) => ({
            name: month,
            amount: perMonthExpense[month],
        }));

        // Send the response
        res.status(200).json({
            success: true,
            message: "Per month expense fetched successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error getting per month expense:", error.message);
        res.status(500).json({ success: false, message: "Error getting per month expense" });
    }
};


//expense per category send category name and total amount
export const expensePerCategory = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const expenses = await Expense.find({ user_id: userId, is_del: false })
            .populate("category");

        let expensePerCategory = {};
        let totalExpense = 0;

        // Calculate total expenses per category
        expenses.forEach(expense => {
            const categoryName = expense.category.name;
            if (!expensePerCategory[categoryName]) {
                expensePerCategory[categoryName] = 0;
            }
            expensePerCategory[categoryName] += expense.amount;
            totalExpense += expense.amount;
        });

        // Convert to an array and sort by expense in descending order
        const sortedCategories = Object.entries(expensePerCategory)
            .sort((a, b) => b[1] - a[1]);

        const topCategories = sortedCategories.slice(0, 5); // Get top 5 categories
        const otherCategories = sortedCategories.slice(5); // Remaining categories

        // Sum up "Other" category expenses
        const otherTotal = otherCategories.reduce((sum, [, amount]) => sum + amount, 0);

        // Build the final result with percentages
        const result = topCategories.map(([name, amount]) => ({
            category: name,
            amount,
            percentage: ((amount / totalExpense) * 100).toFixed(2),
        }));

        // Add "Other" category if applicable
        if (otherTotal > 0) {
            result.push({
                category: "Other",
                amount: otherTotal,
                percentage: ((otherTotal / totalExpense) * 100).toFixed(2),
            });
        }

        res.status(200).json({
            success: true,
            message: "Expense per category fetched successfully",
            data: {
                expensePerCategory: result,
                totalExpense,
            },
        });

    } catch (error) {
        console.error("Error getting expense per category:", error.message);
        res.status(500).json({ success: false, message: "Error getting expense per category" });
    }
};

//perday expense with day name this week
export const perDayExpense = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const today = new Date();
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 6); // Include the last 7 days including today

        // Find expenses within the last 7 days
        const expenses = await Expense.find({
            user_id: userId,
            is_del: false,
            date: { $gte: last7Days, $lte: today }
        });

        // Initialize an object to store per-day expenses
        let perDayExpense = {};

        // Iterate over expenses and group by day name
        expenses.forEach(expense => {
            const dayName = new Date(expense.date).toLocaleString("default", { weekday: "long" }); // Full day names (e.g., Monday, Tuesday)
            if (!perDayExpense[dayName]) {
                perDayExpense[dayName] = 0;
            }
            perDayExpense[dayName] += expense.amount;
        });

        // Ensure all days in the last 7 days are present (even if they have no expenses)
        const result = [];
        for (let i = 6; i >= 0; i--) { // Start from 6 to ensure the days are in order
            const currentDay = new Date(today);
            currentDay.setDate(today.getDate() - i);
            const dayName = currentDay.toLocaleString("default", { weekday: "long" });
            result.push({
                day: dayName,
                amount: perDayExpense[dayName] || 0
            });
        }

        res.status(200).json({
            success: true,
            message: "Per day expense fetched successfully",
            data: result,
        });

    } catch (error) {
        console.error("Error getting per day expense:", error.message);
        res.status(500).json({ success: false, message: "Error getting per day expense" });
    }
};

//recent expense last 5 
export const recentExpenses = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const expenses = await Expense.find({ user_id: userId, is_del: false })
            .sort({ date: -1 })
            .limit(5)
            .populate("category");

        res.status(200).json({
            success: true,
            message: "Recent expenses fetched successfully",
            data: expenses,
        });

    } catch (error) {
        console.error("Error getting recent expenses:", error.message);
        res.status(500).json({ success: false, message: "Error getting recent expenses" });
    }
};



