const supportedTokens = require('./coingecko-symbol-to-id.json'); 


async function getTokenList() {
    let list = Object.keys(supportedTokens);

    return list;
}

exports.getTokenList = getTokenList;

