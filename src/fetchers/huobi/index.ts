import RedstoneApi from "redstone-api";
import { Consola } from "consola";
import axios from "axios";
import { PriceDataFetched, Fetcher } from "../../types";
import { trackStart, trackEnd } from "../../utils/performance-tracker";

const logger =
  require("../../utils/logger")("fetchers/huobi") as Consola;
const symbolToUsdtPairId: { [symbol: string]: string } =
  require("./huobi-symbol-to-usdt-pair-id.json") as any;

const URL = "https://api.huobi.pro/market/tickers";

const huobiFetcher: Fetcher = {
  async fetchAll(tokenSymbols: string[]): Promise<PriceDataFetched[]> {
    const prices: PriceDataFetched[] = [];

    trackStart("huobi-fetcher-usdt-price-fetching");
    const usdtPrice = await getUsdtPriceInUSD();
    trackEnd("huobi-fetcher-usdt-price-fetching");

    const response: any = await axios.get(URL);
    if (response.data === undefined) {
      throw new Error(
        "Response data is undefined: " + JSON.stringify(response));
    }

    const huobiPrices: {[symbol: string]: number} = {};
    for (const huobiPrice of response.data.data) {
      huobiPrices[huobiPrice.symbol] = huobiPrice.close;
    }

    // Fetching prices asynchronously
    for (const symbol of tokenSymbols) {
      const usdtPairId = symbolToUsdtPairId[symbol];
      if (usdtPairId !== undefined && huobiPrices[usdtPairId] !== undefined) {
        prices.push({
          symbol,
          value: huobiPrices[usdtPairId] * usdtPrice,
        });

      } else {
        logger.warn(
          `Token is not supported with huobi source: ${symbol}`);
      }
    }

    return prices;
  }
};

async function getUsdtPriceInUSD(): Promise<number> {
  const usdtPriceInUSD = await RedstoneApi.getPrice("USDT");
  if (usdtPriceInUSD === undefined) {
    throw new Error("Cannot fetch USDT price from limestone api");
  }

  return usdtPriceInUSD.value;
}

export default huobiFetcher;
