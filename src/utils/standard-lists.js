const axios = require("axios");

let standardListsURLs = [
    'https://tokens.coingecko.com/uniswap/all.json',
    'https://zapper.fi/api/token-list',
    'https://wispy-bird-88a7.uniswap.workers.dev/?url=http://tokenlist.aave.eth.link',
    'https://wispy-bird-88a7.uniswap.workers.dev/?url=http://tokens.1inch.eth.link',
    'https://wispy-bird-88a7.uniswap.workers.dev/?url=http://t2crtokens.eth.link',
    'https://uniswap.mycryptoapi.com/'
]

async function getList(url) {
    let response = await axios.get(url);
    return response.data.tokens;
}

async function getStandardList() {
    return await Promise.all(standardListsURLs.map(async url => { return await getList(url)}))
}

exports.getStandardList = getStandardList;
