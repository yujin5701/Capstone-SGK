const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const db = require("./lib/db");
const dotenv = require("dotenv");
dotenv.config();

const userRoutes             = require("./routes/userRoutes");
const lectureScheduleRoutes  = require("./routes/lectureScheduleRoutes");
const scheduleRoutes         = require("./routes/scheduleRoutes");
const placeInfoRoutes        = require("./routes/placeInfoRoutes");
const addressRoutes          = require("./routes/addressRoutes");
const recommendationRoutes   = require("./routes/recommendationRoutes");
const autoScheduleRoutes     = require("./routes/autoScheduleRoutes");
const preferenceRoutes       = require("./routes/preferenceRoutes");
const feedbackRoutes         = require("./routes/feedbackRoutes");
const classScheduleRoutes    = require("./routes/classScheduleRoutes");
const distanceRoutes         = require("./routes/distanceRoutes");
const placeRoutes            = require("./routes/placeRoutes");
const { generateNextMonthRecurringSchedules } = require("./services/scheduleService");

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;

// CORS & JSON
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    /* 배포 URL 등 */
  ],
  credentials: true
}));
app.use(express.json());

// 헬스체크
app.get("/", (req, res) => res.send("OK"));

// API 라우트
app.use("/api/user", userRoutes);
app.use("/api/lecture-schedules", lectureScheduleRoutes);
app.use("/api", scheduleRoutes);
app.use("/api", placeInfoRoutes);
app.use("/api/recommendation", recommendationRoutes);
app.use("/address", addressRoutes);
app.use("/api", autoScheduleRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api", feedbackRoutes);
app.use("/api", classScheduleRoutes);
app.use("/api/distance", distanceRoutes);
app.use("/api/places", placeRoutes);

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// PostgreSQL 연결 확인
db.query("SELECT NOW()")
  .then(r => console.log("✅ PostgreSQL Connected!", r.rows[0]))
  .catch(e => console.error("❌ PostgreSQL Connection Error:", e));

// 매달 1일 00시 반복 일정 생성
cron.schedule("0 0 1 * *", async () => {
  console.log("📆 매달 반복 일정 생성 시작");
  await generateNextMonthRecurringSchedules();
});
