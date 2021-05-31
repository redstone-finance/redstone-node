import {Consola} from "consola";
import graphProxy from "../utils/graph-proxy";
import {PriceDataFetched, Fetcher} from "../types";

const RETRY_TIME_LIMIT = 2000; // ms

const logger =
  require("../utils/logger")("fetchers/any-swap-fetcher") as Consola;

interface SymbolToPairId {
  [symbol: string]: string;
};

interface AnySwapFetcherConfig {
  subgraphUrl: string;
  symbolToPairIdObj: SymbolToPairId;
  sourceName: string;
};

export default {
  generateFetcher(config: AnySwapFetcherConfig): Fetcher {
    const fetcher = {
      async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
        const tokenIds = convertSymbolsToPairIds(
          tokenSymbols,
          config.symbolToPairIdObj,
          config.sourceName);

        const query = `{
          pairs(where: { id_in: ${JSON.stringify(tokenIds)} }) {
            token0 {
              symbol
            }
            reserve0
            reserveUSD
          }
        }`;

        // Fetching pairs data from uniswap subgraph
        const fetchStartTime = Date.now();
        let response = await graphProxy.executeQuery(
          config.subgraphUrl,
          query);
        const timeElapsed = Date.now() - fetchStartTime;

        // Retrying to fetch if needed
        if (response.data === undefined && timeElapsed <= RETRY_TIME_LIMIT) {
          logger.info("Retrying to fetch data");
          response = await graphProxy.executeQuery(
            config.subgraphUrl,
            query);
        }

        // Checking final response
        if (response.data === undefined) {
          throw new Error(
            "Response data is undefined: " + JSON.stringify(response));
        }

        // Building prices array
        const prices = [];
        for (const pair of response.data.pairs) {
          const value =
            parseFloat(pair.reserveUSD) / (2 * parseFloat(pair.reserve0));
          prices.push({
            symbol: pair.token0.symbol,
            value,
          });
        }

        return prices;
      }
    };

    return fetcher;
  },
};

function convertSymbolsToPairIds(
  symbols: string[],
  symbolToPairId: SymbolToPairId,
  sourceName: string): string[] {
  const pairIds = [];

  for (const symbol of symbols) {
    const pairId = symbolToPairId[symbol];
    if (pairId === undefined) {
      logger.warn(
        `Token is not supported with ${sourceName} source: ${symbol}`);
    } else {
      pairIds.push(pairId);
    }
  }

  return pairIds;
}
