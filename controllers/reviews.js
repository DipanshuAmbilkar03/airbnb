const Listing = require("../models/listing.js"); 
const Review = require("../models/review.js"); 

module.exports.createReview = async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    req.flash("success" , "new Review added!");
    await listing.save();
    
    let {id} = req.params;
    res.redirect(`/listings/${id}`);
}

module.exports.destroyReview = async(req,res) => {
    let {id, reviewId} = req.params;
    
    await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    
    req.flash("success" , "Review deleted!");

    res.redirect(`/listings/${id}`);
}
