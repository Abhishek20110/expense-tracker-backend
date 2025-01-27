import express from 'express';
import multer from 'multer';
import Contact from '../models/contactModel.js';

const conrouter = express.Router();

// Define storage for multer (for file uploads if needed)
// If no file uploads, use `upload.none()` for form data only
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST route to handle contact form submission
conrouter.post('/', upload.none(), async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Create new contact entry in the database
        const newContact = new Contact({
            name,
            email,
            message,
            date: new Date(), // Optionally save the timestamp of the message
        });

        // Save the new contact to the database
        await newContact.save();

        // Respond with success message
        res.status(200).json({ message: 'Your message has been sent successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'There was an error sending your message. Please try again later.' });
    }
});

export default conrouter;
