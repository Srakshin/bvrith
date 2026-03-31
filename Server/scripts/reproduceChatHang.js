import mongoose from "mongoose";
import dotenv from "dotenv";
import Note from "../Model/NoteModel.js";
import Task from "../Model/ToDoModel.js";
import Event from "../Model/EventModel.js";
import SessionRoom from "../Model/SessionModel.js";
import User from "../Model/UserModel.js";
import { generateEmbedding } from "../utils/ollamaUtils.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

async function reproduce() {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");

    try {
        console.log("1. Generating test embedding...");
        const queryEmbedding = await generateEmbedding("test query");
        console.log("Embedding generated. Length:", queryEmbedding.length);

        console.log("2. Fetching all docs (Notes, Tasks, Events, Rooms, Users)...");
        const start = Date.now();
        const [notes, tasks, events, rooms, users] = await Promise.all([
            Note.find({ embedding: { $exists: true } }).select("+embedding title content"),
            Task.find({ embedding: { $exists: true } }).select("+embedding title status dueDate"),
            Event.find({ embedding: { $exists: true } }).select("+embedding title date time"),
            SessionRoom.find({ embedding: { $exists: true } }).select("+embedding name description cateogery"),
            User.find({ embedding: { $exists: true } }).select("+embedding FirstName LastName Bio"),
        ]);
        console.log(`Fetch complete in ${Date.now() - start}ms`);
        console.log(`Counts: Notes=${notes.length}, Tasks=${tasks.length}, Events=${events.length}, Rooms=${rooms.length}, Users=${users.length}`);

        console.log("3. Computing similarities (simulated)...");
        // ... simulation logic ...
        console.log("Done.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

reproduce();
