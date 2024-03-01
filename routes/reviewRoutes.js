const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync');
const {listingSchema,reviewSchema} = require('../schema');
const Review = require('../models/review');
const Listing =require('../models/listing');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, isAuthor } = require('../middleware');
const Notification = require('../models/notification');



// Review Route

router.post('/', isLoggedIn, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let current_listing = await Listing.findById(id);
    let newReview = new Review({
        content:req.body.content,
        rating:req.body.rating,
        createdAt:new Date(),
        // owner:req.user._id
    });
    // Store Author
    newReview.author = res.locals.currUser._id;
    console.log(newReview);
    current_listing.reviews.push(newReview);
    console.log(current_listing);
    // Storing Notifications
    const newNotif = new Notification({recipient:current_listing.owner._id,content:"Your Listing got a New Review!",type:"review"});
    await newNotif.save();
    await newReview.save();
    await current_listing.save();
    req.flash("success","Review Added!");
    res.redirect(`/listings/${id}`);
    // console.log(req.body);
}
));


// Deleting a review

router.delete('/:reviewId',isLoggedIn,isAuthor,wrapAsync(async (req,res)=>{
    let {id,reviewId} =req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}},{new:true});
    await Review.findByIdAndDelete(reviewId); 
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
