const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js"); 
const { validateReview , isLoggedIn ,isReviewAuthor, validateObjectId } = require("../appMiddleware.js");
// const { createReview } = require("../controllers/reviews.js");
const reviewController = require("../controllers/reviews.js");

// Review
router.post("/" 
    ,validateObjectId("id")
    ,isLoggedIn
        ,validateReview
        ,wrapAsync(reviewController.createReview)
); 

// delete the review
router.delete("/:reviewId"
    ,validateObjectId("id")
    ,validateObjectId("reviewId")
    ,isLoggedIn
        ,isReviewAuthor
        ,wrapAsync(reviewController.destroyReview)
);

module.exports = router;    
