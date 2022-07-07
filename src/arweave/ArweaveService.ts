import axios, { AxiosResponse } from "axios";
import { Manifest } from "../types";
import ArweaveProxy from "./ArweaveProxy";
import contracts from "../../src/config/contracts.json";
import { RedstoneOraclesState } from "../contracts/redstone-oracle-registry/types";
import { promiseTimeout } from "../utils/promise-timeout";

// DEN = distributed execution network
const SMARTWEAVE_DEN_NODE_URL = "https://d2rkt3biev1br2.cloudfront.net/state";
const ARWEAVE_URL = "https://arweave.net";
const oracleRegistryContractId = contracts["oracle-registry"];
const TIMEOUT_MS = process.env.NODE_ENV === "test" ? 5 : 10 * 1000;

export type BalanceCheckResult = { balance: number; isBalanceLow: boolean };

// Business service that supplies operations required by Redstone-Node.
export default class ArweaveService {
  constructor(private readonly arweaveProxy: ArweaveProxy) {}

  private async getOracleRegistryStateByDen(): Promise<RedstoneOraclesState> {
    const response = await axios.get(SMARTWEAVE_DEN_NODE_URL, {
      params: { id: oracleRegistryContractId },
    });
    return response.data.state;
  }

  private async getOracleRegistryStateByGateway() {
    const oracleRegistryContract =
      this.arweaveProxy.smartweave.contract<RedstoneOraclesState>(
        oracleRegistryContractId
      );
    return (await oracleRegistryContract.readState()).state;
  }

  private async getOracleRegistryByGatewayFallback(): Promise<RedstoneOraclesState> {
    try {
      return await promiseTimeout(
        () => this.getOracleRegistryStateByGateway(),
        TIMEOUT_MS
      );
    } catch (error) {
      throw new Error("Cannot fetch oracle registry state");
    }
  }

  private async getOracleRegistryState(): Promise<RedstoneOraclesState> {
    try {
      return await promiseTimeout(
        () => this.getOracleRegistryStateByDen(),
        TIMEOUT_MS
      );
    } catch {
      return this.getOracleRegistryByGatewayFallback();
    }
  }

  private async fetchManifestPromise(manifestTxId: string) {
    const response = await axios.get(`${ARWEAVE_URL}/${manifestTxId}`);
    const parsedManifest = (response as AxiosResponse<Manifest>).data;
    parsedManifest.txId = manifestTxId;
    return parsedManifest;
  }

  async getCurrentManifest(oldManifest?: Manifest): Promise<Manifest> {
    if (!this.arweaveProxy) {
      throw new Error(`getCurrentManifest requires defined arweaveProxy`);
    }

    // Fetching oracle registry contract state
    let oracleRegistry: RedstoneOraclesState;
    try {
      oracleRegistry = await this.getOracleRegistryState();
    } catch {
      if (oldManifest) {
        return oldManifest;
      } else {
        throw new Error(
          "Cannot fetch oracle registry state, old manifest doesn't exist"
        );
      }
    }

    // Extracting current manifest tx id
    const jwkAddress = await this.arweaveProxy.getAddress();
    const currentDataFeedId = oracleRegistry.nodes[jwkAddress].dataFeedId;
    const currentDataFeed = oracleRegistry.dataFeeds[currentDataFeedId];
    const manifestTxId = currentDataFeed.manifestTxId;

    // Fetching manifest content from Arwevae
    try {
      return await promiseTimeout(
        () => this.fetchManifestPromise(manifestTxId),
        TIMEOUT_MS
      );
    } catch {
      if (oldManifest) {
        return oldManifest;
      } else {
        throw new Error(
          "Cannot fetch new manifest, old manifest doesn't exist"
        );
      }
    }
  }
}
