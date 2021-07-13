const supportedTokens = require("./tokens-supported-by-kyber.json"); 

async function getTokenList() {

    let list = supportedTokens;

    return list;
}

exports.getTokenList = getTokenList;

