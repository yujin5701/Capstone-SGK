const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { processImageAndExtractText } = require("../services/imageProcessor");
const { matchLectures } = require("../services/lectureMatcher");

router.post(
  "/class-schedule/upload",
  upload.single("image"),
  async (req, res) => {
    console.log("📥 Received upload request. File info:", req.file);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // 1) S3 오브젝트 키만 서비스 레이어로 전달
      const s3Key = req.file.key;
      console.log("🔑 S3 Object Key:", s3Key);

      // 2) 이미지 다운로드 + OCR → 텍스트 추출
      const detectedText = await processImageAndExtractText(s3Key);

      // 3) 강의 매칭
      const finalLectures = await matchLectures(detectedText);
      console.log("✅ Returning final lectures:", finalLectures);

      return res.json({ lectures: finalLectures });
    } catch (error) {
      console.error("❌ Error in schedule generation:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
