// backend/services/imageProcessor.js
const gridPositions = require("../utils/gridPositions");
const { performOCR } = require("./ocrService");

/**
 * S3에 올린 공개 URL 하나를 받아 전체 OCR → 단일 블록으로 반환
 * @param {string} imageUrl - S3 공개 이미지 URL
 * @returns {Promise<Array<{day:string,period:string,lectureNameCandidate:string}>>}
 */
async function processImageAndExtractText(imageUrl) {
  console.log("🧠 Starting OCR processing using URL...", imageUrl);

  let ocrResult;
  try {
    ocrResult = await performOCR(imageUrl);
  } catch (e) {
    console.error("❌ OCR error for imageUrl:", imageUrl, e);
    return [];
  }

  console.log("📄 OCR result:\n", ocrResult);

  if (!ocrResult.trim()) return [];

  const lines = ocrResult
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return [
    {
      day: "전체",
      period: "전체",
      lectureNameCandidate: lines.join(" "),
    },
  ];
}

module.exports = { processImageAndExtractText };
