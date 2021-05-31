import { Fetcher } from "../types";
import yahooFinance from "./yahoo-finance";
import coingecko from "./coingecko";
import sushiswap from "./sushiswap";
import coinbase from "./coinbase";
import balancer from "./balancer";
import bitfinex from "./bitfinex";
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
  balancer,
  bitfinex,
  uniswap,
  bitmart,
  binance,
  kraken,
  kyber,
  huobi,
  ftx,
  ecb,
} as { [name: string]: Fetcher };
