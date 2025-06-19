// backend/routes/classScheduleRoutes.js

const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload"); // S3 multer 미들웨어
const { processImageAndExtractText } = require("../services/imageProcessor");
const { matchLectures } = require("../services/lectureMatcher");

// 1) 업로드 + Multer 에러 처리
router.post(
  "/class-schedule/upload",
  (req, res, next) => {
    upload.single("image")(req, res, function (err) {
      if (err) {
        console.error("❌ Multer upload error:", err);
        return res.status(500).json({ error: "Upload failed", detail: err.message });
      }
      next();
    });
  },
  // 2) OCR 호출 + 예외 처리
  async (req, res) => {
    console.log("📥 Received upload request. File info:", req.file);

    if (!req.file || !req.file.location) {
      return res.status(400).json({ error: "No file uploaded or location missing" });
    }

    try {
      const imageUrl = req.file.location; // S3에 업로드된 공개 URL
      console.log("🌐 Image URL for Vision API:", imageUrl);

      // processImageAndExtractText 이 예외를 던지면 catch 로 빠집니다.
      const detectedBlocks = await processImageAndExtractText(imageUrl);
      console.log("📦 OCR 결과 블록:", detectedBlocks);

      const finalLectures = await matchLectures(detectedBlocks);
      console.log("✅ Returning final lectures:", finalLectures);

      return res.json({ lectures: finalLectures });
    } catch (error) {
      console.error("❌ schedule/upload 에러:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
);

module.exports = router;
