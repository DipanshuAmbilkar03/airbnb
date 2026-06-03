if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const mongoose = require("mongoose");
const User = require("../models/user.js");

const adminEmail = (process.env.ADMIN_EMAIL || "dipanshuadmin@wanderlust.org").trim().toLowerCase();
const adminUsername = (process.env.ADMIN_USERNAME || adminEmail.split("@")[0]).trim();
const adminPassword = process.env.ADMIN_PASSWORD;

const run = async () => {
    if (!process.env.ATLASDB) {
        throw new Error("ATLASDB is required to create or promote an admin user.");
    }

    await mongoose.connect(process.env.ATLASDB);

    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
        existingUser.isAdmin = true;
        await existingUser.save();
        console.log(`Promoted ${adminEmail} to admin.`);
        return;
    }

    if (!adminPassword) {
        throw new Error(`No user exists for ${adminEmail}. Set ADMIN_PASSWORD to create the admin account.`);
    }

    const user = new User({
        username: adminUsername,
        email: adminEmail,
        isAdmin: true,
    });

    await User.register(user, adminPassword);
    console.log(`Created admin account ${adminEmail} with username ${adminUsername}.`);
};

run()
    .catch((err) => {
        console.error(err.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
