import ccxt from "ccxt";
import kraken from "./kraken.json";

type MappingsForCCXT = Partial<{
  [exchangeId in ccxt.ExchangeId]: {
    [symbolId in string]: string;
  };
}>;

export default {
  kraken,
} as MappingsForCCXT;
