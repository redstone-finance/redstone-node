import axios from "axios";
import { Contract } from "ethers";
import { MockProvider, deployContract } from "ethereum-waffle";
import { AvalancheEvmFetcher } from "../../src/fetchers/evm-chain/AvalancheEvmFetcher";
import Multicall2 from "../../src/fetchers/evm-chain/contracts-details/common/Multicall2.json";
import YYMock from "./mocks/YYMock.json";
import { yieldYakContractDetails } from "../../src/fetchers/evm-chain/contracts-details/yield-yak";

jest.setTimeout(15000);

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Avalanche EVM fetcher", () => {
  let provider: MockProvider;
  let multicallContract: Contract;

  beforeAll(async () => {
    provider = new MockProvider();
    const [wallet] = provider.getWallets();
    const Yycontract = await deployContract(wallet, {
      bytecode: YYMock.bytecode,
      abi: YYMock.abi,
    });

    multicallContract = await deployContract(wallet, {
      bytecode: Multicall2.bytecode,
      abi: Multicall2.abi,
    });

    yieldYakContractDetails.abi = YYMock.abi;
    yieldYakContractDetails.address = Yycontract.address;
  });

  test("Should properly fetch data", async () => {
    const fetcher = new AvalancheEvmFetcher(
      provider,
      multicallContract.address
    );

    mockedAxios.get.mockResolvedValueOnce({
      data: [{ value: 16.942986798458783 }],
    });
    const result = await fetcher.fetchAll(["$YYAV3SA1"]);
    expect(result).toEqual([
      { symbol: "$YYAV3SA1", value: 17.227932764426185 },
    ]);
  });
});
