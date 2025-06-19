// backend/services/imageProcessor.js

const AWS   = require("aws-sdk");
const vision = require("@google-cloud/vision");
const Jimp  = require("jimp");
const gridPositions = require("../utils/gridPositions");

// Google Cloud Vision 클라이언트 (서비스 계정 JSON 인증)
const client = new vision.ImageAnnotatorClient({
  fallback: "rest",
  // keyFilename 옵션은 로컬에서만 쓰셔도 되고,
  // Render에선 GOOGLE_APPLICATION_CREDENTIALS 환경변수로 경로 지정하셨으니 없어도 됩니다.
});

/**
 * S3 키(key)를 받아
 *  1) S3에서 원본 이미지 가져오기
 *  2) gridPositions로 정의된 블록 단위로 잘라서
 *  3) Jimp로 크롭 → Base64 인코딩 → OCR
 *  4) { day, period, lectureNameCandidate } 목록 반환
 */
async function processImageAndExtractText(key) {
  // S3에서 이미지 버퍼 다운로드
  const s3 = new AWS.S3({ region: process.env.AWS_REGION });
  let imageBuffer;
  try {
    ({ Body: imageBuffer } = await s3
      .getObject({ Bucket: process.env.AWS_S3_BUCKET, Key: key })
      .promise());
  } catch (err) {
    console.error("❌ S3 getObject failed:", err);
    return [];
  }

  // Jimp로 이미지 로드
  let image;
  try {
    image = await Jimp.read(imageBuffer);
  } catch (err) {
    console.error("❌ Jimp.read failed:", err);
    return [];
  }

  const positions = gridPositions;  // 배열 그대로
  const detectedBlocks = [];

  for (const { day, period, x1, y1, x2, y2 } of positions) {
    const w = x2 - x1;
    const h = y2 - y1;

    try {
      // 1) 크롭
      const blockImg = image.clone().crop(x1, y1, w, h);
      // 2) Base64 인코딩
      const buffer = await blockImg.getBufferAsync(Jimp.MIME_JPEG);
      const base64 = buffer.toString("base64");
      // 3) Vision OCR
      const [result] = await client.textDetection({
        image: { content: base64 },
      });
      const text = result.textAnnotations?.[0]?.description?.trim() || "";
      if (text) {
        detectedBlocks.push({
          day,
          period,
          lectureNameCandidate: text.replace(/\r?\n/g, " "),
        });
        console.log(`✅ OCR [${day}-${period}]:`, text.split("\n")[0]);
      }
    } catch (err) {
      console.error(`❌ OCR error at block ${day}-${period}:`, err);
    }
  }

  return detectedBlocks;
}

module.exports = { processImageAndExtractText };
