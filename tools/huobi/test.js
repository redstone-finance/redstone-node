const axios = require("axios");

main();

async function main() {
  // const response = await axios.get("https://api.huobi.pro/market/history/trade", {
  //   params: {
  //     symbol: "arusdt",
  //   }
  // });
  // console.log({latestTrade: response.data.data[0].data});

  const response = await axios.get("https://api.huobi.pro/market/detail", {
    params: {
      symbol: "ethusdt",
    }
  });
  console.log(response.data);


}
