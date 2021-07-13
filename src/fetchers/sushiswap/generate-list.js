const symbolToPairList = require("./sushiswap-symbol-to-pair-id.json"); 


async function getTokenList() {

    let list = Object.keys(symbolToPairList);

    return list;
}

exports.getTokenList = getTokenList;

