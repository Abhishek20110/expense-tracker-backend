import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    status :{
        type : String,
        default : 'Pending'
    },
    dueDate : {
        type : Date
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    is_del: {
        type: Boolean,
        default: false,
    },
    comments: {
        type : String,
    }
     
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
