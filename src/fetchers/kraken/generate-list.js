const fs = require('fs');
const axios = require('axios'); 

async function fetchTokenList() {
    let URL = "https://api.kraken.com/0/public/AssetPairs";

    let response = await axios.get(URL); 

    let zusdSymbols = Object.values(response.data.result).filter(
        symbol => {
            return symbol.quote === "ZUSD"
        }
    ).map(
        symbol => {
            return symbol.base
        }
    )

    return zusdSymbols;

    // fs.writeFileSync('token-list.json', json);
}

exports.fetchTokenList = fetchTokenList;


