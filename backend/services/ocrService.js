const AWS = require("aws-sdk");
const vision = require("@google-cloud/vision");
const axios = require("axios");

const s3 = new AWS.S3();
const client = new vision.ImageAnnotatorClient({
  keyFilename: "/app/keys/dayfull-timetable-e933618fea72.json",
  fallback: "rest",
});

/**
 * S3 키(key)를 받아 Presigned URL 생성 → 다운로드 → Base64 → Vision OCR
 * @param {string} key
 * @returns {Promise<string>}
 */
const performOCR = async (key) => {
  try {
    console.log("🧠 Starting OCR with presigned URL...");
    const Bucket = process.env.AWS_S3_BUCKET;
    const presignedUrl = s3.getSignedUrl("getObject", {
      Bucket,
      Key: key,
      Expires: 60,
    });

    // 1) 이미지 다운로드
    const response = await axios.get(presignedUrl, {
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(response.data);

    // 2) Vision OCR
    const [result] = await client.textDetection({
      image: { content: imageBuffer.toString("base64") },
    });
    const text = result.textAnnotations?.[0]?.description || "";
    console.log("📄 OCR 완료:", text.slice(0, 100));
    return text;
  } catch (err) {
    console.error("❌ OCR error:", err);
    throw err;
  }
};

module.exports = { performOCR };
