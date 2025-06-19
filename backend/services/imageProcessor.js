// backend/services/imageProcessor.js

const gridPositions = require("../utils/gridPositions");
const { performOCR } = require("./ocrService");

/**
 * S3에 올린 공개 URL 하나를 받아 전체 OCR → 단일 블록으로 반환
 * @param {string} imageUrl - S3 공개 이미지 URL
 * @returns {Promise<Array<{day:string,period:string,lectureNameCandidate:string}>>}
 */
async function processImageAndExtractText(imageUrl) {
  // 1) 함수 호출 진입 로그
  console.log("🔍 [DEBUG] processImageAndExtractText start:", imageUrl);

  try {
    // 2) 기존 OCR 처리 진입 로그
    console.log("🧠 Starting OCR processing using URL...", imageUrl);

    // 3) 실제 OCR 수행
    const ocrResult = await performOCR(imageUrl);

    // 4) 결과 로그
    console.log("📄 OCR result:\n", ocrResult);

    // 5) 빈 문자열이면 빈 배열
    if (!ocrResult || !ocrResult.trim()) {
      console.warn("⚠️ OCR 결과가 비어있습니다. 빈 배열 반환");
      return [];
    }

    // 6) 텍스트 가공
    const lines = ocrResult
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // 7) 단일 블록 형태로 반환
    return [
      {
        day: "전체",
        period: "전체",
        lectureNameCandidate: lines.join(" "),
      },
    ];
  } catch (err) {
    // 8) 에러 발생 시 로그를 찍고, 빈 배열이 아닌 예외 던지기
    console.error("🔥 [ERROR] OCR 처리 중 예외 발생:", err);
    throw err;
  }
}

module.exports = { processImageAndExtractText };
