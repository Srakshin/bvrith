import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "../Model/ToDoModel.js";
import Event from "../Model/EventModel.js";
import User from "../Model/UserModel.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.\n");

        const check = async (Model, name) => {
            const total = await Model.countDocuments();
            // Explicitly select embedding to check existence
            const withEmbedding = await Model.countDocuments({ embedding: { $exists: true, $ne: [] } });
            console.log(`[${name}] Total: ${total} | With Embeddings: ${withEmbedding}`);

            if (withEmbedding > 0) {
                const sample = await Model.findOne({ embedding: { $exists: true } }).select("+embedding");
                console.log(`   Sample embedding length: ${sample.embedding.length}`);
            } else {
                console.log(`   WARNING: No embeddings found for ${name}`);
            }
            console.log("-".repeat(30));
        };

        await check(Task, "Task");
        await check(Event, "Event");
        await check(User, "User");

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
