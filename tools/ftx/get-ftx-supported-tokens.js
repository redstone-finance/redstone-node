const axios = require("axios");

const URL = "https://ftx.com/api/markets";

main();

async function main() {
  const response = await axios.get(URL);
  const supportedTokens = [];
  for (const market of response.data.result) {
    const name = market.name;
    if (name.endsWith("USD")) {
      supportedTokens.push(name.slice(0, -4));
    }
  }

  console.log(JSON.stringify(supportedTokens, null, 2));
}
