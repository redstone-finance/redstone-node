const fs = require("fs");
const _ = require("lodash");

const manifestsToExclude = [
  "5-top-tokens.json",
  "all-supported-tokens.json",
  "10-top-tokens-frequent-updates.json",
  "stocks.json"
];

main();

function main() {
  const manifests = readManifests();

  // Building tokens
  const tokens = {};
  for (const sourceManifest of manifests) {
    const sourceId = sourceManifest.defaultSource[0];

    for (const tokenName in sourceManifest.tokens) {
      if (tokens[tokenName] !== undefined) {
        tokens[tokenName].source.push(sourceId);
      } else {
        tokens[tokenName] = {
          source: [sourceId],
        };
      }
    }
  }

  // Sort tokens by number of sources
  const tokensWithSortedKeys = {};
  const sortedKeys = _.keys(tokens).sort((token1, token2) => {
    return tokens[token2].source.length - tokens[token1].source.length;
  });
  for (const symbol of sortedKeys) {
    tokensWithSortedKeys[symbol] = tokens[symbol];
  }

  const manifest = {
    interval: 60000,
    priceAggregator: "median",
    tokens: tokensWithSortedKeys,
  };

  console.log(JSON.stringify(manifest, null, 2));
}

function readManifests() {
  const manifestsDir = "./sample-manifests/";
  const configs = [];
  const files = fs.readdirSync(manifestsDir);
  for (const fileName of files) {
    if (!manifestsToExclude.includes(fileName)) {
      const fileData = fs.readFileSync(manifestsDir + fileName, "utf8");
      configs.push(JSON.parse(fileData));
    }
  }
  return configs;
}
