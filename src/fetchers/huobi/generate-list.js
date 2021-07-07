const fs = require('fs');
const axios = require('axios'); 

async function fetchTokenList() {
    let URL = "https://api.huobi.pro/v1/common/symbols";

    let response = await axios.get(URL); 

    let usdtSymbols = response.data.data.filter(
        symbol => {
            return symbol["quote-currency"] === "usdt"
        }
    )

    let list = usdtSymbols.map(
        symbol => {
            return symbol["base-currency"].toUpperCase();
        }
    )

    return list;

    // var json = JSON.stringify(list); 

    // fs.writeFileSync('token-list.json', json);
}

exports.fetchTokenList = fetchTokenList;

