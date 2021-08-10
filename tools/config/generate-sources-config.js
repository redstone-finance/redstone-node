const ccxt = require("ccxt");
const fs = require("fs");
const predefinedSourcesConfig = require("./predefined-configs/sources.json");
const fetchers = require("../../dist/src/fetchers/index");

// NOTE! Before running this script you should build redstone-node source code
// to dist folder (use `yarn build`)

const OUTPUT_FILE = "./src/config/sources.json";
const USE_REDSTONE_CDN_IMAGES = true;
const REDSTONE_CDN_URL_PREFIX = "https://cdn.redstone.finance/sources";

main();

async function main() {
  const config = getSourcesConfig();

  const path = OUTPUT_FILE;
  console.log(`Saving sources list to: ${path}`);
  fs.writeFileSync(path, JSON.stringify(config, null, 2) + "\n");
}

function getSourcesConfig() {
  const sourcesConfig = {};
  const fetcherNames = Object.keys(fetchers.default);

  for (const fetcherName of fetcherNames) {
    sourcesConfig[fetcherName] = getSourceDetails(fetcherName);
  }

  return sourcesConfig;
}

function getSourceDetails(sourceName) {
  let details = {};
  if (predefinedSourcesConfig[sourceName]) {
    details = predefinedSourcesConfig[sourceName];
  } else {
    details = getSourceDetailsWithCcxt(sourceName);
  }

  if (USE_REDSTONE_CDN_IMAGES) {
    details.imgURI = getRedstoneCdnUrlForSource(details.imgURI, sourceName);
  }

  return details;
}

function getRedstoneCdnUrlForSource(url, sourceName) {
  let extension = "png";
  if (url.endsWith("svg")) {
    extension = "svg";
  } else if (url.endsWith("jpeg")) {
    extension = "jpeg";
  } else if (url.endsWith("jpg")) {
    extension = "jpg";
  }
  return `${REDSTONE_CDN_URL_PREFIX}/${sourceName}.${extension}`;
}

function getSourceDetailsWithCcxt(sourceName) {
  const exchange = new ccxt[sourceName]();

  return {
    imgURI: exchange.urls.logo,
    url: exchange.urls.www,
  };
}
