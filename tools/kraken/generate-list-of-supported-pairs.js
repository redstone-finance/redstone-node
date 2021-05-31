const axios = require("axios");

const url = "https://api.kraken.com/0/public/AssetPairs";

main();

async function main() {
  const response = await axios.get(url);
  console.log(
    JSON.stringify(Object.keys(response.data.result), null, 2));
}
