const supportedCurrencies = require("./huobi-all-supported-currencies.json"); 

async function getTokenList() {

    let list = supportedCurrencies.map(currency => currency.toUpperCase());

    return list;
}

exports.getTokenList = getTokenList;
