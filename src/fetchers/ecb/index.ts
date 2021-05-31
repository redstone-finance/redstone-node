import * as exchangeRates from "ecb-euro-exchange-rates";
import { Consola } from "consola";
import { PriceDataFetched, Fetcher } from "../../types";

const logger =
  require("../../utils/logger")("fetchers/ecb") as Consola;

const ecbFetcher: Fetcher = {
  async fetchAll(symbols: string[]): Promise<PriceDataFetched[]> {
    // Fetching prices
    const { rates }: any = await exchangeRates.fetch();
    const usdRate = rates.USD;

    // Building prices array
    const prices = [];
    for (const symbol of symbols) {
      if (symbol === "EUR") {
        prices.push({
          symbol,
          value: usdRate,
        });
      } else if (rates[symbol] !== undefined) {
        prices.push({
          symbol,
          value: (1 / rates[symbol]) * usdRate as number,
        });
      } else {
        logger.warn(
          `Token is not supported with ecb source: ${symbol}`);
      }
    }

    return prices;
  },
};

export default ecbFetcher;
