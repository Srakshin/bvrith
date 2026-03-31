import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../Model/UserModel.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

async function verifyStats() {
    console.log("Connecting...");
    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOne({ Username: "mannerithivkesh" });
    if (user) {
        console.log(`User: ${user.FirstName}`);
        console.log(`Total Study Hours (DB): ${user.totalStudyHours}`);
    } else {
        console.log("User not found");
    }

    await mongoose.disconnect();
}

verifyStats();
