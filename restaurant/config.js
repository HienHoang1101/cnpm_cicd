import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5003;
export const MONGOURL = process.env.MONGO_URI || "mongodb://mongodb:27017/restaurant";
