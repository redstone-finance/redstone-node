import { Fetcher } from "../types";
import ccxtFetchers from "./ccxt/all-ccxt-fetchers";
import pangolinFetchers from "./pangolin/all-pangolin-fetchers";
import { YfUnofficialFetcher } from "./yf-unofficial/YfUnofficialFetcher";
import { CustomUrlsFetcher } from "./custom-urls/CustomUrlsFetcher";
import { TraderJoeFetcher } from "./trader-joe/TraderJoeFetcher";
import { CoingeckoFetcher } from "./coingecko/CoingeckoFetcher";
import { SushiswapFetcher } from "./sushiswap/SushiswapFetcher";
import { UniswapFetcher } from "./uniswap/UniswapFetcher";
import { KyberFetcher } from "./kyber/KyberFetcher";
import { VertoFetcher } from "./verto/VertoFetcher";
import { EcbFetcher } from "./ecb/EcbFetcher";
import { DrandFetcher } from "./drand/DrandFetcher";
import twapFetchers from "./twap/all-twap-fetchers";
import { TwelveDataFetcher } from "./twelve-data/TwelveDataFetcher";
import { AvalancheYYFetcher } from "./evm-chain/AvalancheYYFetcher";

export default {
  "yf-unofficial": new YfUnofficialFetcher(),
  "custom-urls": new CustomUrlsFetcher(),
  "trader-joe": new TraderJoeFetcher(),
  "twelve-data": new TwelveDataFetcher(),
  coingecko: new CoingeckoFetcher(),
  sushiswap: new SushiswapFetcher(),
  uniswap: new UniswapFetcher(),
  drand: new DrandFetcher(),
  kyber: new KyberFetcher(),
  verto: new VertoFetcher(),
  ecb: new EcbFetcher(),
  avalancheYyFetcher$YYAV3SA1: new AvalancheYYFetcher(
    "https://api.snowtrace.io/api?module=contract&action=getabi&address=0xaAc0F2d0630d1D09ab2B5A400412a4840B866d95&format=json",
    "https://api.avax.network/ext/bc/C/rpc",
    "0xaAc0F2d0630d1D09ab2B5A400412a4840B866d95",
    "$YYAV3SA1"
  ),

  ...ccxtFetchers,
  ...pangolinFetchers,
  ...twapFetchers,
} as { [name: string]: Fetcher };
