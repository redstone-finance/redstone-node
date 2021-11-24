import { DataFetched, Fetcher } from "../../types";
import ArweaveMultihost from "arweave-multihost";
import {
  ContractInteractionsLoader,
  EvalStateResult,
  GQLEdgeInterface,
  LoggerFactory,
  MemBlockHeightSwCache,
  SmartWeave,
  SmartWeaveNodeFactory,
  SmartWeaveTags,
  StateCache,
} from "redstone-smartweave";
import Arweave from "arweave/node";
import { ExternalSourceInteractionsLoader } from "./ExternalSourceInteractionsLoader";
import { BlockSmartweaveInteractions } from "./BlockSmartweaveInteractions";

type ContractState = {
  contractTxId: string;
  result: EvalStateResult<any>;
};

type ContractStatePromiseResult =
  | PromiseFulfilledResult<ContractState>
  | PromiseRejectedResult;

// note: that's a structure that should be saved in a persistent storage
export type SwFetchResult = {
  state: EvalStateResult<any>;
  blockHeight: number;
};

export class SmartWeaveFetcher implements Fetcher<SwFetchResult> {
  private readonly logger = LoggerFactory.INST.create("SmartWeaveFetcher");

  // FIXME: should be persisted?
  private readonly lastProcessedBlock: Map<string, number>;
  private readonly arweave: Arweave;
  private readonly smartweave: SmartWeave;
  private readonly interactionsLoader: ExternalSourceInteractionsLoader;
  private readonly blockSmartweaveInteractions: BlockSmartweaveInteractions;
  private readonly stateCache: MemBlockHeightSwCache<StateCache<unknown>>;

  private constructor(arweave: Arweave) {
    this.lastProcessedBlock = new Map<string, number>();
    this.arweave = arweave;

    this.blockSmartweaveInteractions = new BlockSmartweaveInteractions(
      this.arweave
    );

    this.stateCache = new MemBlockHeightSwCache<StateCache<unknown>>(10);
    this.interactionsLoader = new ExternalSourceInteractionsLoader(
      new ContractInteractionsLoader(this.arweave),
      new MemBlockHeightSwCache(10)
    );

    // FIXME: smartweave instance probably cannot be created as instance field
    // - as the ExternalSourceInteractionsLoader stores transactions in its state
    // - there is a risk that one given iteration won't finish its processing
    // before next iteration will be fired - which may cause transactions to be overwritten.
    this.smartweave = SmartWeaveNodeFactory.memCachedBased(
      this.arweave,
      10,
      this.stateCache
    )
      .setInteractionsLoader(this.interactionsLoader)
      .build();
  }

  static async init(
    observedContractTxIds: string[],
    arweave: Arweave
  ): Promise<Fetcher<SwFetchResult>> {
    const fetcher = new SmartWeaveFetcher(arweave);
    await fetcher.initCache(observedContractTxIds);
    return fetcher;
  }

  async initCache(observedContractTxIDs: string[]) {
    /*
    // TODO: load contracts state from persistent storage - all at once? this might take a while...
    // alternatively extend the MemBlockHeightSwCache with fallback to persistent storage - but this would be
    // probably slower
    observedContractTxIDs.forEach(async (id) => {
      // probably would be wiser to ask the storage for all the contracts at once - or in batches
      const swFetchResult: SwFetchResult = this.storage.getLatest(id);
      await this.stateCache.put(
        { cacheKey: id, blockHeight: swFetchResult.blockHeight },
        [swFetchResult.state]
      );
    });
    */
  }

