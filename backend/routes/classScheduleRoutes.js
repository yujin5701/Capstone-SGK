const express = require("express");
const router = express.Router();
const axios = require("axios"); // S3 이미지 다운로드
const upload = require("../middlewares/upload"); // S3 기반 multer
const { processImageAndExtractText } = require("../services/imageProcessor");
const { matchLectures } = require("../services/lectureMatcher");

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
  async (req, res) => {
    console.log("📥 Received upload request. File info:", req.file);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = req.file.location;
    const detectedBlocks = await processImageAndExtractText(imageUrl);
    const finalLectures = await matchLectures(detectedBlocks);
    res.json({ lectures: finalLectures });
  }
);

module.exports = router;
