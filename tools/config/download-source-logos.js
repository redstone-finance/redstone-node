const download = require("download");
const fs = require("fs");
const sources = require("./predefined-configs/sources.json");

const TARGET_FOLDER = "./source-logos";

main();

async function main() {
  createTargetFolderIfNeeded();

  const promises = [];
  for (const source of Object.keys(sources)) {
    const imgURI = sources[source].imgURI;
    promises.push(downloadImage(imgURI, source));
  }
  await Promise.all(promises);
  console.log("Downloading completed!");
}

async function downloadImage(imgURI, sourceName) {
  console.log(`Downloading ${sourceName} logo from: ${imgURI}`);
  const filePath = getFilePathForSource(imgURI, sourceName);
  const fileContent = await download(imgURI);
  fs.writeFileSync(filePath, fileContent);
}

function getFilePathForSource(url, sourceName) {
  let extension = "png";
  if (url.endsWith("svg")) {
    extension = "svg";
  } else if (url.endsWith("jpeg")) {
    extension = "jpeg";
  } else if (url.endsWith("jpg")) {
    extension = "jpg";
  }
  return `${TARGET_FOLDER}/${sourceName}.${extension}`;
}

function createTargetFolderIfNeeded() {
  if (!fs.existsSync(TARGET_FOLDER)){
    fs.mkdirSync(TARGET_FOLDER);
  }
}
