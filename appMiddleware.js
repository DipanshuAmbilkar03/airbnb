const Listing = require("./models/listing.js");
const Review = require("./models/review.js"); 
const { listingSchema , reviewSchema, userSchema } = require("./schema.js");
const expressError = require("./utils/expressError.js");
const crypto = require("crypto");
const mongoose = require("mongoose");

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

const createCsrfToken = () => crypto.randomBytes(32).toString("hex");

const isSameToken = (a, b) => {
    if (!a || !b) {
        return false;
    }

    const tokenA = Buffer.from(a);
    const tokenB = Buffer.from(b);

    return tokenA.length === tokenB.length && crypto.timingSafeEqual(tokenA, tokenB);
};

module.exports.ensureCsrfToken = (req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = createCsrfToken();
    }

    res.locals.csrfToken = req.session.csrfToken;
    next();
};

module.exports.verifyCsrfToken = (req, res, next) => {
    if (safeMethods.has(req.method)) {
        return next();
    }

    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("multipart/form-data")) {
        return next();
    }

    const submittedToken = req.body && req.body._csrf;
    if (!isSameToken(submittedToken, req.session.csrfToken)) {
        throw new expressError(403, "Security check failed. Please refresh and try again.");
    }

    next();
};

module.exports.verifyMultipartCsrfToken = (req, res, next) => {
    const submittedToken = req.body && req.body._csrf;
    if (!isSameToken(submittedToken, req.session.csrfToken)) {
        throw new expressError(403, "Security check failed. Please refresh and try again.");
    }

    next();
};

module.exports.validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!id || !mongoose.isValidObjectId(id)) {
            throw new expressError(404, "Page Not Found!");
        }

        next();
    };
};


module.exports.isLoggedIn = (req,res,next) => {
// when user is not logged in 
    if(!req.isAuthenticated()) {
        // redirectUrl save
        req.session.redirectUrl = req.originalUrl;
        req.flash("error" , "you are not logged in");
        return res.redirect("/login");
    }
    next();

};

module.exports.isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        req.flash("error", "You are not authorized to access the admin area.");
        return res.redirect("/listings");
    }

    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isowner = async (req,res,next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    if( !listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You are not authorized to access or modify this post.");
        return res.redirect(`/listings/${id}`);
    }

    next();
}

module.exports.isReviewAuthor = async (req,res,next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found.");
        return res.redirect(`/listings/${id}`);
    }

    if( !review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You are not authorized to modify this review.");
        return res.redirect(`/listings/${id}`);
    }

    next();
}

// validation lisitings
module.exports.validateFunc = (req, res, next) => {
    // using JOI
    let {error} = listingSchema.validate(req.body);
    
    if(error) {
        let errMsg = error.details.map(
            (el) => el.message
        ).join(","); 
        throw new expressError(400 , errMsg);
    }else {
        next();
    }
}

// validate review function 
module.exports.validateReview = (req, res, next) => {
    // using JOI
    let {error} = reviewSchema.validate(req.body);
    
    if(error) {
        let errMsg = error.details.map(
            (el) => el.message
        ).join(","); 
        throw new expressError(400 , errMsg);
    }else {
        next();
    }
}

module.exports.validateUser = (req, res, next) => {
    let { error } = userSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400, errMsg);
    }

    next();
};
