import axios from "axios";
import { Contract } from "ethers";
import { MockProvider } from "ethereum-waffle";
import { deployMockContract } from "@ethereum-waffle/mock-contract";
import { EvmChainFetcher } from "../../src/fetchers/evm-chain/EvmChainFetcher";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.setTimeout(10000);

describe("EVM chain fetcher", () => {
  let contract: Contract;
  let fetcher: EvmChainFetcher;

  beforeEach(async () => {
    const provider = new MockProvider();
    const [wallet] = provider.getWallets();
    contract = await deployMockContract(wallet, []);

    fetcher = new EvmChainFetcher(
      "test-evm-fetcher",
      "http://abiTest.com",
      provider.connection,
      contract.address,
      async (contract) => ({ test: contract.address })
    );
  });

  afterEach(() => {
    mockedAxios.get.mockClear();
  });

  it("Should properly fetch contract", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { result: [] } });
    const result = await fetcher.fetchData();
    expect(result.address).toEqual(contract.address);
  });

  it("Should properly fetch data", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { result: [] } });
    const result = await fetcher.fetchAll(["test"]);
    expect(result).toEqual([
      { symbol: "test", value: "0xA193E42526F1FEA8C99AF609dcEabf30C1c29fAA" },
    ]);
  });

  it("Should throw error if cannot fetch abi", async () => {
    mockedAxios.get.mockRejectedValueOnce("Invalid abi URL");
    await expect(fetcher.fetchData()).rejects.toThrowError(
      "Cannot fetch contract ABI: Invalid abi URL"
    );
  });
});
