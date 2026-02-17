import { Router } from "express";
import jwt from "jsonwebtoken";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { daysAgo, toDateKey } from "../utils/date.js";

const router = Router();

// Build a fixed window of daily counts to power the chart UI.
const buildDailyCounts = (records, days = 7) => {
  const counts = new Map();
  records.forEach((record) => {
    counts.set(record.dateKey, (counts.get(record.dateKey) || 0) + 1);
  });

  return Array.from({ length: days }).map((_, index) => {
    const date = toDateKey(daysAgo(days - 1 - index));
    return { date, count: counts.get(date) || 0 };
  });
};

// Count consecutive attendance days ending today (UTC).
const computeStreak = (dateKeys) => {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < dateKeys.length; i += 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - i);
    const key = toDateKey(date);
    if (dateKeys.includes(key)) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
};

router.use(requireAuth);

router.post("/scan", async (req, res) => {
  const { qrToken } = req.body;
  if (!qrToken) {
    return res.status(400).json({ message: "QR token is required" });
  }

  try {
    const decoded = jwt.verify(qrToken, process.env.JWT_SECRET);
    if (decoded.type !== "qr") {
      return res.status(400).json({ message: "Invalid QR token" });
    }

    const user = await User.findById(decoded.sub).select("name email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const dateKey = toDateKey();
    const attendance = await Attendance.create({ user: user._id, dateKey });
    return res.status(201).json({
      message: "Attendance recorded",
      attendance: { ...attendance.toObject(), user },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Attendance already recorded today" });
    }
    return res.status(400).json({ message: "Unable to validate QR token" });
  }
});

router.get("/me", async (req, res) => {
  const records = await Attendance.find({ user: req.user._id })
    .sort({ scannedAt: -1 })
    .limit(30);

  const dateKeys = records.map((record) => record.dateKey);
  const total = await Attendance.countDocuments({ user: req.user._id });
  const streak = computeStreak(Array.from(new Set(dateKeys)));
  const daily = buildDailyCounts(records);

  res.json({
    total,
    streak,
    recent: records,
    daily,
  });
});

router.get("/summary", requireRole(["admin"]), async (req, res) => {
  const todayKey = toDateKey();
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  const monthKey = toDateKey(startOfMonth);

  const records = await Attendance.find({
    dateKey: { $gte: toDateKey(daysAgo(6)) },
  });

  const daily = buildDailyCounts(records);

  const totals = {
    users: await User.countDocuments(),
    today: await Attendance.countDocuments({ dateKey: todayKey }),
    month: await Attendance.countDocuments({ dateKey: { $gte: monthKey } }),
  };

  res.json({ totals, daily });
});

export default router;
