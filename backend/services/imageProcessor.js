const fs = require("fs");
const https = require("https");  // 🔁 axios 대신
const AWS = require("aws-sdk");
const vision = require("@google-cloud/vision");
const Jimp = require("jimp");
const gridPositions = require("../utils/gridPositions");

const KEY_PATH = "/tmp/service-account.json";
const SERVICE_ACCOUNT_URL =
  "https://raw.githubusercontent.com/yujin5701/Capstone-SGK/develop/backend/keys/dayfull-timetable-e933618fea72.json";

// axios 없이 https로 JSON 가져오기
function downloadJSON(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        try {
          const content = Buffer.concat(chunks).toString();
          fs.writeFileSync(destPath, content);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    }).on("error", reject);
  });
}

async function initializeVisionClient() {
  if (!fs.existsSync(KEY_PATH)) {
    await downloadJSON(SERVICE_ACCOUNT_URL, KEY_PATH);
  }

  const client = new vision.ImageAnnotatorClient({
    keyFilename: KEY_PATH,
    fallback: "rest",
  });

  return client;
}
module.exports = {
  processImageAndExtractText,
};