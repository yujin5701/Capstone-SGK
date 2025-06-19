const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient({ fallback: 'rest' }); // ← 핵심

async function performOCR(imageUrl) {
  try {
    const [result] = await client.documentTextDetection({
      image: {
        source: { imageUri: imageUrl }, // ✅ S3 URL 그대로 넘기기
      },
    });

    const detections = result.fullTextAnnotation?.text || '';
    return detections;
  } catch (err) {
    console.error("❌ OCR 처리 중 오류:", err);
    throw err;
  }
}

module.exports = { performOCR };

