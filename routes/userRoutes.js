const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const User=require('../models/user');
const passport = require('passport');

router.get('/signup',(req,res)=>{
    res.render('signup.ejs');
});

router.post('/signup',wrapAsync(async (req,res,next)=>{
    try {
        let {username,email,password}=req.body;
        const newUser= new User({
            username:username,
            email:email
        });

        const regUser=await User.register(newUser,password);
        // console.log(regUser);
        // Automatic Login after signup
        req.login(regUser,(err)=>{
            if(err){
                next(err);
            }
            else{
                res.redirect('/listings');
            }
        });
        req.flash('success',"Welcome to RoomRentals!");
    } catch (error) {
        if(error){
            req.flash('faliure',error.message);
            res.redirect('/signup');
        }
    }
}));

router.get('/login',(req,res)=>{
    res.render('login.ejs');
});

router.post(
    '/login',  //Route
    passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}), // Authentication Middleware
    async (req,res)=>{   // Callback is executed only if Authentication is successfull
        req.flash('success',"Welcome Back to Room Rentals!");
        res.redirect('/listings');
    }
);

router.get('/logout',(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
            // req.flash('faliure',err.message);
            // res.redirect('/listings');
        }
        else{
            req.flash('success',"Logged Out Successfully!");
            res.redirect('/listings');
        }
    });
});


module.exports=router;