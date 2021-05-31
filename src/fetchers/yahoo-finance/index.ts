import yahooFinance from "yahoo-finance";
import {Consola} from "consola";
import {Fetcher, PriceDataFetched} from "../../types";
import YahooFinanceProxy from "./YahooFinanceProxy";

const logger =
  require("../../utils/logger")("fetchers/yahoo-finance") as Consola;

const yahooFinanceProxy = new YahooFinanceProxy();

const yahooFinanceFetcher: Fetcher = {
  async fetchAll(symbols: string[]): Promise<PriceDataFetched[]> {
    // Fetching prices from Yahoo Finance
    const quotes: any = await yahooFinanceProxy.getExchangeRates(symbols);

    // Building prices
    const prices: PriceDataFetched[] = [];
    for (const symbol of symbols) {
      const details = quotes[symbol];
      if (details !== undefined) {
        prices.push({
          symbol,
          value: getPriceValue(details),
        });
      } else {
        logger.warn(
          `Token is not supported with yahoo-finance source: ${symbol}`);
      }
    }

    return prices;
  }
};

function getPriceValue(details: any) {
  const value: any = details.price.regularMarketPrice;
  if (isNaN(value)) {
    return value.raw;
  } else {
    return value;
  }
}

export default yahooFinanceFetcher;
