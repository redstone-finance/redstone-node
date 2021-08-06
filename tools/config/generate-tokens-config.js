const fs = require("fs");
const fetchers = require("../../src/config/sources.json");
const ccxtSupportedExchanges = require("../../src/fetchers/ccxt/all-supported-exchanges.json");
const predefinedTokensConfig = require("./predefined-configs/tokens.json");
const { getStandardLists } = require("./standard-lists");
const { getCcxtTokenList } = require("../../src/fetchers/ccxt/generate-list-for-all-ccxt-sources");

// Note: Before running this script you should generate sources.json config
// You can do this using tools/config/generate-sources-config.js script

// TODO: rename OUTPUT_FILE
const OUTPUT_FILE = "./src/config/tokens-2.json";
const tokensConfig = {};

main();

async function main() {
  await generateTokensConfig();
  saveTokensConfigToFile();
}

async function generateTokensConfig() {
  // Adding tokens with sources
  for (const fetcher of Object.keys(fetchers)) {
    try {
      if (!isCcxtFetcher(fetcher)) {
        await addAllTokensForSource(fetcher);
      }
    } catch (err) {
      console.log("Error when getting a token list for: " + fetcher);
      console.log(err);
    }
  }
  await addAllTokensForCcxtSources();

  // Adding token details
  const standardLists = await getStandardLists();
  for (const token of Object.keys(tokensConfig)) {
    console.log(`Loading details for token: ${token}`);
    tokensConfig[token] = getAllDetailsForSymbol(token, standardLists);
  }
}

// This function should handle
// - getting details (imgURL, url, chainId...)
// - getting providers
// - getting tags
function getAllDetailsForSymbol(symbol, standardLists) {
  const providers = getProvidersForSymbol(symbol);
  const tags = getTagsForSymbol(symbol);
  const details = getDetailsForSymbol(symbol, standardLists);

  return {
    ...details,
    tags,
    providers,
  };
}

// TODO: implement
function getDetailsForSymbol(symbol, standardLists) {
  return {
    name: "todo",
    logoURI: "https://todo.com",
  };
}

// TODO: implement
function getProvidersForSymbol(symbol) {
  return ["redstone"];
}

// TODO: implement
// This function can work based on manifests and predefined Config
// Returning "crypto" as a default tag
function getTagsForSymbol(symbol) {
  return ["todo"];
}

function isCcxtFetcher(fetcherName) {
  return ccxtSupportedExchanges.includes(fetcherName);
}

async function addAllTokensForCcxtSources() {
  const ccxtFetchersWithTokens = await getCcxtTokenList();
  for (const ccxtFetcher in ccxtFetchersWithTokens) {
    addTokensToConfig(
      ccxtFetchersWithTokens[ccxtFetcher],
      ccxtFetcher);
  }
}

async function addAllTokensForSource(source) {
  console.log("Fetching supported tokens for: " + source);
  const { getTokenList } = require(
    `../../src/fetchers/${source}/generate-list`);
  const tokens = await getTokenList();
  addTokensToConfig(tokens, source);
}

function addTokensToConfig(tokens, source) {
  for (const token of tokens) {
    addTokenToConfig(token, source);
  }
}

function addTokenToConfig(token, source) {
  if (token in tokensConfig) {
    if (Array.isArray(tokensConfig[token].source)) {
      tokensConfig[token].source.push(source);
    } else {
      tokensConfig[token].source = [source];
    }
  } else {
    tokensConfig[token] = { source: [source] };
  }
}

function saveTokensConfigToFile() {
  const json = JSON.stringify(tokensConfig, null, 2) + "\n";
  fs.writeFileSync(OUTPUT_FILE, json);
}
