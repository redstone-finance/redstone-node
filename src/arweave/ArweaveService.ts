import { Consola } from "consola";
import { Manifest } from "../types";
import ArweaveProxy from "./ArweaveProxy";

export type BalanceCheckResult = { balance: number, isBalanceLow: boolean }

// Business service that supplies operations required by Redstone-Node.
export default class ArweaveService {

  private static readonly PROVIDERS_REGISTRY_TX_ID: string = "OrO8n453N6bx921wtsEs-0OCImBLCItNU5oSbFKlFuU";

  constructor(private readonly arweaveProxy: ArweaveProxy) {}

  async getCurrentManifest(): Promise<Manifest> {
    const jwkAddress = await this.arweaveProxy.getAddress();

    const providersRegistryContract = this.arweaveProxy.smartweave
      .contract(ArweaveService.PROVIDERS_REGISTRY_TX_ID)
      .connect(this.arweaveProxy.jwk);

    const { result } = await providersRegistryContract.viewState({
      function: 'activeManifest',
      data: {
        providerId: jwkAddress,
        eagerManifestLoad: true
      }
    });

    // @ts-ignore
    return result.manifest.activeManifestContent;
  }
}
