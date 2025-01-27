import express from 'express';
import multer from 'multer';


import userAuth from '../middleware/authMiddleware.js';

const homerouter = express.Router();


// Import controllers
import { monthlyExpense ,
    dailyAverage ,
    biggestExpense,
    totalExpenses,
    perMonthExpense,
    expensePerCategory ,
    perDayExpense,recentExpenses,


 } from '../controllers/homeController.js';







// Define storage for multer (for file uploads if needed)
// If no file uploads, use `upload.none()` for form data only
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// routes for home page
homerouter.get('/', (req, res) => {
   console.log("Home page");
});

homerouter.get('/monthly-expense',userAuth, monthlyExpense);
homerouter.get('/daily-average',userAuth, dailyAverage);
homerouter.get('/biggest-expense',userAuth, biggestExpense);
homerouter.get('/total-expenses',userAuth, totalExpenses);
homerouter.get('/per-month-expense',userAuth, perMonthExpense);
homerouter.get('/expense-per-category',userAuth, expensePerCategory);
homerouter.get('/per-day-expense',userAuth, perDayExpense);
homerouter.get('/recent-expenses',userAuth, recentExpenses);


export default homerouter;
