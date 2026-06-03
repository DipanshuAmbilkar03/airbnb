const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js"); 

const listingItems = new Schema({
        title : { 
            type : String,
            required : true,
            trim: true,
            maxlength: 120,
        },
        description : {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        image : {
            url : String,
            filename : String,
        },
        price : { 
            type : Number, 
            default : 0,
            min: 0,
            max: 10000000,
        },
        location : { 
            type : String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        country : { 
            type : String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        reviews : [
            {
                type : Schema.Types.ObjectId,
                ref : "Review",
            }
        ],
        owner :  { 
            type : Schema.Types.ObjectId,
            ref : "User",
            required: true,
        }
    }, { timestamps: true });

listingItems.index({ title: "text", location: "text", country: "text" });
listingItems.index({ price: 1 });
listingItems.index({ createdAt: -1 });

// mongoose listing and review middeleWare
listingItems.post("findOneAndDelete" , async(listing)=>{
    if(listing) {
        await Review.deleteMany({_id: {$in : listing.reviews}});
    }
});

const Listing = mongoose.model("listing",listingItems);
module.exports = Listing;
