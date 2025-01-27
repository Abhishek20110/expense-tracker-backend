import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import colors from 'colors';
import bodyParser from 'body-parser';
import { v2 as cloudinary } from 'cloudinary';
import morgan from 'morgan';

// Load environment variables
dotenv.config();

// Database connection
import db from './config/db.js';
db();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express(); 

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
 /* app.use(
    morgan((tokens, req, res) => {
        return [
           `Remote IP: ${tokens['remote-addr'](req, res)}`, 
           `HTTP Method and URL: ${tokens.method(req, res)} ${tokens.url(req, res)}`, 
            `Time Taken: ${tokens['response-time'](req, res)} ms`, 
            `Size: ${tokens.res(req, res, 'content-length') || '0'} bytes`, 
            `HTTP Status Code: ${tokens.status(req, res)}`, 
            `Response Content Length: ${tokens.res(req, res, 'content-length') || '0'} bytes`, 
            `User-Agent: ${tokens['user-agent'](req, res)}`, 
            `Referer: ${tokens.referrer(req, res) || 'N/A'}`, 
        ].join(' | ');
    })
); */
//modify to add to give remote ip address , HTTP Method and URL:, HTTP Status Code: ,Response Content Length ,User-Agent , refferer

// Import routes
import userrouter from './routes/userRoutes.js';
import conrouter from './routes/contactRoute.js';
import categoryRouter from './routes/categoryRoute.js';
import expenseRouter from './routes/expenseRoute.js';
import taskRoute from './routes/taskRoute.js';
import homerouter from './routes/homeRoute.js';

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the back end of the Expense Tracker App');
});
app.use('/api/users', userrouter);
app.use('/api/contact', conrouter);
app.use('/api/categories', categoryRouter);
app.use('/api/tasks', taskRoute);
app.use('/api/expenses', expenseRouter);
app.use('/api/home', homerouter);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`.green.bold);
});
