import dotenv from "dotenv";
import mongoose from "mongoose"

dotenv.config({ path: `.env.${process.env.NODE_ENV}`});

const connectString = process.env.MONGO_URI


if (!connectString) {
    console.error("MongoDB Connection String Missing! Set ENV variable MONGO_URI.")
    process.exit(1);
}

mongoose.connect(connectString)
const db = mongoose.connection
db.on('error', err => {
    console.error("MongoDB (Mongoose) Error: " + err.message)
    process.exit(1)
})
db.once('open', () => { console.log("Mongoose Connection Established") })

export {
    db
}