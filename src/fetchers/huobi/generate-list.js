const supportedCurrencies = require('./huobi-all-supported-currencies.json'); 

async function getTokenList() {
    // let URL = "https://api.huobi.pro/v1/common/symbols";

    let list = supportedCurrencies.map(currency => currency.toUpperCase())

    return list;
}

exports.getTokenList = getTokenList;
