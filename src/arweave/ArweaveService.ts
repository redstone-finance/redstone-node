import axios from "axios";
import { Manifest } from "../types";
import ArweaveProxy from "./ArweaveProxy";
import contracts from "../../src/config/contracts.json";
import { RedstoneOraclesState } from "../contracts/redstone-oracle-registry/types";

// DEN = distributed execution network
const SMARTWEAVE_DEN_NODE_URL = "https://d2rkt3biev1br2.cloudfront.net/state";
const ARWEAVE_URL = "https://arweave.net";
const oracleRegistryContractId = contracts["oracle-registry"];

export type BalanceCheckResult = { balance: number; isBalanceLow: boolean };

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
    if (!this.arweaveProxy) {
      throw new Error(`getCurrentManifest requires defined arweaveProxy`);
    }

    // Fetching oracle registry contract state
    const oracleRegistry = await this.getOracleRegistryContractState();

    // Extracting current manifest tx id
    const jwkAddress = await this.arweaveProxy.getAddress();
    const currentDataFeedId = oracleRegistry.nodes[jwkAddress].dataFeedId;
    const currentDataFeed = oracleRegistry.dataFeeds[currentDataFeedId];
    const manifestTxId = currentDataFeed.manifestTxId;

    // Fetching manifest content from Arwevae
    const response = await axios.get(`${ARWEAVE_URL}/${manifestTxId}`);
    const parsedManifest = response.data;
    parsedManifest.txId = manifestTxId;

    return parsedManifest;
  }
}
