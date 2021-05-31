import {Consola} from "consola";
import {Fetcher, PriceDataFetched} from "../../types";
import CoinbaseProxy from "./CoinbaseProxy";

const logger =
  require("../../utils/logger")("fetchers/coinbase") as Consola;

const coinbaseProxy = new CoinbaseProxy();

const coinbaseFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    // Fetching prices
    const exchangeRates = await coinbaseProxy.getExchangeRates();
    const currencies: any = exchangeRates.data;

    // Building prices array
    const prices = [];
    for (const symbol of tokenSymbols) {
      const rates = currencies.rates;
      const exchangeRate = rates[symbol];
      if (exchangeRate !== undefined) {
        prices.push({
          symbol,
          value: 1 / exchangeRate,
        });
      } else {
        logger.warn(
          `Token is not supported with coinbase source: ${symbol}`);
      }
    }

    return prices;
  },
};

export default coinbaseFetcher;
