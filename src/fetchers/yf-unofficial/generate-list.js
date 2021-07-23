const axios = require("axios");

const URL = "https://api.kyber.network/api/tokens/pairs";

async function getTokenList() {
  const response = await axios.get(URL);
  return Object.values(response.data).map(pair => pair.symbol);
}

exports.getTokenList = getTokenList;
