import graphProxy from "../utils/graph-proxy";
import { PriceDataFetched, Fetcher, PricesObj } from "../types";
import { BaseFetcher } from "./BaseFetcher";

interface SymbolToPairId {
  [symbol: string]: string;
};

export class AnySwapFetcher extends BaseFetcher {
  subgraphUrl: string;
  symbolToPairIdObj: SymbolToPairId;
  retryForInvalidResponse: boolean = true;

  constructor(
    name: string,
    subgraphUrl: string,
    symbolToPairIdObj: SymbolToPairId) {
      super(name);
      this.subgraphUrl = subgraphUrl;
      this.symbolToPairIdObj = symbolToPairIdObj;
    }

  async fetchData(symbols: string[]) {
    const ids = this.convertSymbolsToPairIds(
      symbols,
      this.symbolToPairIdObj);

    const query = `{
      pairs(where: { id_in: ${JSON.stringify(ids)} }) {
        token0 {
          symbol
        }
        reserve0
        reserveUSD
      }
    }`;

    return await graphProxy.executeQuery(
      this.subgraphUrl,
      query);
  }

  validateResponse(response: any): boolean {
    return response !== undefined && response.data !== undefined;
  }

  extractPrices(response: any): PricesObj {
    const pricesObj: { [symbol: string]: number } = {};

    for (const pair of response.data.pairs) {
      const value =
        parseFloat(pair.reserveUSD) / (2 * parseFloat(pair.reserve0));
      pricesObj[pair.token0.symbol] = value;
    }

    return pricesObj;
  }

  private convertSymbolsToPairIds(
    symbols: string[],
    symbolToPairId: SymbolToPairId): string[] {
      const pairIds = [];

      for (const symbol of symbols) {
        const pairId = symbolToPairId[symbol];
        if (pairId === undefined) {
          this.logger.warn(
            `Source "${this.name}" does not support symbol: "${symbol}"`);
        } else {
          pairIds.push(pairId);
        }
      }

      return pairIds;
    }
};

// const asd = {
//   generateFetcher(config: AnySwapFetcherConfig): Fetcher {
//     const fetcher = {
//       async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
//         const tokenIds = convertSymbolsToPairIds(
//           tokenSymbols,
//           config.symbolToPairIdObj,
//           config.sourceName);

//         const query = `{
//           pairs(where: { id_in: ${JSON.stringify(tokenIds)} }) {
//             token0 {
//               symbol
//             }
//             reserve0
//             reserveUSD
//           }
//         }`;

//         // Fetching pairs data from uniswap subgraph
//         const fetchStartTime = Date.now();
//         let response = await graphProxy.executeQuery(
//           config.subgraphUrl,
//           query);
//         const timeElapsed = Date.now() - fetchStartTime;

//         // Retrying to fetch if needed
//         if (response.data === undefined && timeElapsed <= RETRY_TIME_LIMIT) {
//           logger.info("Retrying to fetch data");
//           response = await graphProxy.executeQuery(
//             config.subgraphUrl,
//             query);
//         }

//         // Checking final response
//         if (response.data === undefined) {
//           throw new Error(
//             "Response data is undefined: " + JSON.stringify(response));
//         }

//         // Building prices array
//         const prices = [];
//         for (const pair of response.data.pairs) {
//           const value =
//             parseFloat(pair.reserveUSD) / (2 * parseFloat(pair.reserve0));
//           prices.push({
//             symbol: pair.token0.symbol,
//             value,
//           });
//         }

//         return prices;
//       }
//     };

//     return fetcher;
//   },
// };
