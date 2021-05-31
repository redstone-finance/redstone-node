import axios from "axios";
import { Consola } from "consola";
import RedstoneApi from "redstone-api";
import { PriceDataFetched, Fetcher } from "../../types";

const logger =
  require("../../utils/logger")("fetchers/kyber") as Consola;

const ETH_PAIRS_URL = "https://api.kyber.network/api/tokens/pairs";

const kyberFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    // Fetching pairs data from kyber api
    const response = await axios.get(ETH_PAIRS_URL);
    const pairs = response.data;

    // Building prices array
    const ethPrice = await getETHPriceInUSD();

    const prices: PriceDataFetched[] = [];
    for (const symbol of tokenSymbols) {
      const pair = pairs["ETH_" + symbol];

      if (pair === undefined) {
        logger.warn(
          `Token is not supported with kyber source: ${symbol}`);
      } else {
        prices.push({
          symbol,
          value: ethPrice * pair.currentPrice,
        });
      }
    }

    return prices;
  }
};

async function getETHPriceInUSD(): Promise<number> {
  const price = await RedstoneApi.getPrice("ETH");
  if (price === undefined) {
    throw new Error("Cannot fetch ETH price from limestone api");
  }
  return price.value;
}

export default kyberFetcher;
