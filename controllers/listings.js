const Listing =  require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const { uploadImage } = require("../cloudConfig.js");
const expressError = require("../utils/expressError.js");
const mongoose = require("mongoose");

const defaultListingImage = {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    filename: "wanderlust/default-listing",
};

const buildListingQuery = (queryParams) => {
    const filter = {};
    const search = typeof queryParams.search === "string" ? queryParams.search.trim() : "";
    const minPrice = Number(queryParams.minPrice);
    const maxPrice = Number(queryParams.maxPrice);

    if (search) {
        filter.$text = mongoose.trusted({ $search: search });
    }

    if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
        const priceFilter = {};
        if (!Number.isNaN(minPrice) && minPrice >= 0) {
            priceFilter.$gte = minPrice;
        }
        if (!Number.isNaN(maxPrice) && maxPrice >= 0) {
            priceFilter.$lte = maxPrice;
        }
        if (Object.keys(priceFilter).length > 0) {
            filter.price = mongoose.trusted(priceFilter);
        }
    }

    return { filter, search };
};

const sortOptions = {
    newest: { createdAt: -1 },
    price_low: { price: 1 },
    price_high: { price: -1 },
};

module.exports.index = async (req,res) => {
    const { filter, search } = buildListingQuery(req.query);
    const sortKey = sortOptions[req.query.sort] ? req.query.sort : "newest";
    const projection = search && sortKey === "newest" ? { score: { $meta: "textScore" } } : undefined;
    const sort = search && sortKey === "newest" ? { score: { $meta: "textScore" } } : sortOptions[sortKey];
    const allListing  = await Listing.find(filter)
        .select(projection)
        .sort(sort)
        .limit(60)
        .populate("reviews");

    res.render('./listings/index.ejs', {
        allListing,
        filters: {
            search,
            minPrice: req.query.minPrice || "",
            maxPrice: req.query.maxPrice || "",
            sort: sortKey,
        },
    });
}

module.exports.renderNewForm = (req,res) => {
    res.render("./listings/new.ejs")
}

module.exports.showListings = async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews" , populate: {path : "author"}}).populate("owner");

    if( !listing ) {
        req.flash("error" , "listing you are searching doesn't exist");
        return res.redirect("/listings");
    }

    res.render("./listings/show.ejs" , {listing});
}

module.exports.createListing = async(req,res) => {
    let result_of_listingSchema = listingSchema.validate(req.body);
    
    if(result_of_listingSchema.error){
        throw new expressError(400 , result_of_listingSchema.error);
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = await uploadImage(req.file) || defaultListingImage;

    await newListing.save();
    req.flash("success" , "new Listing added!");
    res.redirect("/listings");
}

module.exports.editListing = async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if( !listing ) {
        req.flash("error" , "listing you are searching doesn't exist");
        return res.redirect("/listings");
    }

    let originalImg = listing.image && listing.image.url ? listing.image.url : defaultListingImage.url;
    originalImg = originalImg.replace("/upload","/upload/h_180,w_250")

    res.render("./listings/edit.ejs" , { listing , originalImg })
}

module.exports.destroyListing = async (req,res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success" , "Listing deleted!");

    res.redirect(`/listings`);
}

module.exports.updateListing = async (req,res) => {
        let { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id , {...req.body.listing}, { runValidators: true, new: true });

        if(req.file) {
            listing.image = await uploadImage(req.file);
            await listing.save();
        }

        req.flash("success" , "Listing Updated.");
        res.redirect(`/listings/${id}`);
}
