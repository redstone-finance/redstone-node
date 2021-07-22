import { Consola } from "consola";
import axios, { AxiosResponse } from "axios";
import { PriceDataFetched, Fetcher } from "../../types";

const logger =
  require("../../utils/logger")("fetchers/verto") as Consola;

const URL = "https://v2.cache.verto.exchange/";

interface VertoTokenInfo {
  id: string,
  ticker: string
}

const vertoFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    // Fetching available tokens from Verto API
    const tokens = await axios.get(URL + 'tokens');
    if (tokens.data === undefined) {
      throw new Error(
        "Response tokens data is undefined: " + JSON.stringify(tokens));
    }

    const tokenPromises = tokens.data
      .filter(
        (token: VertoTokenInfo) => tokenSymbols.includes(token.ticker)
      )   
      .map(
        (token: VertoTokenInfo) => axios.get(URL + 'token/' + token.id + '/price')
      )

    // Fetching token prices from Verto API
    const quotes = (await Promise.all<AxiosResponse>(tokenPromises)).map(
      (response: AxiosResponse) => response.data
    )

    // Building prices
    const prices: PriceDataFetched[] = [];
    for (const symbol of tokenSymbols) {
      const details = quotes.find(quote => quote.ticker === symbol);
      if (details !== undefined) {
        prices.push({
          symbol,
          value: details.price,
        });
      } else {
        logger.warn(
          `Token is not supported with Verto source: ${symbol}`);
      }
    }

    console.log(prices)

    return prices;
  }
};

export default vertoFetcher;
