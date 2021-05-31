const CoinGecko = require("coingecko-api");
const _ = require("lodash");

const coinGeckoClient = new CoinGecko();

main();

async function main() {
  const coins = (await coinGeckoClient.coins.list()).data;

  const coinIdToDetails = {};

  for (const coin of coins) {
    const details = _.pick(coin, ["name", "symbol"]);
    coinIdToDetails[coin.id] = details;
  }

  console.log(JSON.stringify(coinIdToDetails, null, 2));
}
