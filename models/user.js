const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type : String,
        required : true,
        lowercase: true,
        trim: true,
        unique: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

userSchema.index({ isAdmin: 1 });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema)
