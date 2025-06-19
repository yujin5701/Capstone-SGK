// backend/services/imageProcessor.js
const fs = require("fs");
const AWS = require("aws-sdk");
const axios = require("axios");
const vision = require("@google-cloud/vision");
const Jimp = require("jimp");
const gridPositions = require("../utils/gridPositions");

const KEY_PATH = "/tmp/service-account.json";
const SERVICE_ACCOUNT_URL =
  "https://raw.githubusercontent.com/yujin5701/Capstone-SGK/develop/backend/keys/dayfull-timetable-e933618fea72.json"; // ✅ 반드시 raw URL

async function initializeVisionClient() {
  if (!fs.existsSync(KEY_PATH)) {
    const { data } = await axios.get(SERVICE_ACCOUNT_URL);
    fs.writeFileSync(KEY_PATH, JSON.stringify(data));
  }

  const client = new vision.ImageAnnotatorClient({
    keyFilename: KEY_PATH,
    fallback: "rest",
  });

  return client;
}

const processImageAndExtractText = async (key) => {
  const s3 = new AWS.S3({ region: process.env.AWS_REGION });
  let imageBuffer;
  try {
    const { Body } = await s3.getObject({ Bucket: process.env.AWS_S3_BUCKET, Key: key }).promise();
    imageBuffer = Body;
  } catch (err) {
    console.error("❌ S3 getObject failed:", err);
    return [];
  }

  let image;
  try {
    image = await Jimp.read(imageBuffer);
  } catch (err) {
    console.error("❌ Jimp.read failed:", err);
    return [];
  }

  const client = await initializeVisionClient();
  const detectedBlocks = [];

  for (const { day, period, x1, y1, x2, y2 } of gridPositions) {
    const w = x2 - x1;
    const h = y2 - y1;

    try {
      const blockImg = image.clone().crop(x1, y1, w, h);
      const buffer = await blockImg.getBufferAsync(Jimp.MIME_JPEG);
      const content = buffer.toString("base64");

      const [result] = await client.documentTextDetection({
        image: { content },
      });

      const fullText = result.fullTextAnnotation?.text?.trim() || "";
      if (fullText) {
        detectedBlocks.push({
          day,
          period,
          lectureNameCandidate: fullText.replace(/\r?\n/g, " "),
        });
        console.log(`✅ OCR [${day}-${period}]:`, fullText.split("\n")[0]);
      }
    } catch (err) {
      console.error(`❌ OCR error at block ${day}-${period}:`, err.message);
    }
  }

  return detectedBlocks;
};

module.exports = { processImageAndExtractText };
