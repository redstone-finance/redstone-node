import axios from "axios";
import { Manifest } from "../types";
import ArweaveProxy from "./ArweaveProxy";
import contracts from "../../src/config/contracts.json";
import {
  RedstoneOraclesState,
} from "../contracts/redstone-oracle-registry/types";

// DEN = distributed execution network
const SMARTWEAVE_DEN_NODE_URL = "https://d2rkt3biev1br2.cloudfront.net/state";
const oracleRegistryContractId = contracts["oracle-registry"];

export type BalanceCheckResult = { balance: number, isBalanceLow: boolean }

// Business service that supplies operations required by Redstone-Node.
export default class ArweaveService {

  constructor(private readonly arweaveProxy?: ArweaveProxy) {}

  // TODO: maybe implement fallback with timeouts:
  // DEN -> Redstone Gateway -> Arweave directly (arweave.net)
  async getOracleRegistryContractState(): Promise<RedstoneOraclesState> {
    const response = await axios.get(SMARTWEAVE_DEN_NODE_URL, {
      params: { id: oracleRegistryContractId },
    });
    return response.data.state;
  }

  async getCurrentManifest(): Promise<Manifest> {
    const oracleRegistry = await this.getOracleRegistryContractState();

    if (!this.arweaveProxy) {
      throw new Error(`getCurrentManifest requires defined arweaveProxy`);
    }

    const jwkAddress = await this.arweaveProxy.getAddress();
    const currentDataFeedId = oracleRegistry.nodes[jwkAddress].dataFeedId;
    const currentDataFeed = oracleRegistry.dataFeeds[currentDataFeedId];
    const manifestTxId = currentDataFeed.manifestTxId;

    const manifestContent = await this.arweaveProxy.arweave.transactions.getData(
      manifestTxId,
      { decode: true, string: true }
    );
    const parsedManifest = JSON.parse(manifestContent as string);

    return parsedManifest;
  }
}
