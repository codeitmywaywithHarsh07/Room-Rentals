const Joi =require('joi');

const listingSchema = Joi.object({
        title:Joi.string().required(),
        location:Joi.string().required(),
        description:Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.number().required().min(100),
        image:Joi.object({
            url:Joi.string().allow("",null),
            filename:Joi.string()
        })
});

const reviewSchema = Joi.object({
    content:Joi.string().required(),
    rating:Joi.number().required()
});

module.exports=listingSchema;
module.exports=reviewSchema;