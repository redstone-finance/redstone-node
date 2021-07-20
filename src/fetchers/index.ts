import { Fetcher } from "../types";
import yahooFinanceRapid from "./yahoo-finance-rapid";
import yahooFinanceFree from "./yahoo-finance-free";
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
import ftx from "./ftx";
import ecb from "./ecb";

export default {
  "yahoo-finance-free": yahooFinanceFree,
  "barchart-test": barchartTest,
  "yahoo-finance-rapid": yahooFinanceRapid,
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
