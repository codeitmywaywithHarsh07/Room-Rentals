const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    content:String,
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:new Date()
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});

const Review = mongoose.model("Review",reviewSchema);
module.exports=Review;