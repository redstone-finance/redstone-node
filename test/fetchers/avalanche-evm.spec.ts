import axios from "axios";
import { ethers, Contract, BigNumber } from "ethers";
import { MockProvider } from "ethereum-waffle";
import { deployMockContract } from "@ethereum-waffle/mock-contract";
import { AvalancheEvmFetcher } from "../../src/fetchers/evm-chain/AvalancheEvmFetcher";

jest.setTimeout(10000);

jest.spyOn(ethers, "Contract").mockReturnValue({
  totalDeposits: () => BigNumber.from("0xa8d1e1eef9e3ae3cdc98"),
  totalSupply: () => BigNumber.from("0xa6071196483bcebdeaf6"),
} as unknown as Contract);

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Avalanche EVM fetcher", () => {
  let provider: MockProvider;

  beforeAll(async () => {
    provider = new MockProvider();
    await provider.ready;
    const [wallet] = provider.getWallets();
    const contract = await deployMockContract(wallet, []);

    jest.mock(
      "../../src/fetchers/evm-chain/contracts-details/yield-yak/index.ts",
      () => ({
        address: contract.address,
        abi: [],
      })
    );
  });

  test("Should properly fetch data", async () => {
    const fetcher = new AvalancheEvmFetcher(provider.connection.url);

    mockedAxios.get.mockResolvedValueOnce({
      data: [{ value: 16.942986798458783 }],
    });
    const result = await fetcher.fetchAll(["$YYAV3SA1"]);
    expect(result).toEqual([
      { symbol: "$YYAV3SA1", value: 17.227932764426185 },
    ]);
  });
});
