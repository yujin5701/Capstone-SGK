const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload"); // S3 multer 미들웨어
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

    if (!req.file || !req.file.key) {
      return res.status(400).json({ error: "No file uploaded or key missing" });
    }

    try {
      const s3Key = req.file.key; // ✅ S3 object key 전달
      console.log("🔑 S3 Object Key:", s3Key);

      const detectedBlocks = await processImageAndExtractText(s3Key);
      const finalLectures = await matchLectures(detectedBlocks);

      console.log("✅ Returning final lectures:", finalLectures);
      return res.json({ lectures: finalLectures });
    } catch (error) {
      console.error("❌ Error in schedule generation:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
