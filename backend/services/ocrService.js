// backend/services/ocrService.js
const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    // Render 환경변수에 "\n" 이 두 글자로 들어가 있으므로
    // 이 replace 로 실제 개행(\n)으로 복원해 줍니다.
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  // ← 반드시 REST 모드로 강제
  fallback: "rest",
});

/**
 * 공개된 S3 이미지 URL을 받아 OCR 수행
 * @param {string} imageUrl
 * @returns {Promise<string>}
 */
async function performOCR(imageUrl) {
  const [result] = await client.textDetection({
    image: { source: { imageUri: encodeURI(imageUrl) } },
  });
  const detections = result.textAnnotations;
  return detections?.[0]?.description || "";
}

module.exports = { performOCR };
