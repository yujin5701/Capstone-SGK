const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient({
  keyFilename: "/app/keys/dayfull-timetable-e933618fea72.json",
  // fallback: 'rest' 없이 gRPC 방식 그대로 사용 (또는 fallback: 'rest'도 가능)
});

const performOCR = async (imageUrl) => {
  try {
    const [result] = await client.textDetection({
      image: {
        source: {
          imageUri: encodeURI(imageUrl),  // ✅ 이미지 URL 직접 사용
        },
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
