const fs = require("fs");
const _ = require("lodash");
const CoinGecko = require("coingecko-api");
const fetchers = require("../../src/config/sources.json");
const ccxtSupportedExchanges = require("../../src/fetchers/ccxt/all-supported-exchanges.json");
const predefinedTokensConfig = require("./predefined-configs/tokens.json");
const { getStandardLists } = require("./standard-lists");
const { getCcxtTokenList } = require("../../src/fetchers/ccxt/generate-list-for-all-ccxt-sources");
const coingeckoSymbolToId = require("../../src/fetchers/coingecko/coingecko-symbol-to-id.json");
const { default: axios } = require("axios");
const providerToManifest = {
  "redstone-rapid": require("../../manifests/rapid.json"),
  "redstone-stocks": require("../../manifests/stocks.json"),
  "redstone": require("../../manifests/all-supported-tokens.json"),
};

// Note: Before running this script you should generate sources.json config
// You can do this using tools/config/generate-sources-config.js script

const OUTPUT_FILE = "./src/config/tokens-2.json"; // TODO: update output filename
const IMG_URL_FOR_EMPTY_LOGO = "https://cdn.redstone.finance/symbols/logo-not-found.png";
const URL_PREFIX_FOR_EMPTY_URL = "https://www.google.com/search?q=";
const TRY_TO_LOAD_FROM_COINGECKO_API = true;
const MAX_COINGECKO_FAILS_PER_SYMBOL = 10;

const tokensConfig = {};
const coingeckoClient = new CoinGecko();

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
  let counter = 0;
  const tokens = Object.keys(tokensConfig);
  const total = tokens.length;
  for (const token of tokens) {
    counter++;
    console.log(`Loading details for token: ${token} (${counter}/${total})`);
    tokensConfig[token] = await getAllDetailsForSymbol(token, standardLists);
  }
}

// This function should handle
// - getting details (imgURL, url, chainId...)
// - getting providers
// - getting tags
async function getAllDetailsForSymbol(symbol, standardLists) {
  const providers = getProvidersForSymbol(symbol);
  const tags = getTagsForSymbol(symbol);
  const details = getDetailsForSymbol(symbol, standardLists);

  if (TRY_TO_LOAD_FROM_COINGECKO_API && !details.logoURI || !details.url) {
    const coingeckoDetails = await getDetailsFromCoingecko(symbol);
    if (coingeckoDetails) {
      // TODO: remove console.log
      console.log(_.pick(coingeckoDetails, ["image", "links", "name"]));
      if (coingeckoDetails.image && !details.logoURI) {
        details.logoURI = coingeckoDetails.image.large;
      }
      if (coingeckoDetails.links && !details.url) {
        details.url = coingeckoDetails.links.homepage[0];
      }
      if (coingeckoDetails.name) {
        details.name = coingeckoDetails.name;
      }
    }
  }

  if (!details.logoURI) {
    details.logoURI = IMG_URL_FOR_EMPTY_LOGO;
  }
  if (!details.name) {
    details.name = symbol;
  }
  if (!details.url) {
    details.url = URL_PREFIX_FOR_EMPTY_URL + symbol;
  }

  return {
    ...details,
    tags,
    providers,
  };
}

function getDetailsForSymbol(symbol, standardLists) {
  // Checking if predefined config contains details for the symbol
  const details = predefinedTokensConfig[symbol];
  if (details) {
    return details;
  }

  // Searching for token details in popular standard token lists
  for (const standardList of standardLists) {
    const symbolDetails = standardList.find(el => el.symbol === symbol);
    if (symbolDetails) {
      return symbolDetails;
    }
  }

  // Returning empty details
  return {};
}


function getProvidersForSymbol(symbol) {
  return Object.keys(providerToManifest)
    .filter(p => symbol in providerToManifest[p].tokens);
}

// This function can work based on manifests and predefined config
// Returning "crypto" as a default tag
function getTagsForSymbol(symbol) {
  let tags = [];
  if (predefinedTokensConfig[symbol] && predefinedTokensConfig[symbol].tags) {
    tags = predefinedTokensConfig[symbol].tags;
  }

  if (tags.length === 0 && !providerToManifest["redstone-stocks"][symbol]) {
    tags.push("crypto");
  }

  return tags;
}

function isCcxtFetcher(fetcherName) {
  return ccxtSupportedExchanges.includes(fetcherName);
}

async function addAllTokensForCcxtSources() {
  console.log("Fetching tokens for all ccxt feetchers");
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

async function getDetailsFromCoingecko(symbol, failsCount = 0) {
  const coinId = coingeckoSymbolToId[symbol];
  if (!coinId) {
    return null;
  } else {
    if (failsCount > MAX_COINGECKO_FAILS_PER_SYMBOL - 2) {
      await sleep(30000); // We sleep more time if many fails occured
    }
    await sleep(300); // We sleep for 300 ms to avoid bans from Coingecko
    console.log({coinId}); // TODO: remove
    try {
      const response = await coingeckoClient.coins.fetch(coinId, {
        developer_data: false,
        community_data: false,
        localization: false,
        tickers: false,
        market_data: false,
        sparkline: false,
      });
      // const response = await axios.get("https://api.coingecko.com/api/v3/coins/" + coinId);

      return response.data;
    } catch (e) {
      if (failsCount < MAX_COINGECKO_FAILS_PER_SYMBOL) {
        console.error(`Coingecko request failed for ${symbol} (id: ${coinId}). Fails count: ${failsCount}. Retrying...`, e);
        return await getDetailsFromCoingecko(symbol, failsCount + 1);
      } else {
        console.error(`Coingecko request failed for ${symbol} (id: ${coinId}). Fails count: ${failsCount}. Skipping symbol...`, e);
        return null;
      }
    }
  }
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
