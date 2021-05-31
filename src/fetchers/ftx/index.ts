import { Consola } from "consola";
import axios from "axios";
import { PriceDataFetched, Fetcher } from "../../types";

const logger =
  require("../../utils/logger")("fetchers/ftx") as Consola;

const URL = "https://ftx.com/api/markets";

const ftxFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    // Fetching prices data from ftx api
    const response = await axios.get(URL);
    if (response.data === undefined || !response.data.success) {
      throw new Error(
        "Error response: " + JSON.stringify(response));
    }

    // Parsing response
    const fetchedPrices: { [symbol: string]: number } = {};
    for (const market of response.data.result) {
      const name = market.name;
      if (name.endsWith("USD")) {
        const symbol = name.slice(0, -4);
        fetchedPrices[symbol] = market.last;
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
          `Token is not supported with ftx source: ${symbol}`);
      }
    }

    return prices;
  }
};

export default ftxFetcher;
