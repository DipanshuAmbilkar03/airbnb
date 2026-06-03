const Listing = require("../models/listing.js");

module.exports.renderHome = async (req, res) => {
    const featuredListings = await Listing.find({})
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("reviews");

    const totalListings = await Listing.countDocuments({});
    const topCountries = await Listing.aggregate([
        { $match: { country: { $type: "string", $ne: "" } } },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 4 },
    ]);

    res.render("home.ejs", {
        featuredListings,
        totalListings,
        topCountries,
    });
};
