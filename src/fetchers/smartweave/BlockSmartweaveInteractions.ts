import {
  Benchmark,
  GQLEdgeInterface,
  GQLResultInterface,
  GQLTransactionsResultInterface,
  LoggerFactory,
  sleep,
  SmartWeaveTags,
} from "redstone-smartweave";
import Arweave from "arweave/node";

const MAX_REQUEST = 100;

interface TagFilter {
  name: string;
  values: string[];
}

interface BlockFilter {
  min?: number;
  max: number;
}

interface ReqVariables {
  tags: TagFilter[];
  blockFilter: BlockFilter;
  first: number;
  after?: string;
}

// FIXME: that's somewhat c/p from the contracts SDK.
export class BlockSmartweaveInteractions {
  private readonly logger = LoggerFactory.INST.create(
    "BlockSmartweaveInteractions"
  );

  private readonly arweave: Arweave;

  constructor(arweave: Arweave) {
    this.arweave = arweave;
  }

  private static readonly _30seconds = 30 * 1000;

  private static readonly query = `query Transactions($tags: [TagFilter!]!, $blockFilter: BlockFilter!, $first: Int!, $after: String) {
    transactions(tags: $tags, block: $blockFilter, first: $first, sort: HEIGHT_ASC, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          id
          owner { address }
          recipient
          tags {
            name
            value
          }
          block {
            height
            id
            timestamp
          }
          fee { winston }
          quantity { winston }
          parent { id }
        }
        cursor
      }
    }
  }`;

  async load(
    blockHeight: number,
    contractsTxId: string[],
    internalWrites: boolean
  ): Promise<GQLEdgeInterface[]> {
    const contracts = contractsTxId.join(",");

    const mainTransactionsVariables: ReqVariables = {
      tags: [
        {
          name: SmartWeaveTags.APP_NAME,
          values: ["SmartWeaveAction"],
        },
        {
          name: SmartWeaveTags.CONTRACT_TX_ID,
          values: [contracts],
        },
      ],
      blockFilter: {
        min: blockHeight,
        max: blockHeight,
      },
      first: MAX_REQUEST,
    };

    let interactions = await this.loadPages(mainTransactionsVariables);

    if (internalWrites) {
      const innerWritesVariables: ReqVariables = {
        tags: [
          {
            name: SmartWeaveTags.INTERACT_WRITE,
            values: [contracts],
          },
        ],
        blockFilter: {
          min: blockHeight,
          max: blockHeight,
        },
        first: MAX_REQUEST,
      };
      const innerWritesInteractions = await this.loadPages(
        innerWritesVariables
      );
      interactions = interactions.concat(innerWritesInteractions);
    }

    return interactions;
  }

  private async loadPages(variables: ReqVariables) {
    let transactions = await this.getNextPage(variables);

    const txInfos: GQLEdgeInterface[] = transactions.edges.filter(
      (tx) => !tx.node.parent || !tx.node.parent.id
    );

    while (transactions.pageInfo.hasNextPage) {
      const cursor = transactions.edges[MAX_REQUEST - 1].cursor;

      variables = {
        ...variables,
        after: cursor,
      };

      transactions = await this.getNextPage(variables);

      txInfos.push(
        ...transactions.edges.filter(
          (tx) => !tx.node.parent || !tx.node.parent.id
        )
      );
    }
    return txInfos;
  }

  private async getNextPage(
    variables: ReqVariables
  ): Promise<GQLTransactionsResultInterface> {
    const benchmark = Benchmark.measure();
    let response = await this.arweave.api.post("graphql", {
      query: BlockSmartweaveInteractions.query,
      variables,
    });
    this.logger.debug("GQL page load:", benchmark.elapsed());

    while (response.status === 403) {
      this.logger.warn(
        `GQL rate limiting, waiting ${BlockSmartweaveInteractions._30seconds}ms before next try.`
      );

      await sleep(BlockSmartweaveInteractions._30seconds);

      response = await this.arweave.api.post("graphql", {
        query: BlockSmartweaveInteractions.query,
        variables,
      });
    }

    if (response.status !== 200) {
      throw new Error(
        `Unable to retrieve transactions. Arweave gateway responded with status ${response.status}.`
      );
    }

    if (response.data.errors) {
      this.logger.error(response.data.errors);
      throw new Error("Error while loading interaction transactions");
    }

    const data: GQLResultInterface = response.data;

    const txs = data.data.transactions;

    return txs;
  }
}
