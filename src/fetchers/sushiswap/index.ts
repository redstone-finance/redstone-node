import anySwapFetcher from "../any-swap-fetcher";

const symbolToPairIdObj: { [symbol: string]: string } =
  require("./sushiswap-symbol-to-pair-id.json");

export default anySwapFetcher.generateFetcher({
  subgraphUrl: "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
  symbolToPairIdObj,
  sourceName: "sushiswap",
});
