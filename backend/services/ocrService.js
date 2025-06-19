const AWS = require("aws-sdk");
const vision = require("@google-cloud/vision");
const axios = require("axios");

const s3 = new AWS.S3();

// Vision API 클라이언트 생성
const client = new vision.ImageAnnotatorClient({
  keyFilename: "/app/keys/dayfull-timetable-e933618fea72.json",
  fallback: "rest", // gRPC 에러 우회
});

/**
 * S3 URL에서 presigned URL → axios로 다운로드 → base64 인코딩 → Vision API OCR
 */
const performOCR = async (imageUrl) => {
  try {
    console.log("🧠 Starting OCR with presigned URL...");

    // 1. S3 키 추출
    const key = imageUrl.split("/").pop();
    const Bucket = process.env.AWS_S3_BUCKET;

    // 2. presigned URL 생성
    const presignedUrl = s3.getSignedUrl("getObject", {
      Bucket,
      Key: key,
      Expires: 60, // 1분
    });

    // 3. axios로 이미지 다운로드 (arraybuffer 형태로)
    const response = await axios.get(presignedUrl, {
      responseType: "arraybuffer",
    });

    const imageBuffer = Buffer.from(response.data);

    // 4. Vision API에 base64로 전달
    const [result] = await client.textDetection({
      image: {
        content: imageBuffer.toString("base64"),
      },
    });

    const detections = result.textAnnotations;
    const text = detections?.[0]?.description || "";

    console.log("📄 OCR 완료:", text.slice(0, 100) + "...");
    return text;
  } catch (err) {
    console.error("❌ OCR 오류:", err);
    throw err;
  }
};

module.exports = { performOCR };
