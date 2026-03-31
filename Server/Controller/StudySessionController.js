import mongoose from "mongoose";
import StudySession from "../Model/StudySessionModel.js";
import User from "../Model/UserModel.js";
import calculateStats from "../utils/TimerStatsCalculator.js";
import { updateStreaks } from "../utils/streakUpdater.js";

// =====================
// Utility Functions
// =====================
const sendError = (res, status, message, details = null) => {
  const errorResponse = { error: message };
  if (details) errorResponse.details = details;
  return res.status(status).json(errorResponse);
};

const validPeriods = ["hourly", "daily", "weekly", "monthly"];

const aggregateStudyHours = (userId, startDate) => {
  return StudySession.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        startTime: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalHours: { $sum: { $divide: ["$duration", 60] } },
      },
    },
  ]);
};

// =====================
// Controllers
// =====================

const createStudySession = async (req, res) => {
  try {
    const { startTime, endTime, duration } = req.body;

    if (!startTime || !endTime || !duration) {
      return sendError(
        res,
        400,
        "Start time, end time, and duration are required."
      );
    }

    if (duration > 10) await updateStreaks(req.user.id);

    const session = new StudySession({
      user: req.user.id,
      startTime,
      endTime,
      duration,
    });

    await session.save();
    await updateStreaks(req.user.id);
    res.status(201).json(session);
  } catch (error) {
    console.error("Study session save error:", error);
    return sendError(res, 500, "Failed to save study session", error.message);
  }
};

const createManualSession = async (req, res) => {
  try {
    const { date, hours, action = "add" } = req.body;

    if (!date || hours === undefined) {
      return sendError(res, 400, "Date and hours are required.");
    }

    // Use UTC for consistent date handling
    const [year, month, day] = date.split("-").map(Number);
    const studyDate = new Date(Date.UTC(year, month - 1, day));
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (studyDate > today) {
      return sendError(res, 400, "Cannot log study hours for future dates.");
    }

    if (hours < 0 || hours > 24) {
      return sendError(res, 400, "Hours must be between 0 and 24.");
    }

    // Boundaries for the day
    const dayStart = new Date(studyDate);
    const dayEnd = new Date(studyDate);
    dayEnd.setUTCHours(23, 59, 59, 999);

    if (action === "remove") {
      const existingSessions = await StudySession.find({
        user: req.user.id,
        startTime: { $gte: dayStart, $lte: dayEnd },
      }).sort({ startTime: -1 });

      if (existingSessions.length === 0) {
        return sendError(res, 404, `There no hours on ${date}`);
      }

      // Calculate total available minutes to prevent going below zero
      const totalAvailableMinutes = existingSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      let minutesToRemove = Math.min(hours * 60, totalAvailableMinutes);

      if (minutesToRemove <= 0) {
        return res.json({ message: "No hours to remove" });
      }

      for (const session of existingSessions) {
        if (minutesToRemove <= 0) break;

        if (session.duration <= minutesToRemove) {
          minutesToRemove -= session.duration;
          await StudySession.deleteOne({ _id: session._id });
        } else {
          session.duration -= minutesToRemove;
          // Ensure duration never goes negative
          session.duration = Math.max(0, session.duration);
          session.endTime = new Date(session.startTime.getTime() + session.duration * 60 * 1000);
          await session.save();
          minutesToRemove = 0;
        }
      }
      await updateStreaks(req.user.id);
      return res.json({ message: `Successfully removed hours from ${date}` });
    }

    // Existing "add" logic (including hours === 0 check)
    if (hours === 0) {
      await StudySession.deleteMany({
        user: req.user.id,
        isManual: true,
        startTime: { $gte: dayStart, $lte: dayEnd },
      });
      await updateStreaks(req.user.id);
      return res.json({ message: "Manual sessions for this date removed successfully" });
    }

    const existingSessions = await StudySession.find({
      user: req.user.id,
      startTime: { $gte: dayStart, $lte: dayEnd }
    });

    const currentTotalMinutes = existingSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const newTotalMinutes = currentTotalMinutes + (hours * 60);

    if (newTotalMinutes > 1440) { // 24 hours
      return sendError(res, 400, `Total study hours for ${studyDate.toDateString()} cannot exceed 24 hours. Already logged: ${(currentTotalMinutes / 60).toFixed(1)}h.`);
    }

    const startTime = studyDate;
    const endTime = new Date(startTime.getTime() + (hours * 60 * 60 * 1000));

    const session = new StudySession({
      user: req.user.id,
      startTime,
      endTime,
      duration: hours * 60,
      isManual: true,
      date: startTime
    });

    await session.save();
    await updateStreaks(req.user.id);
    res.status(201).json(session);
  } catch (error) {
    console.error("Manual session save error:", error);
    return sendError(res, 500, "Failed to save manual session", error.message);
  }
};

const getManualSessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({
      user: req.user.id,
      isManual: true
    }).sort({ startTime: -1 });
    res.json(sessions);
  } catch (error) {
    return sendError(res, 500, "Failed to fetch manual sessions", error.message);
  }
};

const updateManualSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { hours } = req.body;

    const session = await StudySession.findOne({ _id: id, user: req.user.id, isManual: true });
    if (!session) return sendError(res, 404, "Manual session not found.");

    if (hours <= 0 || hours > 24) {
      return sendError(res, 400, "Hours must be between 0 and 24.");
    }

    // Check total hours for that day excluding current session
    const dayStart = new Date(session.startTime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(session.startTime);
    dayEnd.setHours(23, 59, 59, 999);

    const existingSessions = await StudySession.find({
      user: req.user.id,
      startTime: { $gte: dayStart, $lte: dayEnd },
      _id: { $ne: id }
    });

    const otherTotalMinutes = existingSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    if (otherTotalMinutes + (hours * 60) > 1440) {
      return sendError(res, 400, "Total study hours for this day cannot exceed 24 hours.");
    }

    session.duration = hours * 60;
    session.endTime = new Date(session.startTime.getTime() + (hours * 60 * 60 * 1000));
    await session.save();
    await updateStreaks(req.user.id);
    res.json(session);
  } catch (error) {
    return sendError(res, 500, "Failed to update manual session", error.message);
  }
};

const deleteManualSession = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await StudySession.deleteOne({ _id: id, user: req.user.id, isManual: true });
    if (result.deletedCount === 0) return sendError(res, 404, "Manual session not found.");
    
    await updateStreaks(req.user.id);
    res.json({ message: "Manual session deleted successfully" });
  } catch (error) {
    return sendError(res, 500, "Failed to delete manual session", error.message);
  }
};

const getStudySessionStats = async (req, res) => {
  try {
    const { period } = req.query;
    if (!validPeriods.includes(period)) {
      return sendError(res, 400, "Invalid period");
    }

    const stats = await calculateStats(req.user.id, period);
    res.json(stats);
  } catch (error) {
    console.error("Stats fetch error:", error);
    return sendError(
      res,
      500,
      "Failed to fetch study session stats",
      error.message
    );
  }
};

