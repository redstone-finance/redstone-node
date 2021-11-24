import fs from "fs";

import ArLocal from "arlocal";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import path from "path";
import {
  Contract,
  LoggerFactory,
  SmartWeave,
  SmartWeaveNodeFactory,
} from "redstone-smartweave";
import {
  SmartWeaveFetcher,
  SwFetchResult,
} from "../../src/fetchers/smartweave/SmartWeaveFetcher";
import { Fetcher } from "../../src/types";
import { TsLogFactory } from "redstone-smartweave/lib/cjs/logging/node/TsLogFactory";
import { any } from 'jest-mock-extended';

interface ExampleContractState {
  counter: number;
}

describe("Testing the SmartWeave fetcher", () => {
  let wallet: JWKInterface;

  let arweave: Arweave;
  let arlocal: ArLocal;
  let smartweave: SmartWeave;
  let contract1: Contract<ExampleContractState>;
  let contract2: Contract<ExampleContractState>;

  let fetcher: Fetcher<SwFetchResult>;

  let contracts: string[];

  beforeAll(async () => {
    // note: each tests suit (i.e. file with tests that Jest is running concurrently
    // with another files has to have ArLocal set to a different port!)
    arlocal = new ArLocal(1810, false);
    await arlocal.start();

    arweave = Arweave.init({
      host: "localhost",
      port: 1810,
      protocol: "http",
    });

    wallet = await arweave.wallets.generate();

    LoggerFactory.use(new TsLogFactory());
    LoggerFactory.INST.logLevel("error");
    LoggerFactory.INST.logLevel("info", "SmartWeaveFetcher");

    const contractSrc = fs.readFileSync(
      path.join(__dirname, "data/example-contract.js"),
      "utf8"
    );

    smartweave = SmartWeaveNodeFactory.memCached(arweave);

    const contractTxId1 = await smartweave.createContract.deploy({
      wallet,
      initState: '{"counter": 1}',
      src: contractSrc,
    });

    const contractTxId2 = await smartweave.createContract.deploy({
      wallet,
      initState: '{"counter": 1}',
      src: contractSrc,
    });

    contract1 = smartweave
      .contract<ExampleContractState>(contractTxId1)
      .connect(wallet);
    contract2 = smartweave
      .contract<ExampleContractState>(contractTxId2)
      .connect(wallet);

    contracts = [contractTxId1, contractTxId2];

    fetcher = await SmartWeaveFetcher.init(contracts, arweave);

    await mine();

    jest.setTimeout(60000);
  });

  afterAll(async () => {
    await arlocal.stop();
  });

  it("should properly deploy contract with initial state", async () => {
    expect((await contract1.readState()).state.counter).toEqual(1);
    expect((await contract2.readState()).state.counter).toEqual(1);
  });

  it("should properly add new interactions", async () => {
    await contract1.writeInteraction({ function: "add" });
    await contract2.writeInteraction({ function: "add" });
    await mine();

    expect((await contract1.readState()).state.counter).toEqual(2);
    expect((await contract2.readState()).state.counter).toEqual(2);
  });

  describe("fetcher", () => {
    it("should fetch contracts state when state was not evaluated for previous block", async () => {
      const result = await fetcher.fetchAll(contracts);

      const state1 = await contract1.readState();
      const state2 = await contract2.readState();

      expect(result).toEqual([
        {
          symbol: contract1.txId(),
          value: {
            state: state1.state,
            validity: state1.validity,
            transactionId: undefined,
            blockId: undefined,
            blockHeight: 2,
          },
        },
        {
          symbol: contract2.txId(),
          value: {
            state: state2.state,
            validity: state2.validity,
            transactionId: undefined,
            blockId: undefined,
            blockHeight: 2,
          },
        },
      ]);
    });

    it("should fetch contracts state when state was evaluated in previous block", async () => {
      await contract1.writeInteraction({ function: "add" });
      await contract2.writeInteraction({ function: "add" });
      await mine();

      const result = await fetcher.fetchAll(contracts);

      const state1 = await contract1.readState();
      const state2 = await contract2.readState();

      expect(result).toEqual([
        {
          symbol: contract1.txId(),
          value: {
            state: state1.state,
            validity: state1.validity,
            transactionId: undefined,
            blockId: undefined,
            blockHeight: 3,
          },
        },
        {
          symbol: contract2.txId(),
          value: {
            state: state2.state,
            validity: state2.validity,
            transactionId: undefined,
            blockId: undefined,
            blockHeight: 3,
          },
        },
      ]);
    });

    it("should fetch contracts state when state was evaluated in previous block for one of the contracts", async () => {
      await contract1.writeInteraction({ function: "add" });
      await contract1.writeInteraction({ function: "add" });
      await mine();

      await contract2.writeInteraction({ function: "add" });
      await contract2.writeInteraction({ function: "add" });
      await contract2.writeInteraction({ function: "add" });
      await mine();

      const result = await fetcher.fetchAll(contracts);

      const state1 = await contract1.readState();
      const state2 = await contract2.readState();

      expect(result).toEqual([
        {
          symbol: contract1.txId(),
          value: {
            state: state1.state,
            validity: state1.validity,
            transactionId: undefined,
            blockId: undefined,
            blockHeight: 5,
          },
        },
        {
          symbol: contract2.txId(),
          value: {
            state: state2.state,
            validity: state2.validity,
            transactionId: undefined,
            blockId: undefined,
            blockHeight: 5,
          },
        },
      ]);
    });

    it("should return only contracts for which state have changed since last fetch (1)", async () => {
      await contract2.writeInteraction({ function: "add" });
      await contract2.writeInteraction({ function: "add" });
      await mine();

      const result = await fetcher.fetchAll(contracts);

      const state2 = await contract2.readState();

      expect(result).toEqual([
        {
          symbol: contract2.txId(),
          value: {
            state: state2.state,
            validity: state2.validity,
            transactionId: undefined,
            blockId: undefined,
            blockHeight: 6,
          },
        },
      ]);
    });

    it("should return only contracts for which state have changed since last fetch (2)", async () => {
      await contract1.writeInteraction({ function: "add" });
      await contract1.writeInteraction({ function: "add" });
      await contract1.writeInteraction({ function: "add" });
      await contract1.writeInteraction({ function: "add" });
      await mine();

      const result = await fetcher.fetchAll(contracts);

      const state1 = await contract1.readState();

      expect(result).toEqual([
        {
          symbol: contract1.txId(),
          value: {
            state: state1.state,
            validity: state1.validity,
            transactionId: undefined,
            blockId: undefined,
            blockHeight: 7,
          },
        },
      ]);
    });

    it("should return only contracts for which state have changed since last fetch (3)", async () => {
      await mine();

      const result = await fetcher.fetchAll(contracts);

      expect(result).toEqual([]);
    });

    it("should return contracts with more than one block difference since last fetch", async () => {
      await mine();
      await mine();

      const result = await fetcher.fetchAll(contracts);

      const state1 = await contract1.readState();
      const state2 = await contract2.readState();

      expect(result).toEqual([
        {
          symbol: contract1.txId(),
          value: {
            state: state1.state,
            validity: state1.validity,
            transactionId: any(),
            blockId: any(),
            blockHeight: 10,
          },
        },
        {
          symbol: contract2.txId(),
          value: {
            state: state2.state,
            validity: state2.validity,
            transactionId: any(),
            blockId: any(),
            blockHeight: 10,
          },
        },
      ]);
    });
  });

  async function mine() {
    await arweave.api.get("mine");
  }
});
