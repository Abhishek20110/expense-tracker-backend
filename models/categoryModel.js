import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    is_del: {
        type: Boolean,
        default: false,
    },
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
