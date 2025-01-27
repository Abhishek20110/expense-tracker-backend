import User from "../models/userModel.js";
import mongoose from "mongoose";
import Category from "../models/categoryModel.js";

// Get categories
export const getCategories = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const categories = await Category.find({ userId, is_del: false });

        if (!categories.length) {
            return res.status(404).json({ success: false, message: "No categories found" });
        }

        res.status(200).json({ 
            success: true, 
            data: { 
                categories, 
                ack: 1 
            }
        });
        
    } catch (error) {
        console.error("Error getting categories:", error.message);
        res.status(500).json({ success: false, message: "Error getting categories" });
    }
};

// Get all categories
export const getallCategories = async (req, res) => {
    try {
        const categories = await Category.find({ is_del: false });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error("Error fetching categories:", error.message);
        res.status(500).json({ success: false, message: "Error fetching categories" });
    }
};

// Add category
export const addCategory = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, icon } = req.body;

        if (!name || !userId) {
            return res.status(400).json({ success: false, message: "Name and userID are required." });
        }

        const existingCategory = await Category.findOne({ name, userId });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category with this name already exists." });
        }

        const newCategory = new Category({ name, icon: icon || null, userId });
        await newCategory.save();

        res.status(201).json({ success: true, message: "Category created successfully", data: newCategory });
    } catch (error) {
        console.error("Error adding category:", error.message);
        res.status(500).json({ success: false, message: "Error creating category" });
    }
};

// Get category by ID
export const getcatid = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.error("Error getting category:", error.message);
        res.status(500).json({ success: false, message: "Error getting category" });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, icon } = req.body;
        const categoryId = req.params.categoryId;

        const category = await Category.findOneAndUpdate(
            { _id: categoryId, userId },
            { name, icon: icon || null },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category updated successfully", data: category });
    } catch (error) {
        console.error("Error updating category:", error.message);
        res.status(500).json({ success: false, message: "Error updating category" });
    }
};

// Delete (soft delete) category
export const deleteCategory = async (req, res) => {
    try {
        const userId = req.userId;
        const categoryId = req.params.categoryId;

        const category = await Category.findOneAndUpdate(
            { _id: categoryId, userId },
            { is_del: true },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category deleted successfully", data: category });
    } catch (error) {
        console.error("Error deleting category:", error.message);
        res.status(500).json({ success: false, message: "Error deleting category" });
    }
};
