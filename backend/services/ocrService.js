// backend/services/ocrService.js
const vision = require("@google-cloud/vision");

// 환경변수로부터 service account 자격 증명을 읽어 클라이언트 생성
const client = new vision.ImageAnnotatorClient({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    // Render 콘솔에 \n 을 리터럴로 넣었기 때문에 실제 개행으로 복원
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

/**
 * 이미지 버퍼에 대해 OCR 수행
 * @param {Buffer} imageBuffer - Jimp 등으로 읽은 이미지 버퍼
 * @returns {Promise<string>} - 인식된 텍스트 (없으면 빈 문자열)
 */
async function performOCR(imageBuffer) {
  const [result] = await client.textDetection({
    image: { content: imageBuffer.toString("base64") },
  });
  return result.textAnnotations?.[0]?.description?.trim() || "";
}

module.exports = { performOCR };
