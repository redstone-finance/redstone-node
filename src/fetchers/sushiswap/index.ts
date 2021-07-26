import { AnySwapFetcher } from "../AnySwapFetcher";

const symbolToPairIdObj: { [symbol: string]: string } =
  require("./sushiswap-symbol-to-pair-id.json");

const subgraphUrl = "https://api.thegraph.com/subgraphs/name/sushiswap/exchange";

export default new AnySwapFetcher("sushiswap", subgraphUrl, symbolToPairIdObj);
