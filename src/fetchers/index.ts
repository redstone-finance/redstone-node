import { Fetcher } from "../types";
import ccxtFetchers from "./ccxt/all-ccxt-fetchers";
import { ApiDojoRapidFetcher } from "./api-dojo-rapid/ApiDojoRapidFetcher";
import { YfUnofficialFetcher } from "./yf-unofficial/YfUnofficialFetcher";
import { CoingeckoFetcher } from "./coingecko/CoingeckoFetcher";
import { SushiswapFetcher } from "./sushiswap/SushiswapFetcher";
import { PangolinFetcher } from "./pangolin/PangolinFetcher";
import { CoinbaseFetcher } from "./coinbase/CoinbaseFetcher";
import { UniswapFetcher } from "./uniswap/UniswapFetcher";
import { KyberFetcher } from "./kyber/KyberFetcher";
import { VertoFetcher } from "./verto/VertoFetcher";
import { EcbFetcher } from "./ecb/EcbFetcher";

export default {
  "api-dojo-rapid": new ApiDojoRapidFetcher(),
  "yf-unofficial": new YfUnofficialFetcher(),
  coingecko: new CoingeckoFetcher(),
  sushiswap: new SushiswapFetcher(),
  pangolin: new PangolinFetcher(),
  coinbase: new CoinbaseFetcher(),
  uniswap: new UniswapFetcher(),
  kyber: new KyberFetcher(),
  verto: new VertoFetcher(),
  ecb: new EcbFetcher(),

  ...ccxtFetchers,
} as { [name: string]: Fetcher };
