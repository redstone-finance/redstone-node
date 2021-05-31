const _ = require("lodash");

const pairsSupportedByKraken =
  require("../../src/fetchers/kraken/kraken-supported-pairs.json");
const allSupportedConfig =
  require("../../sample-manifests/all-supported-tokens.json");

main();

function main() {
  const krakenSymbols = getSymbolsSupportedByKraken();
  const supportedSymbols = getAllSupportedSymbols();
  const intersection = _.intersection(krakenSymbols, supportedSymbols);
  printConfig({
    symbols: intersection,
    source: "kraken",
  });
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

function getAllSupportedSymbols() {
  return _.keys(allSupportedConfig.tokens);
}

function getSymbolsSupportedByKraken() {
  const result = [];
  for (const pair of pairsSupportedByKraken) {
    if (pair.endsWith("USD")) {
      const symbol = pair.slice(0, -3);
      result.push(symbol);
    }
  }
  return result;
}

function findIntersection(arr1, arr2) {
  return ;
}
