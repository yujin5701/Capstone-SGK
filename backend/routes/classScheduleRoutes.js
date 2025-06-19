const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { processImageAndExtractText } = require("../services/imageProcessor");
const { matchLectures } = require("../services/lectureMatcher");

router.post("/class-schedule/upload", upload.single("image"), async (req, res) => {
  console.log("📥 Received upload request. File info:", req.file);

  try {
    const imageUrl = req.file.location; // ✅ S3 업로드 후 생성된 URL
    console.log("🌐 Image URL for Vision API:", imageUrl);

    const detectedText = await processImageAndExtractText(imageUrl);
    const finalLectures = await matchLectures(detectedText);

    console.log("✅ Returning final lectures:", finalLectures);
    res.json({ lectures: finalLectures });
  } catch (error) {
    console.error("❌ Error in schedule generation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
