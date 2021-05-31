const axios = require("axios");
const Coingecko = require("coingecko-api");
const { tokens } = require("../../sample-manifests/all-supported-tokens.json");

const DEFAULT_TOKEN_LOGO_URI = "";
const DEFAULT_TOKEN_URL = "";

main();

async function main() {
  const allSupportedSymbols = Object.keys(tokens);
  const coingeckoConfig = await getTokenConfigFromCoinGecko();
  const hardcodedConfig = getHarcodedConfig();

  const allTokens = {};
  for (const token of coingeckoConfig.tokens) {
    allTokens[token.symbol] = token;
  }

  let result = {};
  for (const symbol of allSupportedSymbols) {
    if (hardcodedConfig[symbol]) {
      result[symbol] = hardcodedConfig[symbol];
    } else {
      const token = allTokens[symbol];
      if (token !== undefined) {
        result[symbol] = {
          name: token.name || symbol,
          logoURI: token.logoURI || DEFAULT_TOKEN_LOGO_URI,
          url: token.url || DEFAULT_TOKEN_URL,
        };
      } else {
        result[symbol] = {
          name: symbol,
          logoURI: DEFAULT_TOKEN_LOGO_URI,
          url: DEFAULT_TOKEN_URL,
        };
      }
    }
  }

  console.log(JSON.stringify(sortSymbols(result), null, 2));
}

async function getTokenConfigFromCoinGecko() {
  const url = "https://tokens.coingecko.com/uniswap/all.json";
  const response = await axios.get(url);
  return response.data;
}

function sortSymbols(tokensConfig) {
  const minIndices = {
    "AR": 1,
    "ETH": 2,
    "BTC": 3,
    "COMP": 4,
    "MKR": 5,
  };

  function getMinIndexForSymbol(symbol) {
    return minIndices[symbol] || 10;
  }

  function compareSymbols(symbol1, symbol2) {
    return getMinIndexForSymbol(symbol1) - getMinIndexForSymbol(symbol2);
  }

  const sortedKeys = Object.keys(tokensConfig).sort(compareSymbols);

  const result = {};
  for (const symbol of sortedKeys) {
    result[symbol] = tokensConfig[symbol];
  }

  return result;
}

function getHarcodedConfig() {
  const config = {
    "BTC": {
      name: "Bitcoin",
      logoURI: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
      url: "https://bitcoin.org/",
    },
    "ETH": {
      name: "Ethereum",
      logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
      url: "https://ethereum.org/",
    },
    "AR": {
      name: "Arweave",
      logoURI: "https://assets.coingecko.com/coins/images/4343/small/oRt6SiEN_400x400.jpg",
      url: "https://www.arweave.org/",
    },
    "BNB": {
      name: "Binance Coin",
      logoURI: "https://assets.coingecko.com/coins/images/825/small/binance-coin-logo.png",
      url: "https://www.binance.com/",
    },
  };

  return config;
}
