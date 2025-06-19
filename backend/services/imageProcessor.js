// imageProcessor.js
const { performOCR } = require("./ocrService");

async function processImageAndExtractText(imageUrl) {
  console.log("🧠 OCR 시작:", imageUrl);
  let text = "";
  try {
    text = await performOCR(imageUrl);
  } catch (e) {
    console.error("❌ OCR 에러:", e);
    return [];
  }
  if (!text.trim()) return [];

  // 전체 텍스트 하나로 리턴
  const lecture = text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l)
    .join(" ");
  return [{
    day: "전체",
    period: "전체",
    lectureNameCandidate: lecture
  }];
}

module.exports = { processImageAndExtractText };
