// backend/services/imageProcessor.js

const AWS = require("aws-sdk");
const axios = require("axios");
const Jimp = require("jimp");
const gridPositions = require("../utils/gridPositions");  // 그리드 좌표 배열

// REST 호출용 Vision API URL (API Key 방식)
const VISION_URL =
  `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`;

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

  const detectedBlocks = [];

  // 3) 블록별로 OCR 수행
  for (const { day, period, x1, y1, x2, y2 } of gridPositions) {
    // x2,y2 로부터 너비(width)와 높이(height) 계산
    const w = x2 - x1;
    const h = y2 - y1;

    try {
      // 3.1) 지정 영역 크롭
      const blockImg = image.clone().crop(x1, y1, w, h);

      // 3.2) 버퍼로 추출 후 Base64 인코딩
      const buffer = await blockImg.getBufferAsync(Jimp.MIME_JPEG);
      const content = buffer.toString("base64");

      // 3.3) HTTP REST로 Vision OCR 수행 (DOCUMENT_TEXT_DETECTION)
      const resp = await axios.post(
        VISION_URL,
        {
          requests: [{
            image: { content },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }]
          }]
        },
        { timeout: 60000 }
      );

      const fullText =
        resp.data.responses?.[0]?.fullTextAnnotation?.text?.trim() || "";

      // 3.4) 결과가 있으면 배열에 추가
      if (fullText) {
        detectedBlocks.push({
          day,
          period,
          lectureNameCandidate: fullText.replace(/\r?\n/g, " "),
        });
        console.log(`✅ OCR [${day}-${period}]:`, fullText.split("\n")[0]);
      }
    } catch (err) {
      // axios 에러면 err.response.data, 아니면 err.message
      console.error(
        `❌ OCR error at block ${day}-${period}:`,
        err.response?.data || err.message
      );
    }
  }

  return detectedBlocks;
};

module.exports = { processImageAndExtractText };
