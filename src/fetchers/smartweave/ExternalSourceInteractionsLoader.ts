import {
  BlockHeightSwCache,
  CacheableContractInteractionsLoader,
  EvaluationOptions,
  GQLEdgeInterface,
  InteractionsLoader,
} from "redstone-smartweave";

/**
 * This interactions loader either uses the supplied transactions
 * or fallbacks to "standard" implementation (ie. loading transactions from GQL endpoint).
 */
export class ExternalSourceInteractionsLoader
  extends CacheableContractInteractionsLoader
  implements InteractionsLoader
{
  private _transactions: Map<string, GQLEdgeInterface[]> = new Map<
    string,
    GQLEdgeInterface[]
  >();

  constructor(
    baseImplementation: InteractionsLoader,
    cache: BlockHeightSwCache<GQLEdgeInterface[]>
  ) {
    super(baseImplementation, cache);
  }

  async load(
    contractId: string,
    fromBlockHeight: number,
    toBlockHeight: number,
    evaluationOptions: EvaluationOptions
  ): Promise<GQLEdgeInterface[]> {
    if (!this._transactions.has(contractId)) {
      return super.load(
        contractId,
        fromBlockHeight,
        toBlockHeight,
        evaluationOptions
      );
    } else {
      return this._transactions.get(contractId)!;
    }
  }

  setTransactions(contractTxId: string, value: GQLEdgeInterface[]): void {
    this._transactions.set(contractTxId, value);
  }

  resetTransactions(contractTxId: string): void {
    this._transactions.delete(contractTxId);
  }
}
