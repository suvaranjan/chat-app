const mongoose = require("mongoose");

async function connect() {
    try {
        const url = process.env.MONGO_STRING;
        const db = await mongoose.connect(url);
        console.log("Database connected");
        return db;
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1); // Exit the Node.js process with a failure status
    }
}

module.exports = connect;