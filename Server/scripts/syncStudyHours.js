import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../Model/UserModel.js";
import StudySession from "../Model/StudySessionModel.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

async function syncStudyHours() {
    try {
        console.log("Connecting...");
        await mongoose.connect(process.env.MONGODB_URI);

        const users = await User.find({});
        console.log(`Found ${users.length} users. Syncing study hours...`);

        for (const user of users) {
            const stats = await StudySession.aggregate([
                {
                    $match: {
                        user: user._id
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalHours: { $sum: { $divide: ["$duration", 60] } },
                    },
                },
            ]);

            const totalHours = stats.length > 0 ? parseFloat(stats[0].totalHours.toFixed(2)) : 0;

            if (user.totalStudyHours !== totalHours) {
                console.log(`User ${user.FirstName}: Updating ${user.totalStudyHours || 0} -> ${totalHours}`);
                await User.updateOne({ _id: user._id }, { totalStudyHours: totalHours });

                // Also update embedding if needed, or trigger embedding regen?
                // For now, let's just update the field. embedding might be stale until profile update.
            } else {
                console.log(`User ${user.FirstName}: Already synced (${totalHours})`);
            }
        }

        console.log("Sync complete.");
    } catch (error) {
        console.error("Sync failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

syncStudyHours();
