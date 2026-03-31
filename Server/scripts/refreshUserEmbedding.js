import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../Model/UserModel.js";
import { generateEmbedding } from "../utils/ollamaUtils.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

async function refreshEmbedding() {
    console.log("Connecting...");
    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOne({ Username: "mannerithivkesh" });
    if (!user) {
        console.log("User not found");
        process.exit();
    }

    console.log(`Refreshing embedding for ${user.FirstName}...`);

    // Construct text exactly as backfill script does
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
        console.log("Embedding updated!");
    }

    await mongoose.disconnect();
}

refreshEmbedding();
