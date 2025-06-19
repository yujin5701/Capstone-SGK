// backend/services/imageProcessor.js

const AWS = require("aws-sdk");
const vision = require("@google-cloud/vision");
const Jimp = require("jimp");
const gridPositions = require("../utils/gridPositions");  // 요 부분 그대로 유지

// REST 모드 Vision 클라이언트
const client = new vision.ImageAnnotatorClient({
  fallback: "rest",
  keyFilename: "/app/keys/dayfull-timetable-e933618fea72.json",
});

/**
 * S3 키(key)를 받아
 *  1) S3에서 원본 이미지 가져오기
 *  2) gridPositions로 정의된 블록 단위로 잘라서
 *  3) Jimp로 크롭 → Base64 인코딩 → OCR
 *  4) { day, period, lectureNameCandidate } 목록 반환
 *
 * @param {string} key S3 오브젝트 키
 * @returns {Promise<Array<{day:string, period:string, lectureNameCandidate:string}>>}
 */
const processImageAndExtractText = async (key) => {
  // 1) S3에서 이미지 버퍼 다운로드
  const s3 = new AWS.S3({ region: process.env.AWS_REGION });
  let imageBuffer;
  try {
    const { Body } = await s3
      .getObject({ Bucket: process.env.AWS_S3_BUCKET, Key: key })
      .promise();
    imageBuffer = Body;
  } catch (err) {
    console.error("❌ S3 getObject failed:", err);
    return [];
  }

  // 2) Jimp로 원본 이미지 로드
  let image;
  try {
    image = await Jimp.read(imageBuffer);
  } catch (err) {
    console.error("❌ Jimp.read failed:", err);
    return [];
  }

  const positions = gridPositions();  // [{ day, period, x1, y1, width, height }, ...]
  const detectedBlocks = [];

  // 3) 블록별로 OCR 수행
  for (const { day, period, x1, y1, width, height } of positions) {
    try {
      const blockImg = image.clone().crop(x1, y1, width, height);
      const buffer = await blockImg.getBufferAsync(Jimp.MIME_JPEG);
      const base64 = buffer.toString("base64");

      // Vision OCR
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
};

module.exports = { processImageAndExtractText };
