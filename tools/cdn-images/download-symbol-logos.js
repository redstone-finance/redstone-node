const download = require("download");
const fs = require("fs");
const tokens = require("../../src/config/tokens.json");

const TARGET_FOLDER = "./symbol-logos";

// TODO: update this script, use cdn-utils

main();

async function main() {
  createTargetFolderIfNeeded();

  const promises = [];
  for (const symbol of Object.keys(tokens)) {
    const logoURI = tokens[symbol].logoURI;
    if (logoURI) {
      promises.push(downloadImage(logoURI, symbol));
    }
  }
  await Promise.all(promises);
  console.log("Downloading completed!");
}

async function downloadImage(logoURI, symbol) {
  try {
    console.log(`Downloading ${symbol} logo from: ${logoURI}`);
    const filePath = getFilePathForSymbol(logoURI, symbol);
    const fileContent = await download(logoURI);
    fs.writeFileSync(filePath, fileContent);
  } catch (e) {
    console.error(`Downloading failed for ${symbol}`, e);
  }
}

function getFilePathForSymbol(url, symbol) {
  const filename = cdnUtils.getFileName(symbol, url);
  return `${TARGET_FOLDER}/${filename}`;
}

function createTargetFolderIfNeeded() {
  if (!fs.existsSync(TARGET_FOLDER)){
    fs.mkdirSync(TARGET_FOLDER);
  }
}
