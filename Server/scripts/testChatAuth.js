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

async function testAuthChat() {
    console.log("Testing Chat with Auth...");
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Find a real user
        const user = await User.findOne();
        if (!user) {
            console.error("No user found in DB to test with.");
            return;
        }
        console.log(`Using user: ${user.FirstName} (${user._id})`);

        // Generate Token
        const token = jwt.sign(
            { id: user._id, FirstName: user.FirstName, LastName: user.LastName, Email: user.Email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Make Request
        const response = await fetch("http://127.0.0.1:3000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                message: "Summarize my notes about biology or history",
                history: []
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("\nResponse from Chatbot:");
        console.log("---------------------------------------------------");
        console.log(data.reply);
        console.log("---------------------------------------------------");

    } catch (error) {
        console.error("Test Failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

testAuthChat();
