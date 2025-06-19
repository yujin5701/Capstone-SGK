const AWS = require("aws-sdk");
const vision = require("@google-cloud/vision");
const axios = require("axios");

const s3 = new AWS.S3(); // 이미 AWS config는 env로 설정되어 있어야 함

const client = new vision.ImageAnnotatorClient({
  keyFilename: "/app/keys/dayfull-timetable-e933618fea72.json",
  fallback: 'rest',
});

/**
 * 이미지 URL → presigned URL → axios → buffer → base64 → Vision API
 */
const performOCR = async (imageUrl) => {
  try {
    // 1) S3 key 추출
    const key = imageUrl.split("/").pop();

    // 2) presigned URL 생성
    const presignedUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: 60,
    });

    // 3) REST(fallback) 모드로 Vision API 호출
    const [result] = await client.textDetection({
      image: {
        source: { imageUri: presignedUrl }
      },
    });

    // 4) 결과 리턴
    const detections = result.textAnnotations;
    return detections?.[0]?.description || "";
  } catch (err) {
    console.error("❌ OCR 오류 발생:", err);
    throw err;
  }
};

module.exports = { performOCR };
