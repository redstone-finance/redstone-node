const symbolToPairList = require("./uniswap-symbol-to-pair-id.json");

async function getTokenList() {
  const list = Object.keys(symbolToPairList);
  return list;
}

exports.getTokenList = getTokenList;
