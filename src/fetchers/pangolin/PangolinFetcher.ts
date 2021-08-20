import { DexFetcher } from "../DexFetcher";

const symbolToPairIdObj: { [symbol: string]: string } =
  require("./pangolin-symbol-to-pair-id.json");

const subgraphUrl = "https://api.thegraph.com/subgraphs/name/dasconnor/pangolin-dex";

export class PangolinFetcher extends DexFetcher {
  constructor() {
    super("pangolin", subgraphUrl, symbolToPairIdObj);
  }
};
