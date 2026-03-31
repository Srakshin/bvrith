import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "../Model/ToDoModel.js";
import Event from "../Model/EventModel.js";
import User from "../Model/UserModel.js";
import { generateEmbedding } from "../utils/ollamaUtils.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

async function connectDB() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) throw new Error("MONGODB_URI missing");
        await mongoose.connect(mongoURI);
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
}

async function backfillEmbeddings() {
    await connectDB();
    console.log("Starting Ollama backfill...");

    // 1. Tasks
    const tasks = await Task.find({
        $or: [
            { embedding: { $exists: false } },
            { embedding: { $size: 0 } },
            { embedding: null }
        ]
    });
    console.log(`Found ${tasks.length} tasks without embeddings.`);
    for (const task of tasks) {
        try {
            if (task.title) {
                const embedding = await generateEmbedding(task.title);
                if (embedding) {
                    await Task.updateOne({ _id: task._id }, { embedding });
                    console.log(`Generated embedding for Task: ${task._id}`);
                }
            }
        } catch (err) {
            console.error(`Error processing Task ${task._id}:`, err.message);
        }
    }

    // 2. Events
    const events = await Event.find({ embedding: { $exists: false } });
    console.log(`Found ${events.length} events without embeddings.`);
    for (const event of events) {
        try {
            if (event.title) {
                const embedding = await generateEmbedding(event.title);
                if (embedding) {
                    await Event.updateOne({ _id: event._id }, { embedding });
                    console.log(`Generated embedding for Event: ${event._id}`);
                }
            }
        } catch (err) {
            console.error(`Error processing Event ${event._id}:`, err.message);
        }
    }

    // 3. Users
    try {
        const users = await User.find({ embedding: { $exists: false } });
        console.log(`Found ${users.length} users without embeddings.`);
        for (const user of users) {
            try {
                const badges = user.badges ? user.badges.map(b => b.name).join(", ") : "";
                const text = `User Profile: ${user.FirstName} ${user.LastName || ""}
                              Bio: ${user.Bio || ""}
                              University: ${user.University || ""}
                              Field of Study: ${user.FieldOfStudy || ""}
                              Country: ${user.Country || ""}
                              Badges: ${badges}
                              Study Stats: ${user.totalStudyHours || 0} hours, ${user.kudosReceived || 0} kudos`;

                const embedding = await generateEmbedding(text);
                if (embedding) {
                    await User.updateOne({ _id: user._id }, { embedding });
                    console.log(`Generated embedding for User: ${user._id}`);
                }
            } catch (err) {
                console.error(`Error processing User ${user._id}:`, err.message);
            }
        }
    } catch (userErr) {
        console.error("Error fetching users:", userErr);
    }

    console.log("Backfill complete.");
    await mongoose.disconnect();
    process.exit(0);
}

backfillEmbeddings();
