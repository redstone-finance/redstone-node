const symbolToPairList = require("./uniswap-symbol-to-pair-id.json");

async function getTokenList() {

    let list = Object.keys(symbolToPairList);

    return list;
}

exports.getTokenList = getTokenList;
