const mongoose = require("mongoose");
const Joi = require("joi");

// Post Schema
const PostSchema = new mongoose.Schema({
    title:{
        type : String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 200
    },

    description:{
        type : String,
        required: true,
        trim: true,
        minLength: 10,
    },
    // relation between User and Post collection //
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    category:{
        type : String,
        required: true,
    },

    image:{
        type : Object,
        default: {
            url: "",
            publicID: null,
        }
    },

    likes:{
        type : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ]
    },

},{
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// Populate Comment for this post
PostSchema.virtual("comments", {
    ref: "Comment",
    foreignField: "postId",
    localField: "_id"
})

//Post Model
const Post=mongoose.model("Post",PostSchema)

// Validate Create Post
    function validateCreatePost(obj){
        const schema = Joi.object({
            title: Joi.string().trim().min(2).max(200).required(),
            description: Joi.string().trim().min(10).required(),
            category: Joi.string().trim().required(),
        });
        return schema.validate(obj);
    }

// Validate Update Post
function validateUpdatePost(obj){
    const schema = Joi.object({
        title: Joi.string().trim().min(2).max(200),
        description: Joi.string().trim().min(10),
        category: Joi.string().trim(),
    });
    return schema.validate(obj);
}

module.exports={
    Post,
    validateCreatePost,
    validateUpdatePost
}