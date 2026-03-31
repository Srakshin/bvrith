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

async function checkNotes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const user = await User.findOne({
            $or: [{ Username: "mannerithivkesh" }, { FirstName: "Rithivkesh" }]
        });

        if (!user) {
            console.log("User not found");
            return;
        }

        console.log(`Checking notes for user: ${user.FirstName} (${user._id})`);

        const notes = await Note.find({ owner: user._id }).select("+embedding");
        console.log(`Total notes found: ${notes.length}`);

        let withEmbeddings = 0;
        notes.forEach(note => {
            console.log(`- Note: "${note.title}" (ID: ${note._id})`);
            if (note.embedding && note.embedding.length > 0) {
                console.log(`  ✅ Has embedding (len: ${note.embedding.length})`);
                withEmbeddings++;
            } else {
                console.log(`  ❌ NO EMBEDDING`);
            }
        });

        console.log(`\nSummary: ${withEmbeddings}/${notes.length} notes have embeddings.`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkNotes();
