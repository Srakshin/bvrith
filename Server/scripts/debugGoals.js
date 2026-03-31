import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "../Model/ToDoModel.js";
import User from "../Model/UserModel.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

async function debugGoals() {
    console.log("Connecting...");
    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOne({
        $or: [
            { Username: "mannerithivkesh" },
            { FirstName: "Rithivkesh" }
        ]
    });

    if (!user) {
        console.log("User Rithivkesh not found.");
        process.exit();
    }

    console.log(`Found user: ${user.FirstName} (${user._id})`);

    const tasks = await Task.find({ user: user._id }).select("+embedding");
    console.log(`Found ${tasks.length} tasks.`);

    tasks.forEach(t => {
        const type = t.embedding ? (Array.isArray(t.embedding) ? `Array(${t.embedding.length})` : typeof t.embedding) : "undefined";
        console.log(`- [${type}] ${t.title} (Status: ${t.status})`);
    });

    await mongoose.disconnect();
}

debugGoals();
