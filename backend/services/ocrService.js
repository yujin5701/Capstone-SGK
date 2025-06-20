// backend/services/ocrService.js

const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  fallback: "rest",  // REST 모드 강제
});

/**
 * 이미지 버퍼를 받아 OCR 수행
 * @param {Buffer} imageBuffer
 * @returns {Promise<string>}
 */
async function performOCR(imageBuffer) {
  const [result] = await client.textDetection({
    image: { content: imageBuffer.toString("base64") },
  });
  return result.textAnnotations?.[0]?.description?.trim() || "";
}

module.exports = { performOCR };
