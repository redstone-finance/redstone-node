import axios from "axios";
import {Consola} from "consola";
import {Fetcher, PriceDataFetched} from "../../types";

const logger =
  require("../../utils/logger")("fetchers/barchart") as Consola;

// We temporarly changed the URL by Barchart support request
// const URL = "https://ondemand.websol.barchart.com/getQuote.json";
const URL = "https://openfeed.aws.barchart.com/stream/quotes.jsx";

const barchartFetcher: Fetcher = {
  async fetchAll(symbols: string[], credentials): Promise<PriceDataFetched[]> {
    // Fetching prices from Barchart
    const getParams = {
      // apikey: credentials?.credentials.barchartApiKey, // temporarly commented by Barchart support request
      username: credentials!.credentials.barchartUsername,
      password: credentials!.credentials.barchartPassword,
      version: "json",
      symbols: symbols.map(convertSymbol).join(","),
    };
    const response: any = await axios.get(URL, {
      params: getParams,
    });

    logger.info(`Sending GET request to ${URL} with params: `
      + JSON.stringify(getParams));

    // TODO: remove later when barchart fetcher will be 100% stable
    logger.info("Barchart response: " + JSON.stringify(response.data));

    // Response validation and unpacking
    // if (response.data.status.code !== 200) {
    //   throw new Error("Got invalid response from barchart API");
    // }
    // if (response.data.results.length === 0) {
    //   throw new Error("Empty array received from barchart API");
    // }
    // if (response.data.results[0].lastPrice === null) {
    //   throw new Error("Barchart response contains invalid price");
    // }

    let badPricesReturned = false;

    const pricesObj: { [symbol: string]: number } = {};
    for (const symbol in response.data.data) {
      const lastPrice = response.data.data[symbol].last;
      pricesObj[symbol] = lastPrice;
      if (!lastPrice) {
        badPricesReturned = true;
      }
    }

    if (badPricesReturned) {
      logger.warn(
        "Barcahrt response contains invalid prices: "
        + JSON.stringify(response.data));
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
    // return symbol;
    // Quick fix, for some reasons, now for XXX21 it returns XXX1
    return symbol.replace("2", "");
  } else {
    return symbol + ".BZ";
  }
}

export default barchartFetcher;
