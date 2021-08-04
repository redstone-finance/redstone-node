const axios = require("axios");

const URL = "https://v2.cache.verto.exchange/tokens";

async function getTokenList() {
  const response = await axios.get(URL);

  return response.data.map(token => token.ticker);
}

exports.getTokenList = getTokenList;
