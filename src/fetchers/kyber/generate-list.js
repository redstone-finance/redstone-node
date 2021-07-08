const supportedTokens = require('./tokens-supported-by-kyber.json'); 

async function getTokenList() {
    // let URL = "https://api.kyber.network/api/tokens/pairs";

    let list = supportedTokens;

    return list;
}

exports.getTokenList = getTokenList;

