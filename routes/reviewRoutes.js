const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync');
const {listingSchema,reviewSchema} = require('../schema');
const Review = require('../models/review');
const Listing =require('../models/listing');
const ExpressError = require('../utils/ExpressError');

const validateReview = (req,res,next)=>{
    let{content,rating}=req.body;
    let data=
    {
        content:content,
        rating:rating,
        createdAt:new Date()
    };
    let {error} = reviewSchema.validate(data);
    console.log(res);
    if(error)
    {
        throw new ExpressError(400,error);
    }
    else{
        next();
    }
}


// Review Route

router.post('/', wrapAsync(async (req,res)=>{
    if(!req.isAuthenticated()){
        req.flash('faliure',"Yopu must be loggedIn first!");
        res.redirect('/login');
    }
    else{
        let {id} = req.params;
        let current_listing = await Listing.findById(id);
        let newReview = new Review({
            content:req.body.content,
            rating:req.body.rating,
            createdAt:new Date(),
            // owner:req.user._id
        });
        current_listing.reviews.push(newReview);
        console.log(current_listing);
        await newReview.save();
        await current_listing.save();

        req.flash("success","Review Added!");
        res.redirect(`/listings/${id}`);
        // console.log(req.body);
    }
}));


// Deleting a review

router.delete('/:reviewId', wrapAsync(async (req,res)=>{
    let {id,reviewId} =req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}},{new:true});
    await Review.findByIdAndDelete(reviewId); 
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
