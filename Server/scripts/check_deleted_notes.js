import mongoose from "mongoose";
import dotenv from "dotenv";
import Note from "../Model/NoteModel.js";
import User from "../Model/UserModel.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

async function checkDeletedNotes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const user = await User.findOne({
            $or: [{ Username: "mannerithivkesh" }, { FirstName: "Rithivkesh" }]
        });

        if (!user) {
            console.log("User not found");
            return;
        }

        console.log(`Checking notes for user: ${user.FirstName}`);

        const Task = (await import("../Model/ToDoModel.js")).default;
        // Find notes matching the user's description
        const notes = await Task.find({
            title: { $regex: /Note 3|demo/i }
        });

        console.log(`Total notes found: ${notes.length}`);
        notes.forEach(note => {
            console.log(`- Title: "${note.title}"`);
            console.log(`  ID: ${note._id}`);
            console.log(`  Status: ${note.status}`);
            console.log(`  TrashedAt: ${note.trashedAt}`);
            console.log(`  Content: "${note.content.substring(0, 50)}..."`);
            console.log("---------------------------------------------------");
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkDeletedNotes();
