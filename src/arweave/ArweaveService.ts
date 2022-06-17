import axios, { AxiosResponse } from "axios";
import { Manifest } from "../types";
import ArweaveProxy from "./ArweaveProxy";
import contracts from "../../src/config/contracts.json";
import { RedstoneOraclesState } from "../contracts/redstone-oracle-registry/types";

// DEN = distributed execution network
const SMARTWEAVE_DEN_NODE_URL = "https://d2rkt3biev1br2.cloudfront.net/state";
const ARWEAVE_URL = "https://arweave.net";
const oracleRegistryContractId = contracts["oracle-registry"];
const TIMEOUT_MS = process.env.NODE_ENV === "test" ? 5 : 10 * 1000;

export type BalanceCheckResult = { balance: number; isBalanceLow: boolean };

// Business service that supplies operations required by Redstone-Node.
export default class ArweaveService {
  constructor(private readonly arweaveProxy?: ArweaveProxy) {}

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

  private getOracleRegistryStateByDenCallback(
    callbackValue: RedstoneOraclesState | string
  ) {
    if (callbackValue === "timeout") {
      return this.getOracleRegistryByGatewayFallback();
    } else {
      return callbackValue;
    }
  }

  private onGetOracleRegistryStateByDenError() {
    return this.getOracleRegistryByGatewayFallback();
  }

  private getOracleRegistryByGatewayFallback(): Promise<RedstoneOraclesState> {
    return promiseTimeout(
      () => this.getOracleRegistryStateByGateway(),
      TIMEOUT_MS,
      (value) => this.getOracleRegistryByGatewayCallback(value),
      () => {
        throw new Error("Cannot fetch oracle registry state");
      }
    );
  }

  private getOracleRegistryByGatewayCallback(
    callbackValue: RedstoneOraclesState | string
  ) {
    if (callbackValue === "timeout") {
      throw new Error("Cannot fetch oracle registry state");
    } else {
      return callbackValue;
    }
  }

  private getOracleRegistryState(): Promise<RedstoneOraclesState> {
    return promiseTimeout(
      () => this.getOracleRegistryStateByDen(),
      TIMEOUT_MS,
      (value) => this.getOracleRegistryStateByDenCallback(value),
      () => this.onGetOracleRegistryStateByDenError()
    );
  }

  private async fetchManifestPromise(manifestTxId: string) {
    const response = await axios.get(`${ARWEAVE_URL}/${manifestTxId}`);
    const parsedManifest = (response as AxiosResponse<Manifest>).data;
    parsedManifest.txId = manifestTxId;
    return parsedManifest;
  }

  private fetchManifestCallback(callbackValue: Manifest | string) {
    if (callbackValue === "timeout") {
      throw new Error("Cannot fetch oracle registry state");
    } else {
      return callbackValue;
    }
  }

  private onFetchManifestError(oldManifest?: Manifest) {
    if (oldManifest) {
      return oldManifest;
    } else {
      throw new Error("Cannot fetch new manifest, old manifest doesn't exist");
    }
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
    return promiseTimeout(
      () => this.fetchManifestPromise(manifestTxId),
      TIMEOUT_MS,
      (value) => this.fetchManifestCallback(value),
      () => this.onFetchManifestError(oldManifest)
    );
  }
}
