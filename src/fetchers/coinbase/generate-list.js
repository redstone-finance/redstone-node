const axios = require('axios'); 

async function fetchTokenList() {
    let URL = "https://api.coinbase.com/v2/exchange-rates?currency=USD";

    let response = await axios.get(URL); 

    let tokens = Object.keys(response.data.data.rates)

    return tokens;

    // fs.writeFileSync('token-list.json', json);
}

exports.fetchTokenList = fetchTokenList;


