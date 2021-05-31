const axios = require("axios");
const _ = require("lodash");

const allSupportedConfig =
  require("../../sample-manifests/all-supported-tokens.json");

const symbolsToSkip = ["LEND", "HOT", "PAX", "NPXS"];

main();

async function main() {
  const binanceSymbols = await getSupportedByBinance();
  const allSymbols = _.keys(allSupportedConfig.tokens);
  const intersection = _.intersection(binanceSymbols, allSymbols);

  printConfig({
    symbols: intersection,
    source: "binance",
  });
}

async function getSupportedByBinance() {
  const response = await axios.get("https://api.binance.com/api/v3/ticker/price");

  const symbols = [];
  for (const pair of response.data) {
    if (pair.symbol.endsWith("USDT")) {
      const symbol = pair.symbol.slice(0, -4);
      if (!symbolsToSkip.includes(symbol)) {
        symbols.push(symbol);
      }
    }
  }

  return symbols;
}

function printConfig({
  symbols,
  source,
}) {
  const tokens = {};
  for (const symbol of symbols) {
    tokens[symbol] = {};
  }

  const config = {
    "interval": 60000,
    "priceAggregator": "median",
    "defaultSource": [source],
    "tokens": tokens,
  };

  console.log(JSON.stringify(config, null, 2));
}
