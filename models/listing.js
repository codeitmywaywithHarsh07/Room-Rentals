const mongoose = require('mongoose');
const Review =require('./review');

// Create a Schema
const listingSchema = new mongoose.Schema(
    {
        title:{type:String,required:true},
        description:{type:String},
        country:{type:String},
        image:{
            filename:{
                type:String,
                default:"Photo"
            },
            url:{
                type:String,
                default:"https://unsplash.com/photos/blue-body-of-water-in-front-of-building-near-trees-during-nighttime-M7GddPqJowg",
            }            
        },
        price:{type: Number},
        location:{type: String},
        reviews:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Review"
            }
        ],
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        likes:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            }
        ]
    }
);

// Delete Listing and all the reviews related to it will get Deleted - post Middleware

listingSchema.post('findOneAndDelete',async (listing)=>{
    if(listing.reviews.length)
    {
        let res = await Review.deleteMany({_id:{$in:listing.reviews}});
        console.log(res);
    }
});

// Enabling Indexing for Text Searches

listingSchema.index({title:'text',description:'text',country:'text',location:'text'});

// Create a Model
const Listing = mongoose.model("Listing",listingSchema);
module.exports=Listing;