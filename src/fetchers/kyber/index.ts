import axios from "axios";
import _ from "lodash";
import redstone from "redstone-api";
import { PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";

const ETH_PAIRS_URL = "https://api.kyber.network/api/tokens/pairs";

export class KyberFetcher extends BaseFetcher {
  lastEthPrice?: number;

  constructor() {
    super("kyber");
  }

  async prepareForFetching() {
    const price = await redstone.getPrice("ETH");
    this.lastEthPrice = price.value;
  }

  async fetchData() {
    return await axios.get(ETH_PAIRS_URL);
  }

  extractPrices(response: any, symbols: string[]): PricesObj {
    const pricesObj: PricesObj = {};

    const pairs = response.data;
    for (const symbol of symbols) {
      const pair = pairs["ETH_" + symbol];
      if (pair !== undefined) {
        pricesObj[symbol] = this.lastEthPrice! * pair.currentPrice;
      }
    }

    return pricesObj;
  }

}

export default new KyberFetcher();

// const kyberFetcher: Fetcher = {
//   async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
//     // Fetching pairs data from kyber api
//     const response = ;
//     const pairs = response.data;

//     // Building prices array
//     const ethPrice = await getETHPriceInUSD();

//     const prices: PriceDataFetched[] = [];
//     for (const symbol of tokenSymbols) {
//       const pair = pairs["ETH_" + symbol];

//       if (pair === undefined) {
//         logger.warn(
//           `Token is not supported with kyber source: ${symbol}`);
//       } else {
//         prices.push({
//           symbol,
//           value: ethPrice * pair.currentPrice,
//         });
//       }
//     }

//     return prices;
//   }
// };

// async function getETHPriceInUSD(): Promise<number> {
//   const price = await RedstoneApi.getPrice("ETH");
//   if (price === undefined) {
//     throw new Error("Cannot fetch ETH price from limestone api");
//   }
//   return price.value;
// }

// export default kyberFetcher;
