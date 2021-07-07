const fs = require('fs');
const axios = require('axios'); 

async function fetchTokenList() {
    let URL = "https://api-pub.bitfinex.com/v2/conf/pub:list:pair:exchange";

    let response = await axios.get(URL); 


    let pairs = response.data[0].filter(
        pair => {
            return pair.includes('USD') || pair.includes('USDT')
        }
    )

    let list = pairs.map(
        pair => {
            return pair.replace(':USD', ':UST', 'USD', 'UST', '');
        }
    )

    return list;

    // fs.writeFileSync('token-list.json', json);
}

exports.fetchTokenList = fetchTokenList;

