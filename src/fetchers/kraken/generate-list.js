const supportedPairs = require('./kraken-supported-pairs.json'); 

async function getTokenList() {
    // let URL = "https://api.kraken.com/0/public/AssetPairs";

    let list = Object.keys(supportedPairs).filter(
        pair => {
            return pair.endsWith("USD")
        }
    ).map(
        pair => {
            return pair.replace("USD", "")
        }
    )

    return list;
}

exports.getTokenList = getTokenList;


