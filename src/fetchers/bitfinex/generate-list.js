const axios = require('axios'); 

async function getTokenList() {
    let URL = "https://api-pub.bitfinex.com/v2/conf/pub:list:pair:exchange";

    let response = await axios.get(URL); 


    let pairs = response.data[0].filter(
        pair => {
            return pair.startsWith('t') && pair.endsWith('USD')
        }
    )

    let list = pairs.map(
        pair => {
            return pair.replace(':USD','USD', '');
        }
    )

    return list;
}

exports.getTokenList = getTokenList;

