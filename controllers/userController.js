import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from 'cloudinary';

// Register a new user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, gender } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create a new user
        const newUser = new User({ name, email, password, phone, gender });
        await newUser.save();

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};


// Login a user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare passwords (no encryption)
        const isMatch = password === user.password;
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }



        // Generate JWT token
       const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      //  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15s' });


        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token: token,
            data: user,
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in user" });
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ is_del: false });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error getting users" });
    }
};

// Get a user by ID
export const getUserById = async (req, res) => {
    try {
        // Ensure req.user is set by authentication middleware
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is missing" });
        }

        // Fetch user from the database
        const user = await User.findById(userId);

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Respond with user data
        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).json({ message: "Error getting user" });
    }
};

//validate user token
export const validatetoken = async (req, res) => {
    try {
        // Ensure req.user is set by authentication middleware
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is missing" });
        }

        // Fetch user from the database
        const user = await User.findById(userId);

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Respond with user data
        res.status(200).json({
            success: true,
            data: user,
            dp : user.profilePicture,
        });
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).json({ message: "Error getting user" });
    }
};


// Update a user
export const updateUser = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const userId = req.userId; // Use req.user to get the user ID

        // Find the user
        const user = await User.findById(userId);

        if (!user || user.is_del) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user fields
        const updatedUser = await User.findByIdAndUpdate(userId, { name, email, phone }, {
            new: true,
            runValidators: true, // Ensure that the updated fields conform to the schema
        });

        // Respond with the updated user data
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error updating user" });
    }
};

// Soft delete a user
export const deleteUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user || user.is_del) {
            return res.status(404).json({ message: "User not found" });
        }
        await User.findByIdAndUpdate(userId, { is_del: true });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
};

//change password
export const changePassword = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user || user.is_del) {
            return res.status(404).json({ message: "User not found" });
        }

        const { oldPassword, newPassword } = req.body;

        if (user.password !== oldPassword) {
            return res.status(401).json({ message: "Incorrect old password" });
        }

        await User.findByIdAndUpdate(userId, { password: newPassword });
        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error changing password" });
    }
};

// Update the Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Function to update profile picture
export const updateProfilePicture = async (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Function to upload image to Cloudinary
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'todo/uploads/profile_picture' },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                ).end(req.file.buffer);
            });
        };

        // Get user ID from token or session
        const userId = req.userId;

        // Find the user to get the old profile picture URL and public ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const oldProfilePicture = user.profilePicture;
        let oldPublicId = null;

        if (oldProfilePicture) {
            // Extract the public ID from the old image URL
            const oldImageUrlParts = oldProfilePicture.split('/');
            oldPublicId = oldImageUrlParts[oldImageUrlParts.length - 1].split('.')[0];
        }

        // Upload the new file to Cloudinary
        const result = await uploadToCloudinary();
        const profilePictureUrl = result.secure_url;

        // If there was an old image, delete it from Cloudinary
        if (oldPublicId) {
            await cloudinary.uploader.destroy(`todo/uploads/profile_picture/${oldPublicId}`);
        }

        // Update the user's profile with the new picture URL
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePicture: profilePictureUrl }, { new: true });

        res.status(200).json({ message: 'Profile picture updated successfully', profilePicture: profilePictureUrl });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update profile picture', error: err.message });
    }
};
