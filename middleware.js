const Listing = require('./models/listing');
const Review = require('./models/review');
const {listingSchema,reviewSchema} = require('./schema');
const ExpressError = require('./utils/ExpressError');

// Middleware for Authentication for Logged In

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        console.log(req.originalUrl);
        req.flash('faliure',"You must be loggedIn first!");
        return res.redirect('/user/login');
    }
    next();
}

// Middleware for Authorization for listings Edit if allowed (currUser = ListingOwner)

module.exports.isOwner= async (req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id))
    {
        req.flash('faliure',"You Don't have a Permission!");
        return res.redirect(`/listings/${id}`);
    }
    else{
        next();
    }
}

// Middleware for Authorization for Reviews Delete if allowed (currUser = review.author)

module.exports.isAuthor= async (req,res,next)=>{
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId)
    .populate('author');
    if(!review.author._id.equals(res.locals.currUser._id))
    {
        req.flash('faliure',"You Don't have a Permission to Delete this!");
        return res.redirect(`/listings/${id}`);
    }
    else{
        next();
    }
}

// Validation Middleware function for Listing

module.exports.validateListing = (req,res,next)=>{
    let{title,location,image,description,price,country}=req.body;
    let data=
    {
        title:title,
        location:location,
        description:description,
        price:price,
        country:country,
        image:{
            url:image,
            filename:"photo"
        }
    };
    let {error} = listingSchema.validate(data);
    console.log(res);
    if(error)
    {
        throw new ExpressError(400,error);
    }
    else{
        next();
    }
}

// Validation Middleware function for Reviews

module.exports.validateReview = (req,res,next)=>{
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


