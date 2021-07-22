const axios = require("axios"); 

async function getTokenList() {
    let URL = "https://v2.cache.verto.exchange/tokens";

    let response = await axios.get(URL); 

    let list = response.data.map(
        token => {
            return token.ticker
        }
    );

    console.log(list)
    return list;
}

exports.getTokenList = getTokenList;
