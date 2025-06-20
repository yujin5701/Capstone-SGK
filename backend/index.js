const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const userRoutes = require("./routes/userRoutes");
const db = require("./lib/db");
const scheduleRoutes = require('./routes/scheduleRoutes');
const placeInfoRoutes = require("./routes/placeInfoRoutes");
const addressRoutes = require("./routes/addressRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const autoScheduleRoutes = require("./routes/autoScheduleRoutes");
// const uploadRoutes = require("./routes/uploadRoutes")
// const timetableRoutes = require("./routes/timetableRoutes");
const distanceRoutes = require("./routes/distanceRoutes");
const dotenv = require("dotenv");
const { generateNextMonthRecurringSchedules } = require("./services/scheduleService");
const preferenceRoutes = require('./routes/preferenceRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const classScheduleRoutes = require("./routes/classScheduleRoutes");
const placeRoutes = require('./routes/placeRoutes');
const lectureScheduleRoutes = require('./routes/lectureScheduleRoutes');

// 미들웨어
// const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();
const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "https://capstone-api-smoky.vercel.app", "https://capstone-4uwf6wtk1-yeolmaes-projects.vercel.app", 
    "https://capstone-sgk-three.vercel.app", "https://capstone-3hc2mou8x-e-clair.vercel.app", "https://capstone-api-one.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  console.log("💓 Health check hit");
  res.send("OK");
});


app.use("/api/user", userRoutes);
app.use("/api/lecture-schedules", lectureScheduleRoutes);

// app.use(authMiddleware); // 토큰 인증 미들웨어(userRoutes는 필요없음)

app.use('/api', scheduleRoutes);
app.use("/api", placeInfoRoutes);
app.use("/api/recommendation", recommendationRoutes);
app.use("/address", addressRoutes);
app.use("/api", autoScheduleRoutes);
app.use("/recommendation", require("./routes/recommendationRoutes"));
app.use('/api/preferences', preferenceRoutes);
app.use('/api', feedbackRoutes);
app.use("/api", classScheduleRoutes);
app.use("/api", distanceRoutes);
app.use('/api/places', placeRoutes);


// app.use("/api", distanceRoutes);
// app.use("/upload", uploadRoutes);
// app.use("/api", timetableRoutes);

// 서버 실행
const PORT = parseInt(process.env.PORT, 10) || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

db.query("SELECT NOW()")
  .then(res => console.log("✅ PostgreSQL Connected!", res.rows[0]))
  .catch(err => console.error("❌ PostgreSQL Connection Error:", err));

// 매달 1일 00시에 반복 일정 생성(시간표 일정)
cron.schedule("0 0 1 * *", async () => {
  console.log("📆 매달 반복 일정 생성 시작");
  await generateNextMonthRecurringSchedules();
});