// Helper: Get stats for a user
const getUserStats = async (userId) => {
  const user = await User.findById(userId).select("streaks");
  const now = new Date();

  // Period start dates
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const weekStart = new Date(now);
  weekStart.setDate(
    now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
  );
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const allTimeStart = new Date(0);

  // Aggregations
  const [todayStats, weekStats, monthStats, allTimeStats] = await Promise.all([
    aggregateStudyHours(userId, todayStart),
    aggregateStudyHours(userId, weekStart),
    aggregateStudyHours(userId, monthStart),
    aggregateStudyHours(userId, allTimeStart),
  ]);

  // User rank
  const userRank = await StudySession.aggregate([
    {
      $group: {
        _id: "$user",
        totalHours: { $sum: { $divide: ["$duration", 60] } },
      },
    },
    { $sort: { totalHours: -1 } },
  ]);
  const currentUserRank =
    userRank.findIndex((i) => i._id.toString() === userId) + 1;

  // Level calculation (2 hrs per level)
  const totalHours = allTimeStats[0]?.totalHours || 0;
  const currentLevel = Math.floor(totalHours / 2) + 1;
  const hoursInCurrentLevel = totalHours % 2;
  const hoursToNextLevel = 2 - hoursInCurrentLevel;

  const levelName =
    totalHours >= 100
      ? "Master"
      : totalHours >= 50
        ? "Expert"
        : totalHours >= 25
          ? "Advanced"
          : totalHours >= 10
            ? "Intermediate"
            : "Beginner";

  return {
    timePeriods: {
      today: (todayStats[0]?.totalHours || 0).toFixed(1),
      thisWeek: (weekStats[0]?.totalHours || 0).toFixed(1),
      thisMonth: (monthStats[0]?.totalHours || 0).toFixed(1),
      allTime: (allTimeStats[0]?.totalHours || 0).toFixed(1),
    },
    rank: currentUserRank,
    totalUsers: userRank.length,
    streak: user?.streaks?.current || 0,
    maxStreak: user?.streaks?.max || 0,
    level: {
      name: levelName,
      current: currentLevel,
      hoursInCurrentLevel: hoursInCurrentLevel.toFixed(1),
      hoursToNextLevel: hoursToNextLevel.toFixed(1),
      progress: ((hoursInCurrentLevel / 2) * 100).toFixed(1),
    },
  };
};

// Helper: Leaderboard dataa
const getLeaderboardData = async (period, friendsOnly, userId) => {
  if (!validPeriods.includes(period)) throw new Error("Invalid period");

  const now = new Date();
  let startDate = new Date(0);
  if (period === "daily") startDate = new Date(now.setHours(0, 0, 0, 0));
  else if (period === "weekly") {
    const day = now.getDay();
    startDate = new Date(
      now.setDate(now.getDate() - day + (day === 0 ? -6 : 1))
    );
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // 🔑 Fix: Safe handling of friendsOnly
  let userIdsToInclude = [userId];
  if (friendsOnly) {
    const user = await User.findById(userId).select("friends");
    if (user && Array.isArray(user.friends)) {
      userIdsToInclude = [...userIdsToInclude, ...user.friends];
    }
  }

  const matchStage = { startTime: { $gte: startDate } };
  if (friendsOnly && userIdsToInclude.length > 0) {
    matchStage.user = {
      $in: userIdsToInclude.map((id) =>
        typeof id === "string" ? new mongoose.Types.ObjectId(id) : id
      ),
    };
  }

  return StudySession.aggregate([
    { $match: matchStage },
    { $group: { _id: "$user", totalDuration: { $sum: "$duration" } } },
    { $sort: { totalDuration: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        userId: "$user._id",
        username: "$user.FirstName",
        profilePicture: "$user.ProfilePicture",
        totalDuration: 1,
      },
    },
  ]);
};

// Controller: User study stats
const getUserStudyStats = async (req, res) => {
  try {
    const stats = await getUserStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return sendError(res, 500, "Failed to fetch user stats", error.message);
  }
};

// Controller: Leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { period, friendsOnly } = req.query;
    const leaderboard = await getLeaderboardData(
      period,
      friendsOnly === "true",
      req.user?.id
    );
    res.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return sendError(res, 500, "Failed to fetch leaderboard", error.message);
  }
};

// Controller: Consolidated stats
const getConsolidatedStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { period = "weekly", friendsOnly = "false" } = req.query;

    const [userStats, periodStats, leaderboard] = await Promise.all([
      getUserStats(userId),
      calculateStats(userId, period),
      getLeaderboardData(period, friendsOnly === "true", userId),
    ]);

    res.json({ userStats, periodStats, leaderboard });
  } catch (error) {
    console.error("Consolidated stats error:", error);
    return sendError(
      res,
      500,
      "Failed to fetch consolidated stats",
      error.message
    );
  }
};

// =====================
// Exports
// =====================
export {
  createStudySession,
  getStudySessionStats,
  getUserStudyStats,
  getLeaderboard,
  getConsolidatedStats,
  createManualSession,
  getManualSessions,
  updateManualSession,
  deleteManualSession,
  // Helpers
  getUserStats,
  getLeaderboardData,
};
