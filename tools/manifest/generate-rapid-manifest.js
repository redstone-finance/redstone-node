const fs = require("fs");
const manifestForMainProvider = require("../../manifests/main.json");

const OUTPUT_FILE_PATH = "./manifests/rapid.json";
const SYMBOLS = [
  "BTC",
  "ETH",
  "USDT",
  "BNB",
  "DOGE",
  "XRP",
  "ADA",
  "DOT",
  "XLM",
  "AR",
];

main();

function main() {
  const manifest = {
    "interval": 10000,
    "priceAggregator": "median",
    "defaultSource": ["coingecko"],
    "sourceTimeout": 7000,
    "maxPriceDeviationPercent": 25,
    "evmChainId": 1,
    tokens: {},
  };

  // Building tokens
  for (const symbol of SYMBOLS) {
    manifest.tokens[symbol] = manifestForMainProvider.tokens[symbol];
  }

  console.log(`Saving manifest to: ${OUTPUT_FILE_PATH}`);
  fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(manifest, null, 2) + "\n");
}
