// backend/services/imageProcessor.js

const AWS = require("aws-sdk");
const axios = require("axios");
const Jimp = require("jimp");
const gridPositions = require("../utils/gridPositions");  // 그리드 좌표 배열

// REST 호출용 Vision API URL (API Key 방식)
const VISION_API_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD43Ie//+q5cAJk\n50el3QQQx7xXWIYT/b4cCrNZRC9j40KGSGjGyQH5aHR9zgIYEhJDNAc/7KXbm88F\n71TXpTG0lJ73UO9f2H4r+34n1nGQ1NIRr+lcRrfRy+qJNi84XpRAeVzsUVV5TBnH\nzd4kT/EvqHy62MYG6UVvV9kzC8IsE7Gs3tKc0cvplIkQfkS3cSZacrZrr4EiHop3\nAiQybKwudpJtBebWtj47nwl7xBjWURMoFY0vbEOpjtNT+jt+PqUOiKn5aYzYnArC\nYMnDbOFS0zQt3jprnhMpPcHl3m7ZEEEe50x6j98N8VU1C6wJSAy029KPWtmXFcus\nzBt821lLAgMBAAECggEADsXRIf5F4vqU+vG0mwkK5IauzI3/gB5xSmHaOzqJmn6T\nUk6fE1nOBNcXLOjthZvX34tAeOt32U+M9+CUYvWRqZM11NYhnCSSVfefib24c/ZK\nyBEBSBde4DlE/NV2qbMJ4J2hapD6TEzOiYsK5bXuAPLi3AaYpZ6GDLrtokmYnfeE\nxuUsSyQRoIqappfPW7hZgUCLN4rTdjvkbgrGfM8E5rlrCdXO2ZTchSs+IXnm6klr\ni/9rmws5SsgcL7QBM02YI7gEOyQ9G74Ik5+Xv1B3ofouAfnVt1VVI4vM7/J1V4B3\nGgB78Kuehid/TZbI3mVFdq9xX1rNsUNChooJVjxycQKBgQD/1vdEdG3wUpA6TR77\n8Me2bUMguMaYeHnt+MxpX06jLw/SnYj8Ew0zoiFHYTEiY/vzpnx7S1yw09/7F4Lc\nan9v3DC7zExu+6IyT95Kkny8dCHIvjxnAi1iYjdoQ4fauwSSW/kMK/eH+Yn22JD6\nao3G909JmDTtDUMqPVGb59vnUQKBgQD5BHH00bKxGgWDLBn2mDbZRYYwb3QVXOqD\nJOL5liUgzXapQsDXrwzCoInXeI3B2jDnhHLNi/ErP/eWjYiHbW6duVzJ/01fN4k6\nyQyfZ0vvLrHL81M9JIf1bGTAWf+iAl+vCBIVzAqRPKVkM+Qy45T+lgCb5up7Nx2G\nRF0UAgVH2wKBgFUTBbyUvu44dk98z73VroOiR7081IVlIp6Yqlir4blv7+IIksHI\nEA7IbiqPTkhyWRkHlsNlJxiCDCwyAEkNfP0UinwYjp4lPSVf27qOhb4hHA7l+64B\nUlgx8tzQAAAjSnzk6qc6g6CKwW79SxCKmES+fnYpkAf37grAwz+F1WFRAoGAOggw\nKnbIJv/CcxxO/KnidmX+bME8k1HxERkCkFnOU0OuuKlm2Zzg42aYWQ+uMZQQu5Oh\nUYegb4zbvUlEnRMCqV0uY6DMvjjqEToTZ/6hsp72LmqJZoFh8e8N18nhijb1Z4wA\n8vV3LPuuK5jwQG/LJD1+7NY2pPpmNgkui+AgrOsCgYEA9awgJfVI5VFsjK6q6ovZ\njGxkRfc1WJfNJGmS5CpGoOx96kHjTwR487Mn6DMlNEcVWj9kkVB67ZRru/0vPuFh\nX6rpBLbPKd9tU2w5plUTL90hy5H9INXPEfSoCkHI/K1uxQpRy1z5RMlqKwgNeXbn\n9vDnDoyq30he/b7l1WiAzkE=\n-----END PRIVATE KEY-----\n";
const VISION_URL =
  `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

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
