const fs = require('fs');
const axios = require('axios'); 

async function fetchTokenList() {
    let URL = "https://api.binance.com/api/v3/exchangeInfo";

    let response = await axios.get(URL); 


    let usdtSymbols = response.data.symbols.filter(
        symbol => {
            return symbol.quoteAsset === "USDT"
        }
    )

    let list = usdtSymbols.map(
        symbol => {
            return symbol.baseAsset
        }
    )

    var json = JSON.stringify(list);

    fs.writeFileSync('token-list.json', json);
}

fetchTokenList().then(
    () => {}
)

