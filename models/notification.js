const express = require('express');
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    read:{
        type:Boolean,
        default:false
    },
    type:{
        type:String,
        required:true
    },
    created_at:{
        type:Date,
        default:Date.now
    },
    content:{
        type:String,
        required:true
    }
});

const Notification = mongoose.model('Notification',notificationSchema);
module.exports = Notification;