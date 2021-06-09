import axios from "axios";
import {Consola} from "consola";
import {Fetcher, PriceDataFetched} from "../../types";

const logger =
  require("../../utils/logger")("fetchers/barchart") as Consola;

const URL = "https://ondemand.websol.barchart.com/getQuote.json";

const barchartFetcher: Fetcher = {
  async fetchAll(symbols: string[], credentials): Promise<PriceDataFetched[]> {
    // Fetching prices from Barchart
    const response: any = await axios.get(URL, {
      params: {
        apikey: credentials?.credentials.barchartApiKey,
        symbols: symbols.map(convertSymbol).join(","),
      },
    });
    // TODO: remove after debugging
    logger.info("Barchart response: " + JSON.stringify(response.data));

    // Response validation and unpacking
    if (response.data.status.code !== 200) {
      throw new Error("Got invalid response from barchart API");
    }
    if (response.data.results.length === 0) {
      throw new Error("Empty array received from barchart API");
    }
    const pricesObj: { [symbol: string]: number } = {};
    for (const price of response.data.results) {
      pricesObj[price.symbol] = price.lastPrice;
    }

    // Building prices
    const prices: PriceDataFetched[] = [];
    for (const symbol of symbols) {
      const value = pricesObj[convertSymbol(symbol)];
      if (value !== undefined) {
        prices.push({
          symbol,
          value,
        });
      } else {
        logger.warn(
          `Token is not supported with barchart source: ${symbol}`);
      }
    }

    return prices;
  }
};

function convertSymbol(symbol: string) {
  if (symbol.endsWith("21")) {
    return symbol;
  } else {
    return symbol + ".BZ";
  }
}

export default barchartFetcher;
