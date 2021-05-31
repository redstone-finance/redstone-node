import { Consola } from "consola";
import axios from "axios";
import { PriceDataFetched, Fetcher } from "../../types";

const logger =
  require("../../utils/logger")("fetchers/bitfinex") as Consola;

const URL = "https://api-pub.bitfinex.com/v2/tickers";

const bitfinexFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    // Fetching prices data from bitfinex api
    const response = await axios.get(URL, { params: {
      symbols: "ALL",
    }});
    if (response.data === undefined) {
      throw new Error(
        "Response data is undefined: " + JSON.stringify(response));
    }

    // Parsing response
    const fetchedPrices: { [symbol: string]: number } = {};
    for (const tickerData of response.data) {
      const tickerName: string = tickerData[0];
      if (tickerName.startsWith("t")) {
        const price = tickerData[7];
        if (tickerName.endsWith("USD")) {
          const symbol = getSymbolFromTicker(tickerName);
          fetchedPrices[symbol] = price;
        }
      }
    }

    // Building prices
    const prices: PriceDataFetched[] = [];
    for (const symbol of tokenSymbols) {
      if (fetchedPrices[symbol] !== undefined) {
        prices.push({
          symbol,
          value: fetchedPrices[symbol],
        });
      } else {
        logger.warn(
          `Token is not supported with bitfinex source: ${symbol}`);
      }
    }

    return prices;
  }
};

function getSymbolFromTicker(tickerName: string): string {
  return tickerName.slice(1, -3);
}

export default bitfinexFetcher;
