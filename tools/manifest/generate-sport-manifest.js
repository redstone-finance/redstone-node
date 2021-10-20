const fs = require("fs");
const { generateAssets } = require("../odds-api/utils");

const OUTPUT_FILE_PATH = "./manifests/sport.json";

main();

async function main() {
  const manifest = {
    "interval": 3600 * 1000, // 1 hour
    "priceAggregator": "median",
    "defaultSource": ["odds-api"],
    "sourceTimeout": 50000,
    "maxPriceDeviationPercent": 100,
    "evmChainId": 1,
    tokens: {},
  };

  const assets = await generateAssets();

  // Building tokens
  for (const [symbol, details] of Object.entries(assets)) {
    manifest.tokens[symbol] = { metadata: details };
  }

  console.log(`Saving manifest to: ${OUTPUT_FILE_PATH}`);
  fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(manifest, null, 2) + "\n");
}
