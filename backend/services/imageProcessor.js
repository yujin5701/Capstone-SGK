// backend/services/imageProcessor.js

const axios = require("axios");
const Jimp = require("jimp");
const gridPositions = require("../utils/gridPositions");
const { performOCR } = require("./ocrService");

/**
 * S3 공개 URL(imageUrl)을 받아
 *  1) axios로 이미지 다운로드 → Buffer
 *  2) Jimp.read
 *  3) gridPositions 순회하며 x1,y1,x2,y2 대로 crop → cellImg
 *  4) performOCR(buffer) → text
 *  5) { day, period, lectureNameCandidate } 목록 반환
 */
async function processImageAndExtractText(imageUrl) {
  console.log("🔍 [DEBUG] processImageAndExtractText start:", imageUrl);

  // 1) S3 URL → Buffer
  let imgBuf;
  try {
    const resp = await axios.get(imageUrl, { responseType: "arraybuffer" });
    imgBuf = Buffer.from(resp.data);
  } catch (err) {
    console.error("❌ 이미지 다운로드 실패:", err);
    throw err;
  }

  // 2) Jimp 로드
  let image;
  try {
    image = await Jimp.read(imgBuf);
  } catch (err) {
    console.error("❌ Jimp.read 실패:", err);
    throw err;
  }

  const detectedBlocks = [];

  // 3) 셀별 크롭 & OCR
  for (const { day, period, x1, y1, x2, y2 } of gridPositions) {
    const w = x2 - x1;
    const h = y2 - y1;
    let cellImg, cellBuf, text;
    try {
      cellImg = image.clone().crop(x1, y1, w, h);
      cellBuf = await cellImg.getBufferAsync(Jimp.MIME_JPEG);
      text = await performOCR(cellBuf);   // ocrService 의 performOCR(buffer) 사용
      text = text?.trim().replace(/\r?\n/g, " ") || "";
      console.log(`✅ OCR [${day}-${period}]:`, text.split(" ").slice(0,3).join(" "));
    } catch (err) {
      console.error(`❌ OCR 에러 [${day}-${period}]:`, err);
      continue;
    }

    if (text) {
      detectedBlocks.push({ day, period, lectureNameCandidate: text });
    }
  }

  console.log("📦 Detected blocks:", detectedBlocks);
  return detectedBlocks;
}

module.exports = { processImageAndExtractText };
