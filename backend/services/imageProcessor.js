const gridPositions = require("../utils/gridPositions");
const { performOCR } = require("./ocrService");
const Jimp = require("jimp");
const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient({
  fallback: "rest", // 핵심 설정
  keyFilename: "/app/keys/dayfull-timetable-e933618fea72.json", // JSON 키 경로
});

const processImageAndExtractText = async (imageUrl) => {
  try {
    console.log("🧠 Starting OCR processing using URL...");
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
