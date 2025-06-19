const AWS = require("aws-sdk");
const vision = require("@google-cloud/vision");
const axios = require("axios");

const s3 = new AWS.S3(); // 이미 AWS config는 env로 설정되어 있어야 함

const client = new vision.ImageAnnotatorClient({
  keyFilename: "/app/keys/dayfull-timetable-e933618fea72.json",
});

/**
 * 이미지 URL → presigned URL → axios → buffer → base64 → Vision API
 */
const performOCR = async (imageUrl) => {
  try {
    // 🔍 1. S3 key 추출 (파일명)
    const key = imageUrl.split("/").pop(); // 또는 req.file.key가 있다면 그걸 직접 써도 됨

    // 🛡️ 2. presigned URL 생성
    const presignedUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: 60, // 1분 동안 유효
    });

    // 📥 3. axios로 이미지 다운로드
    const response = await axios.get(presignedUrl, {
      responseType: "arraybuffer",
      headers: {
        "Accept-Encoding": "identity", // gzip 등 방지
      },
    });

    // 🔁 4. Vision API에 base64 버퍼 전달
    const imageBuffer = Buffer.from(response.data);
    const [result] = await client.textDetection({
      image: {
        content: imageBuffer.toString("base64"),
      },
    });

    const detections = result.textAnnotations;
    return detections?.[0]?.description || "";
  } catch (err) {
    console.error("❌ OCR 오류 발생:", err);
    throw err;
  }
};

module.exports = { performOCR };
