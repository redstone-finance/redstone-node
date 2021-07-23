import anySwapFetcher from "../any-swap-fetcher";

// TODO: refactor using AnySwapFetcher

const symbolToPairIdObj: { [symbol: string]: string } =
  require("./uniswap-symbol-to-pair-id.json");

export default anySwapFetcher.generateFetcher({
  subgraphUrl: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
  symbolToPairIdObj,
  sourceName: "uniswap",
});
