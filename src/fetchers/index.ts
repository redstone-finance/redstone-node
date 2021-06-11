import { Fetcher } from "../types";
import yahooFinance from "./yahoo-finance";
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
import ftx from "./ftx";
import ecb from "./ecb";

export default {
  "yahoo-finance": yahooFinance,
  coingecko,
  sushiswap,
  coinbase,
  bitfinex,
  barchart,
  uniswap,
  bitmart,
  binance,
  kraken,
  kyber,
  huobi,
  ftx,
  ecb,
} as { [name: string]: Fetcher };
