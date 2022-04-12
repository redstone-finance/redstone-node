import { Fetcher } from "../types";
import ccxtFetchers from "./ccxt/all-ccxt-fetchers";
import pangolinFetchers from "./pangolin/all-pangolin-fetchers";
import { YfUnofficialFetcher } from "./yf-unofficial/YfUnofficialFetcher";
import { TraderJoeFetcher } from "./trader-joe/TraderJoeFetcher";
import { CoingeckoFetcher } from "./coingecko/CoingeckoFetcher";
import { SushiswapFetcher } from "./sushiswap/SushiswapFetcher";
import { CoinbaseFetcher } from "./coinbase/CoinbaseFetcher";
import { UniswapFetcher } from "./uniswap/UniswapFetcher";
import { KyberFetcher } from "./kyber/KyberFetcher";
import { VertoFetcher } from "./verto/VertoFetcher";
import { EcbFetcher } from "./ecb/EcbFetcher";
import { DrandFetcher } from "./drand/DrandFetcher";
import twapFetchers from "./twap/all-twap-fetchers";

export default {
  "yf-unofficial": new YfUnofficialFetcher(),
  "trader-joe": new TraderJoeFetcher(),
  coingecko: new CoingeckoFetcher(),
  sushiswap: new SushiswapFetcher(),
  coinbase: new CoinbaseFetcher(),
  uniswap: new UniswapFetcher(),
  drand: new DrandFetcher(),
  kyber: new KyberFetcher(),
  verto: new VertoFetcher(),
  ecb: new EcbFetcher(),

  ...ccxtFetchers,
  ...pangolinFetchers,
  ...twapFetchers,
} as { [name: string]: Fetcher };
