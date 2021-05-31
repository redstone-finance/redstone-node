import { Consola } from "consola";
import { PriceDataFetched, Fetcher } from "../../types";
import CoingeckoProxy from "./CoingeckoProxy";
const logger =
  require("../../utils/logger")("fetchers/coingecko") as Consola;
const symbolToId: { [symbol: string]: string } =
  require("./coingecko-symbol-to-id.json") as any;

const coingeckoProxy = new CoingeckoProxy();

const coingeckoFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    const idToSymbol: { [id: string]: string } = idsToSymbols(tokenSymbols);

    // Fetching prices data
    const response = await coingeckoProxy.getExchangeRates(Object.keys(idToSymbol));

    // Building prices array
    const prices = [];
    for (const id in response.data) {
      prices.push({
        symbol: idToSymbol[id],
        value: response.data[id].usd,
      });
    }

    return prices;
  },
};

function idsToSymbols(tokenSymbols: string[]): { [id: string]: string } {
  const idToSymbol: { [id: string]: string } = {};
  for (const symbol of tokenSymbols) {
    const id = symbolToId[symbol];
    if (id !== undefined) {
      idToSymbol[id] = symbol;
    } else {
      logger.warn(
        `Token is not supported with coingecko source: ${symbol}`);
    }
  }

  return idToSymbol;
}

export default coingeckoFetcher;
