// backend/services/ocrService.js

const AWS = require("aws-sdk");
const axios = require("axios");

const s3 = new AWS.S3();

// ⚠️ 하드코딩한 API 키 (보안상 환경변수 사용을 권장합니다)
const VISION_API_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD43Ie//+q5cAJk\n50el3QQQx7xXWIYT/b4cCrNZRC9j40KGSGjGyQH5aHR9zgIYEhJDNAc/7KXbm88F\n71TXpTG0lJ73UO9f2H4r+34n1nGQ1NIRr+lcRrfRy+qJNi84XpRAeVzsUVV5TBnH\nzd4kT/EvqHy62MYG6UVvV9kzC8IsE7Gs3tKc0cvplIkQfkS3cSZacrZrr4EiHop3\nAiQybKwudpJtBebWtj47nwl7xBjWURMoFY0vbEOpjtNT+jt+PqUOiKn5aYzYnArC\nYMnDbOFS0zQt3jprnhMpPcHl3m7ZEEEe50x6j98N8VU1C6wJSAy029KPWtmXFcus\nzBt821lLAgMBAAECggEADsXRIf5F4vqU+vG0mwkK5IauzI3/gB5xSmHaOzqJmn6T\nUk6fE1nOBNcXLOjthZvX34tAeOt32U+M9+CUYvWRqZM11NYhnCSSVfefib24c/ZK\nyBEBSBde4DlE/NV2qbMJ4J2hapD6TEzOiYsK5bXuAPLi3AaYpZ6GDLrtokmYnfeE\nxuUsSyQRoIqappfPW7hZgUCLN4rTdjvkbgrGfM8E5rlrCdXO2ZTchSs+IXnm6klr\ni/9rmws5SsgcL7QBM02YI7gEOyQ9G74Ik5+Xv1B3ofouAfnVt1VVI4vM7/J1V4B3\nGgB78Kuehid/TZbI3mVFdq9xX1rNsUNChooJVjxycQKBgQD/1vdEdG3wUpA6TR77\n8Me2bUMguMaYeHnt+MxpX06jLw/SnYj8Ew0zoiFHYTEiY/vzpnx7S1yw09/7F4Lc\nan9v3DC7zExu+6IyT95Kkny8dCHIvjxnAi1iYjdoQ4fauwSSW/kMK/eH+Yn22JD6\nao3G909JmDTtDUMqPVGb59vnUQKBgQD5BHH00bKxGgWDLBn2mDbZRYYwb3QVXOqD\nJOL5liUgzXapQsDXrwzCoInXeI3B2jDnhHLNi/ErP/eWjYiHbW6duVzJ/01fN4k6\nyQyfZ0vvLrHL81M9JIf1bGTAWf+iAl+vCBIVzAqRPKVkM+Qy45T+lgCb5up7Nx2G\nRF0UAgVH2wKBgFUTBbyUvu44dk98z73VroOiR7081IVlIp6Yqlir4blv7+IIksHI\nEA7IbiqPTkhyWRkHlsNlJxiCDCwyAEkNfP0UinwYjp4lPSVf27qOhb4hHA7l+64B\nUlgx8tzQAAAjSnzk6qc6g6CKwW79SxCKmES+fnYpkAf37grAwz+F1WFRAoGAOggw\nKnbIJv/CcxxO/KnidmX+bME8k1HxERkCkFnOU0OuuKlm2Zzg42aYWQ+uMZQQu5Oh\nUYegb4zbvUlEnRMCqV0uY6DMvjjqEToTZ/6hsp72LmqJZoFh8e8N18nhijb1Z4wA\n8vV3LPuuK5jwQG/LJD1+7NY2pPpmNgkui+AgrOsCgYEA9awgJfVI5VFsjK6q6ovZ\njGxkRfc1WJfNJGmS5CpGoOx96kHjTwR487Mn6DMlNEcVWj9kkVB67ZRru/0vPuFh\nX6rpBLbPKd9tU2w5plUTL90hy5H9INXPEfSoCkHI/K1uxQpRy1z5RMlqKwgNeXbn\n9vDnDoyq30he/b7l1WiAzkE=\n-----END PRIVATE KEY-----\n";
const VISION_URL = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

/**
 * S3 키(key)를 받아
 *  1) presigned URL 생성
 *  2) 이미지 다운로드 → Buffer
 *  3) Base64 인코딩 → Vision REST OCR 요청
 *  4) 추출된 텍스트 반환
 *
 * @param {string} key S3 오브젝트 키
 * @returns {Promise<string>}
 */
const performOCR = async (key) => {
  try {
    console.log("🧠 Starting OCR with presigned URL...");

    // 1) presigned URL 생성
    const Bucket = process.env.AWS_S3_BUCKET;
    const presignedUrl = s3.getSignedUrl("getObject", {
      Bucket,
      Key: key,
      Expires: 60, // 1분
    });

    // 2) 이미지 다운로드
    const response = await axios.get(presignedUrl, {
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(response.data);

    // 3) REST API Key 방식 OCR 요청
    const content = imageBuffer.toString("base64");
    const visionResp = await axios.post(
      VISION_URL,
      {
        requests: [
          {
            image: { content },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      },
      { timeout: 60000 }
    );

    // 4) 결과 텍스트 추출
    const text =
      visionResp.data.responses?.[0]?.textAnnotations?.[0]?.description || "";

    console.log("📄 OCR 완료:", text.slice(0, 100));
    return text;
  } catch (err) {
    // axios 에러인 경우엔 err.response.data, 아니면 err.message 출력
    console.error("❌ OCR error:", err.response?.data || err.message);
    throw err;
  }
};

module.exports = { performOCR };
