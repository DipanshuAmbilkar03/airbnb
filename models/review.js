const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema= new Schema ({
    comment : {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    rating : {
        type : Number,
            required: true,
            min : 1,
            max : 5,
        },
        createdAt : {
            type : Date,
            default : Date.now,
        },
        author : {
            type : Schema.Types.ObjectId,
            ref : "User",
            required: true,
        }
})

reviewSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model("Review",reviewSchema);
