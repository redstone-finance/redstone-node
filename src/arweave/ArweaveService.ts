import { Consola } from "consola";
import { Manifest } from "../types";
import ArweaveProxy from "./ArweaveProxy";

export type BalanceCheckResult = { balance: number, isBalanceLow: boolean }

// Business service that supplies operations required by Redstone-Node.
export default class ArweaveService {

  private static readonly CONTRACT_REGISTRY_TX_ID: string = "XQkGzXG6YknJyy-YbakEZvQKAWkW2_aPRhc3ShC8lyA";
  private static readonly PROVIDERS_REGISTRY_CONTRACT: string = "providers-registry";

  constructor(private readonly arweaveProxy: ArweaveProxy) {}

  async getCurrentManifest(): Promise<Manifest> {
    const jwkAddress = await this.arweaveProxy.getAddress();

    // Getting contract tx id for providers registry contract
    const contractRegistryContract = this.arweaveProxy.smartweave
      .contract(ArweaveService.CONTRACT_REGISTRY_TX_ID)
      .connect(this.arweaveProxy.jwk);

    const { result: contractRegistry } = await contractRegistryContract.viewState<any, any>({
      function: "contractsCurrentTxId",
      data: {
        contractNames: [ArweaveService.PROVIDERS_REGISTRY_CONTRACT]
      }
    });

    const providersRegistryContractTxId = contractRegistry[ArweaveService.PROVIDERS_REGISTRY_CONTRACT];

    // Getting the latest manifest for current provider
    const providersRegistryContract = this.arweaveProxy.smartweave
      .contract(providersRegistryContractTxId)
      .connect(this.arweaveProxy.jwk);

    const { result } = await providersRegistryContract.viewState<any, any>({
      function: "activeManifest",
      data: {
        providerId: jwkAddress,
        eagerManifestLoad: true
      }
    });

    return result.manifest.activeManifestContent;
  }
}
