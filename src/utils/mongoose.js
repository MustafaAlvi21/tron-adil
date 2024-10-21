const mongoose = require('mongoose');
const { database_url } = require("../config/config")


mongoose.connect(database_url)
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", async () => {
    console.log("\n--------------------------------------------------");
    console.log("Connected to MongoDB");
    console.log("DATABASE_URL " + database_url);
    console.log("--------------------------------------------------");

});



module.exports = {
    mongoose
}