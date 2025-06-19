const vision = require("@google-cloud/vision");
const axios = require("axios");

const client = new vision.ImageAnnotatorClient({
  keyFilename: "/app/keys/dayfull-timetable-e933618fea72.json",
});

const performOCR = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(response.data, "binary");

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
