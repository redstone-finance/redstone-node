import { UniOrSushiSwapFetcher } from "../UniOrSushiSwapFetcher";

const symbolToPairIdObj: { [symbol: string]: string } =
  require("./sushiswap-symbol-to-pair-id.json");

const subgraphUrl = "https://api.thegraph.com/subgraphs/name/sushiswap/exchange";

export class SushiswapFetcher extends UniOrSushiSwapFetcher {
  constructor() {
    super("sushiswap", subgraphUrl, symbolToPairIdObj);
  }
};
