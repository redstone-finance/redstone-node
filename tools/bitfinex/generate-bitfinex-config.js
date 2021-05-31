const _ = require("lodash");
const allTokensConfig =
  require("../../sample-manifests/all-supported-tokens.json");
const bitfinexSupportedTokens =
  require("../../src/fetchers/bitfinex/bitfinex-supported-tokens.json");

const symbolsToSkip = [
  "AMP",
  "PAX",
  "GRT",
  "NPXS",
];

main();

function main() {
  const allTokens = _.keys(allTokensConfig.tokens);
  const symbols = _
    .intersection(allTokens, bitfinexSupportedTokens)
    .filter(s => !symbolsToSkip.includes(s));

  printConfig({
    symbols,
    source: "bitfinex",
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
