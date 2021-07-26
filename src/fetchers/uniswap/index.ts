import { AnySwapFetcher } from "../AnySwapFetcher";

const symbolToPairIdObj: { [symbol: string]: string } =
  require("./uniswap-symbol-to-pair-id.json");

const subgraphUrl = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";

export default new AnySwapFetcher("uniswap", subgraphUrl, symbolToPairIdObj);