  async fetchAll(
    contractTxIDs: string[]
  ): Promise<DataFetched<SwFetchResult>[]> {
    const result: DataFetched<SwFetchResult>[] = [];

    const currentBlockHeight = (await this.arweave.network.getInfo()).height;
    this.logger.info("Fetching for block height", currentBlockHeight);

    const contractsNotEvaluatedInLastBlock: string[] = [];
    const contractsEvaluatedInLastBlock: string[] = [];

    contractTxIDs.forEach((contractTxId: string) => {
      // first contract read
      if (!this.lastProcessedBlock.has(contractTxId)) {
        contractsNotEvaluatedInLastBlock.push(contractTxId);
      }

      const lastContractBlock = this.lastProcessedBlock.get(contractTxId)!;

      // contract was last evaluated for previous block
      if (lastContractBlock == currentBlockHeight - 1) {
        contractsEvaluatedInLastBlock.push(contractTxId);
        // contract was last evaluated before previous block
      } else if (lastContractBlock < currentBlockHeight - 1) {
        contractsNotEvaluatedInLastBlock.push(contractTxId);
      }
    });

    // for contracts not evaluated in previous block - read state in a "traditional" way
    this.logger.info(
      "Not evaluated in prev block:",
      contractsNotEvaluatedInLastBlock
    );
    if (contractsNotEvaluatedInLastBlock.length > 0) {
      const contractsEvaluatedDirectly = await this.evaluateContractsDirectly(
        contractsNotEvaluatedInLastBlock,
        currentBlockHeight
      );
      result.push(...contractsEvaluatedDirectly);
    }

    // for contracts evaluated in previous block - load all transactions from the current block
    // and search for interactions for all the registered contracts evaluated in previous block
    this.logger.info("Evaluated in prev block:", contractsEvaluatedInLastBlock);
    if (contractsEvaluatedInLastBlock.length > 0) {
      const contractsEvaluatedFromLastBlock =
        await this.evaluateContractsFromLastBlock(
          contractsEvaluatedInLastBlock,
          currentBlockHeight
        );
      result.push(...contractsEvaluatedFromLastBlock);
    }

    return result;
  }

  private async evaluateContractsDirectly(
    contractsNotEvaluatedInLastBlock: string[],
    currentBlockHeight: number
  ): Promise<DataFetched<SwFetchResult>[]> {
    const contractsState = await Promise.allSettled(
      contractsNotEvaluatedInLastBlock.map(async (contractTxId) => {
        this.logger.info("Evaluating contract", contractTxId);
        try {
          const readStateResult = await this.smartweave
            .contract<any>(contractTxId)
            .readState(currentBlockHeight);
          return Promise.resolve({
            contractTxId: contractTxId,
            result: readStateResult,
          });
        } catch (e: unknown) {
          this.logger.error(e);
          return Promise.reject(e);
        }
      })
    );

    return this.mapContractsStatePromise(contractsState, currentBlockHeight);
  }

  private async evaluateContractsFromLastBlock(
    contractsEvaluatedInLastBlock: string[],
    currentBlockHeight: number
  ): Promise<DataFetched<SwFetchResult>[]> {
    const contractsTransactions = await this.blockSmartweaveInteractions.load(
      currentBlockHeight,
      contractsEvaluatedInLastBlock,
      false
    );

    const contractsWithTransactions = [...contractsTransactions.keys()];

    const contractsState = await Promise.allSettled(
      contractsWithTransactions.map(async (contractTxId: string) => {
        const interactions = contractsTransactions.get(contractTxId)!;

        // "inject" contract transactions into InteractionsLoader
        if (interactions.length > 0) {
          this.interactionsLoader.setTransactions(contractTxId, interactions);
        }

        try {
          const readStateResult = await this.smartweave
            .contract<any>(contractTxId)
            .readState(currentBlockHeight);
          return Promise.resolve({
            contractTxId: contractTxId,
            result: readStateResult,
          });
        } finally {
          this.interactionsLoader.resetTransactions(contractTxId);
        }
      })
    );

    // for contracts without interactions in this block
    // - just mark them as evaluated
    contractsEvaluatedInLastBlock.forEach((txId) => {
      if (!contractsWithTransactions.includes(txId)) {
        this.lastProcessedBlock.set(txId, currentBlockHeight);
      }
    });

    return this.mapContractsStatePromise(contractsState, currentBlockHeight);
  }

  private mapContractsStatePromise(
    contractsState: ContractStatePromiseResult[],
    currentBlockHeight: number
  ): DataFetched<SwFetchResult>[] {
    const result: DataFetched<SwFetchResult>[] = [];
    contractsState.forEach((r: ContractStatePromiseResult) => {
      if (r.status === "fulfilled") {
        result.push({
          symbol: r.value.contractTxId,
          value: { ...r.value.result, blockHeight: currentBlockHeight },
        });
        this.lastProcessedBlock.set(r.value.contractTxId, currentBlockHeight);
      } else {
        // hmm...what now?
      }
    });

    return result;
  }
}
