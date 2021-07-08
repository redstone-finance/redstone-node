const symbolToPairList = require('./sushiswap-symbol-to-pair-id.json'); 


async function getTokenList() {
    // let URL = "https://api2.sushipro.io/?action=all_pairs";

    let list = Object.keys(symbolToPairList)

    return list;
}

exports.getTokenList = getTokenList;

