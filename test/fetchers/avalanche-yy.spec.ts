import axios from "axios";
import { ethers, Contract, BigNumber } from "ethers";
import { MockProvider } from "ethereum-waffle";
import { deployMockContract } from "@ethereum-waffle/mock-contract";
import { AvalancheYYFetcher } from "../../src/fetchers/evm-chain/AvalancheYYFetcher";

jest.spyOn(ethers, "Contract").mockReturnValue({
  totalDeposits: () => BigNumber.from("0xa8d1e1eef9e3ae3cdc98"),
  totalSupply: () => BigNumber.from("0xa6071196483bcebdeaf6"),
} as unknown as Contract);

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Avalanche YY fetcher", () => {
  it("Should properly fetch data", async () => {
    const provider = new MockProvider();
    const [wallet] = provider.getWallets();
    const contract = await deployMockContract(wallet, []);

    const fetcher = new AvalancheYYFetcher(
      "http://abiTest.com",
      provider.connection,
      contract.address,
      "testSymbol"
    );

    mockedAxios.get.mockResolvedValueOnce({ data: { result: [] } });
    mockedAxios.get.mockResolvedValueOnce({
      data: [{ value: 16.942986798458783 }],
    });
    const result = await fetcher.fetchAll(["testSymbol"]);
    expect(result).toEqual([
      { symbol: "testSymbol", value: 17.22793285180235 },
    ]);
  });
});
