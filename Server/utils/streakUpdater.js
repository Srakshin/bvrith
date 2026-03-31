import User from "../Model/UserModel.js";
import StudySession from "../Model/StudySessionModel.js";
import mongoose from "mongoose";

export const updateStreaks = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  if (!user.streaks) {
    user.streaks = { current: 0, max: 0, lastStudyDate: null };
  }

  // Get all days where user studied >= 10 minutes
  // We use aggregation to group by date (UTC)
  const studyDays = await StudySession.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        duration: { $gt: 0 }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$startTime", timezone: "UTC" }
        },
        totalDuration: { $sum: "$duration" }
      }
    },
    {
      $match: {
        totalDuration: { $gte: 10 } // Only days with at least 10 mins count
      }
    },
    { $sort: { "_id": -1 } } // Newest first
  ]);

  if (studyDays.length === 0) {
    user.streaks.current = 0;
    user.streaks.lastStudyDate = null;
    await user.save();
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  let lastDate = null;

  // Check if they studied today or yesterday to continue current streak
  const mostRecentStudyDay = studyDays[0]._id;
  
  if (mostRecentStudyDay === todayStr || mostRecentStudyDay === yesterdayStr) {
    currentStreak = 1;
    let prevDate = new Date(mostRecentStudyDay);

    for (let i = 1; i < studyDays.length; i++) {
      const currentDate = new Date(studyDays[i]._id);
      const diffTime = Math.abs(prevDate - currentDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        prevDate = currentDate;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  // Calculate Max Streak
  let maxStreak = 0;
  let tempMax = 0;
  let pDate = null;

  // For max streak, we need oldest first to count up
  const sortedDaysAsc = [...studyDays].reverse();
  
  for (const day of sortedDaysAsc) {
    const cDate = new Date(day._id);
    if (!pDate) {
      tempMax = 1;
    } else {
      const diffTime = Math.abs(cDate - pDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempMax++;
      } else {
        tempMax = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempMax);
    pDate = cDate;
  }

  user.streaks.current = currentStreak;
  user.streaks.max = maxStreak;
  user.streaks.lastStudyDate = new Date(studyDays[0]._id);
  
  await user.save();
};
