import { Manifest } from "../types";
import ArweaveProxy from "./ArweaveProxy";
import contracts from "../../src/config/contracts.json";
import {
  DataFeedWithId,
  NodeWithAddress,
  RedstoneOraclesInput,
} from "../contracts/redstone-oracle-registry/types";

const oracleRegistryContractId = contracts["oracle-registry"];

export type BalanceCheckResult = { balance: number, isBalanceLow: boolean }

// Business service that supplies operations required by Redstone-Node.
export default class ArweaveService {

  constructor(private readonly arweaveProxy: ArweaveProxy) {}

  async getCurrentManifest(): Promise<Manifest> {
    const jwkAddress = await this.arweaveProxy.getAddress();
    const oracleRegistryContract = this.arweaveProxy.smartweave
      .contract(oracleRegistryContractId)
      .connect(this.arweaveProxy.jwk);
    const node = (await oracleRegistryContract.viewState<RedstoneOraclesInput, NodeWithAddress>({
      function: "getNodeDetails",
      data: {
        address: jwkAddress,
      }
    })).result;

    const dataFeed = (await oracleRegistryContract.viewState<RedstoneOraclesInput, DataFeedWithId>({
      function: "getDataFeedDetailsById",
      data: {
        id: node.dataFeedId,
      }
    })).result;

    const manifestContent = await this.arweaveProxy.arweave.transactions.getData(
      dataFeed.manifestTxId,
      { decode: true, string: true }
    );
    return JSON.parse(manifestContent as string);
  }
}
