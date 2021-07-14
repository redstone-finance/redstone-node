const supportedTokens = require("./fts-supported-tokens.json"); 


async function getTokenList() {
    let list = supportedTokens;

    return list;
}

exports.getTokenList = getTokenList;
