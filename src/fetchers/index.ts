import { Fetcher } from "../types";
import apiDojoRapid from "./api-dojo-rapid";
import yfUnofficial from "./yf-unofficial";
import barchartTest from "./barchart-test";
import coingecko from "./coingecko";
import sushiswap from "./sushiswap";
import coinbase from "./coinbase";
import bitfinex from "./bitfinex";
import barchart from "./barchart";
import uniswap from "./uniswap";
import bitmart from "./bitmart";
import binance from "./binance";
import kraken from "./kraken";
import kyber from "./kyber";
import huobi from "./huobi";
import verto from "./verto";
import ftx from "./ftx";
import ecb from "./ecb";

export default {
  "api-dojo-rapid": apiDojoRapid,
  "yf-unofficial": yfUnofficial,
  "barchart-test": barchartTest,
  coingecko,
  sushiswap,
  coinbase,
  bitfinex,
  barchart,
  uniswap,
  bitmart,
  binance,
  kraken,
  verto,
  kyber,
  huobi,
  ftx,
  ecb,
} as { [name: string]: Fetcher };
