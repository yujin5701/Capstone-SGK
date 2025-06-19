const axios = require("axios");
const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient({
  keyFilename: "/app/keys/dayfull-timetable-e933618fea72.json",
});

const performOCR = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: {
        // 👇 명시적으로 압축 사용 안 함 (gzip 문제 방지)
        "Accept-Encoding": "identity"
      }
    });

    const imageBuffer = Buffer.from(response.data); // binary → buffer
    const [result] = await client.textDetection({
      image: {
        content: imageBuffer.toString("base64"), // buffer to base64
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
