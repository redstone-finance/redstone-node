import axios from "axios";
import {Consola} from "consola";
import {Fetcher, PriceDataFetched} from "../../types";

const logger =
  require("../../utils/logger")("fetchers/barchart-test") as Consola;

// We temporarly changed the URL by Barchart support request
// const URL = "https://ondemand.websol.barchart.com/getQuote.json";
const URL = "https://openfeed.aws.barchart.com/stream/quotes.jsx";

const barchartTestFetcher: Fetcher = {
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
    logger.info("Barchart-test response: " + JSON.stringify(response.data));

    let badPricesReturned = false;

    const pricesObj: { [symbol: string]: number } = {};
    for (const symbol in response.data.data) {
      const details = response.data.data[symbol];
      // Hmm, I don't know why, but they have these fields in their reponse
      // And somtimes last and last2 is empty but last3 has some value ¯\_(ツ)_/¯
      let lastPrice = details.last || details.last2 || details.last3;
      if (!lastPrice && details.previous_session && details.previous_session.last) {
        lastPrice = details.previous_session.last;
      }

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
      if (value) {
        prices.push({
          symbol,
          value,
        });
      } else {
        logger.warn(
          `Token is not supported with barchart-test source: ${symbol}`);
      }
    }

    return prices;
  }
};

function convertSymbol(symbol: string) {
  if (symbol.endsWith("21")) {
    // For some reasons, now for XXX21 it returns XXX1
    return symbol.replace("2", "");
  } else {
    return symbol + ".BZ";
  }
}

export default barchartTestFetcher;
