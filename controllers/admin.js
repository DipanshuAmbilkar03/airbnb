const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const mongoose = require("mongoose");

module.exports.dashboard = async (req, res) => {
    const [listingCount, userCount, reviewCount, adminCount, recentListings, recentUsers, recentReviews] = await Promise.all([
        Listing.countDocuments({}),
        User.countDocuments({}),
        Review.countDocuments({}),
        User.countDocuments({ isAdmin: true }),
        Listing.find({}).sort({ createdAt: -1 }).limit(5).populate("owner"),
        User.find({}).sort({ createdAt: -1 }).limit(5),
        Review.find({}).sort({ createdAt: -1 }).limit(5).populate("author"),
    ]);

    res.render("admin/dashboard.ejs", {
        stats: {
            listingCount,
            userCount,
            reviewCount,
            adminCount,
        },
        recentListings,
        recentUsers,
        recentReviews,
    });
};

module.exports.listings = async (req, res) => {
    const listings = await Listing.find({})
        .sort({ createdAt: -1 })
        .populate("owner")
        .limit(100);

    res.render("admin/listings.ejs", { listings });
};

module.exports.destroyListing = async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing removed by admin.");
    res.redirect("/admin/listings");
};

module.exports.users = async (req, res) => {
    const users = await User.find({}).sort({ createdAt: -1 }).limit(100);
    res.render("admin/users.ejs", { users });
};

module.exports.updateUserRole = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/admin/users");
    }

    const shouldBeAdmin = req.body.isAdmin === "true";
    if (user._id.equals(req.user._id) && !shouldBeAdmin) {
        req.flash("error", "You cannot remove your own admin access.");
        return res.redirect("/admin/users");
    }

    user.isAdmin = shouldBeAdmin;
    await user.save();
    req.flash("success", `${user.username} admin access updated.`);
    res.redirect("/admin/users");
};

module.exports.reviews = async (req, res) => {
    const reviews = await Review.find({})
        .sort({ createdAt: -1 })
        .populate("author")
        .limit(100);

    const listingIds = reviews.map((review) => review._id);
    const listings = await Listing.find({ reviews: mongoose.trusted({ $in: listingIds }) }).select("title reviews");
    const listingByReviewId = new Map();

    for (const listing of listings) {
        for (const reviewId of listing.reviews) {
            listingByReviewId.set(reviewId.toString(), listing);
        }
    }

    res.render("admin/reviews.ejs", {
        reviews,
        listingByReviewId,
    });
};

module.exports.destroyReview = async (req, res) => {
    const reviewId = req.params.reviewId;
    await Listing.updateMany({ reviews: reviewId }, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review removed by admin.");
    res.redirect("/admin/reviews");
};
