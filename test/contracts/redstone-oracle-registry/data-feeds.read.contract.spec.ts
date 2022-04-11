import ArLocal from "arlocal";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import {
  Contract,
  LoggerFactory,
  SmartWeave,
  SmartWeaveNodeFactory,
} from "redstone-smartweave";
import fs from "fs";
import path from "path";
import {
  RedstoneOraclesInput,
  RedstoneOraclesState,
} from "../../../src/contracts/redstone-oracle-registry/types";
import { addFunds } from "../../../src/utils/addFunds";
import { mineBlock } from "../../../src/utils/mineBlock";
import { mockDataFeeds } from "./mocks/dataFeeds.mock";

describe("Data feeds contract - read", () => {
  let contractSrc: string;
  let wallet: JWKInterface;
  let walletAddress: string;
  let arweave: Arweave;
  let arlocal: ArLocal;
  let smartweave: SmartWeave;
  let initialState: RedstoneOraclesState;
  let contract: Contract<RedstoneOraclesState>;

  beforeAll(async () => {
    arlocal = new ArLocal(1822, false);
    await arlocal.start();

    arweave = Arweave.init({
      host: "localhost",
      port: 1822,
      protocol: "http",
      logging: false,
    });

    LoggerFactory.INST.logLevel("error");

    smartweave = SmartWeaveNodeFactory.memCached(arweave);
    wallet = await arweave.wallets.generate();
    await addFunds(arweave, wallet);
    walletAddress = await arweave.wallets.jwkToAddress(wallet);

    contractSrc = fs.readFileSync(
      path.join(__dirname, "../../../dist/contracts/redstone-oracle-registry.contract.js"),
      "utf8"
    );

    initialState = {
      canEvolve: true,
      contractAdmins: [walletAddress],
      nodes: {},
      dataFeeds: mockDataFeeds,
    };

    const contractTxId = await smartweave.createContract.deploy({
      wallet,
      initState: JSON.stringify(initialState),
      src: contractSrc,
    });

    contract = smartweave.contract(contractTxId);
    contract.connect(wallet);
    await mineBlock(arweave);
  });

  afterAll(async () => {
    await arlocal.stop();
  });

  describe("listDataFeeds", () => {
    test("list all data feeds", async () => {
      const { result } = await contract.dryWrite<RedstoneOraclesInput>({
        function: "listDataFeeds",
        data: {},
      });
      const expectedDataFeeds = [
        "testId1",
        "testId2",
        "testId3",
        "testId4",
        "testId5",
        "testId6",
      ];
      expect(result).toEqual(expectedDataFeeds);
    });

    test("list data feeds limited to 2", async () => {
      const { result } = await contract.dryWrite<RedstoneOraclesInput>({
        function: "listDataFeeds",
        data: {
          limit: 2,
        },
      });
      const expectedDataFeeds = ["testId1", "testId2"];
      expect(result).toEqual(expectedDataFeeds);
    });

    test("list data feeds after third", async () => {
      const { result } = await contract.dryWrite<RedstoneOraclesInput>({
        function: "listDataFeeds",
        data: {
          startAfter: 3,
        },
      });
      const expectedDataFeeds = ["testId4", "testId5", "testId6"];
      expect(result).toEqual(expectedDataFeeds);
    });

    test("list data feeds limited to 3 after second", async () => {
      const { result } = await contract.dryWrite<RedstoneOraclesInput>({
        function: "listDataFeeds",
        data: {
          limit: 3,
          startAfter: 2,
        },
      });
      const expectedDataFeeds = ["testId3", "testId4", "testId5"];
      expect(result).toEqual(expectedDataFeeds);
    });
  });

  describe("getDataFeedDetailsById", () => {
    test("get details of first data feed", async () => {
      const { result } = await contract.dryWrite<RedstoneOraclesInput>({
        function: "getDataFeedDetailsById",
        data: {
          id: "testId1",
        },
      });
      const expectedDataFeedDetails = {
        id: "testId1",
        name: "testName1",
        logo: "logo",
        description: "testDescription",
        manifestTxId: "testManifestId",
        admin: "testAddress",
      };
      expect(result).toEqual(expectedDataFeedDetails);
    });

    test("get details of middle data feed", async () => {
      const { result } = await contract.dryWrite<RedstoneOraclesInput>({
        function: "getDataFeedDetailsById",
        data: {
          id: "testId4",
        },
      });
      const expectedDataFeedDetails = {
        id: "testId4",
        name: "testName4",
        logo: "logo",
        description: "testDescription",
        manifestTxId: "testManifestId",
        admin: "testAddress",
      };
      expect(result).toEqual(expectedDataFeedDetails);
    });

    test("throw error if no id in input", async () => {
      const { errorMessage } = await contract.dryWrite<RedstoneOraclesInput>({
        function: "getDataFeedDetailsById",
        data: {},
      });
      expect(errorMessage).toBe("Missing data feed id");
    });

    test("throw error if invalid id in input", async () => {
      const { errorMessage } = await contract.dryWrite<RedstoneOraclesInput>({
        function: "getDataFeedDetailsById",
        data: {
          id: "invalidId",
        },
      });

      expect(errorMessage).toBe("Data feed with id invalidId does not exist");
    });
  });
});
