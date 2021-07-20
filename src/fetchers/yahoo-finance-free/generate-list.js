const axios = require("axios"); 

async function getTokenList() {
    let URL = "https://api.kyber.network/api/tokens/pairs";

    let response = await axios.get(URL); 

    let list = Object.values(response.data).map(
        pair => {
            return pair.symbol;
        }
    );

    return list;
}

exports.getTokenList = getTokenList;
