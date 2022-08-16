const popularTokens = require("./popular-tokens.json");

const DEFAULT_MAX_DEVIATION = 25;
const MAX_DEVIATION_FOR_POPULAR_TOKENS = 25;
const MAX_DEVIATION_FOR_UNPOPULAR_TOKENS = 80;

function getTokensConfig(tokens) {
  const result = {};
  for (const symbol in tokens) {
    const maxPriceDeviationPercent = getDeviationForToken(symbol);
    result[symbol] = {
      ...tokens[symbol],
      maxPriceDeviationPercent,
    };
  }
  return result;
}

function getDeviationForToken(symbol) {
  if (popularTokens.includes(symbol)) {
    return MAX_DEVIATION_FOR_POPULAR_TOKENS;
  } else {
    return MAX_DEVIATION_FOR_UNPOPULAR_TOKENS;
  }
}

function generateManifest({
  tokens,
  interval = 60000,
  sourceTimeout = 20000,
  maxPriceDeviationPercent = DEFAULT_MAX_DEVIATION,
}) {
  return {
    interval,
    priceAggregator: "median",
    sourceTimeout,
    maxPriceDeviationPercent,
    evmChainId: 1,
    httpBroadcasterURLs: [
      "https://api.redstone.finance",
      "https://vwx3eni8c7.eu-west-1.awsapprunner.com",
      "https://container-service-1.dv9sai71f4rsq.eu-central-1.cs.amazonlightsail.com",
    ],
    enableStreamrBroadcaster: false,
    disableSinglePricesBroadcastingInStreamr: true,
    enableArweaveBackup: false,
    tokens: getTokensConfig(tokens),
  };
}

module.exports = { generateManifest };
