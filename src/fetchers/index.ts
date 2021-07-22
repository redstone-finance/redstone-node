import { Fetcher } from "../types";
import ccxtFetchers from "./ccxt/all-ccxt-fetchers";
import apiDojoRapid from "./api-dojo-rapid";
import yfUnofficial from "./yf-unofficial";
import coingecko from "./coingecko";
import sushiswap from "./sushiswap";
import coinbase from "./coinbase";
import uniswap from "./uniswap";
import kyber from "./kyber";
<<<<<<< HEAD
=======
import huobi from "./huobi";
import verto from "./verto";
import ftx from "./ftx";
>>>>>>> main
import ecb from "./ecb";

export default {
  "api-dojo-rapid": apiDojoRapid,
  "yf-unofficial": yfUnofficial,
  coingecko,
  sushiswap,
  coinbase,
  uniswap,
<<<<<<< HEAD
=======
  bitmart,
  binance,
  kraken,
  verto,
>>>>>>> main
  kyber,
  ecb,

  ...ccxtFetchers,
} as { [name: string]: Fetcher };
