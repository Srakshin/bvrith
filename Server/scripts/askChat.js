import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../Model/UserModel.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

const question = process.argv[2] || "Who am I?";
const targetUsername = process.argv[3]; // Optional: "node scripts/askChat.js 'Question' 'username'"

async function askChat() {
    console.log(`\n🤖 Asking Studia AI: "${question}"...\n`);
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Logic to find the right user:
        // 1. Specific username if provided
        // 2. "Rithivkesh" if exists (since that's you!)
        // 3. First user in DB as fallback
        let user;
        if (targetUsername) {
            user = await User.findOne({ Username: targetUsername });
        } else {
            user = await User.findOne({
                $or: [
                    { Username: "mannerithivkesh" },
                    { FirstName: "Rithivkesh" }
                ]
            });

            if (!user) {
                user = await User.findOne();
            }
        }

        if (!user) {
            console.error("No user found.");
            process.exit(1);
        }

        console.log(`Authenticated as: ${user.FirstName} ${user.LastName} (@${user.Username})`);

        const token = jwt.sign(
            { id: user._id, FirstName: user.FirstName, LastName: user.LastName, Email: user.Email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const response = await fetch("http://127.0.0.1:3000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                message: question,
                history: []
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Server Error Response:", errBody);
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("---------------------------------------------------");
        console.log(data.reply);
        console.log("---------------------------------------------------");

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

askChat();
