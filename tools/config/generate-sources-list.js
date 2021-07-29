const ccxt = require("ccxt");
const fs = require("fs");
const predefinedSourcesConfig = require("./predefined-sources-config.json");
const fetchers = require("../../dist/src/fetchers/index");

// NOTE! Before running this script you should build redstone-node source code
// to dist folder (use `yarn build`)

const OUTPUT_FILE = "./src/config/sources-list.json";

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
  if (predefinedSourcesConfig[sourceName]) {
    return predefinedSourcesConfig[sourceName];
  } else {
    return getSourceDetailsWithCcxt(sourceName);
  }
}

function getSourceDetailsWithCcxt(sourceName) {
  const exchange = new ccxt[sourceName]();

  return {
    imgURI: exchange.urls.logo,
    url: exchange.urls.www,
  };
}
