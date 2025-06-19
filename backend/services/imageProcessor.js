const gridPositions = require("../utils/gridPositions");
const { performOCR } = require("./ocrService");
const Jimp = require("jimp");
const vision = require("@google-cloud/vision");

// 🔄 gRPC 대신 REST 모드로 Vision API 호출
const client = new vision.ImageAnnotatorClient({
  fallback: "rest", // 핵심 옵션
  keyFilename: "/app/keys/dayfull-timetable-e933618fea72.json", // 키 파일 경로
});

/**
 * S3 이미지 URL을 받아서 Google Vision으로 OCR 텍스트 추출
 * @param {string} imageUrl - S3에 업로드된 이미지의 공개 URL
 * @returns {Promise<string>} - 추출된 전체 텍스트
 */
const processImageAndExtractText = async (imageUrl) => {
  try {
    console.log("🧠 Starting OCR processing using REST API and image URL...");
    
    const [result] = await client.documentTextDetection({
      image: {
        source: { imageUri: imageUrl },
      },
    });

    const text = result.fullTextAnnotation?.text || "";
    console.log("📄 OCR 결과:", text.slice(0, 100) + "...");
    return text;
  } catch (err) {
    console.error("❌ OCR 처리 중 오류 발생:", err);
    throw err;
  }
};

module.exports = { processImageAndExtractText };