import { Contract } from "ethers";
import { Interface } from "ethers/lib/utils";
import { deployContract, MockProvider } from "ethereum-waffle";
import { EvmChainFetcher } from "../../src/fetchers/evm-chain/EvmChainFetcher";
import Multicall2 from "../../src/fetchers/evm-chain/contracts-details/common/Multicall2.json";

jest.setTimeout(10000);

class MockEvmChainFetcher extends EvmChainFetcher {
  async fetchData() {
    return;
  }
}

describe("EVM chain fetcher", () => {
  let fetcher: EvmChainFetcher;
  let multicallContract: Contract;

  beforeEach(async () => {
    const provider = new MockProvider();
    const [wallet] = provider.getWallets();
    multicallContract = await deployContract(wallet, {
      bytecode: Multicall2.bytecode,
      abi: Multicall2.abi,
    });
    fetcher = new MockEvmChainFetcher(
      "test-evm-fetcher",
      provider,
      async () => ({ test: 11 }),
      multicallContract.address
    );
  });

  test("Should properly fetch contract", async () => {
    const result = fetcher.getContractInstance(
      Multicall2.abi,
      multicallContract.address
    );
    expect(result.address).toEqual(multicallContract.address);
  });

  test("Should perform multcall", async () => {
    const blockNumberData = new Interface(Multicall2.abi).encodeFunctionData(
      "getBlockNumber"
    );
    const dataToNameMap = {
      [blockNumberData]: "getBlockNumber",
    };
    const requests = [
      {
        address: multicallContract.address,
        data: blockNumberData,
      },
    ];
    const result = await fetcher.performMulticall(requests, dataToNameMap);
    expect(result).toEqual({
      getBlockNumber: {
        success: true,
        value:
          "0x0000000000000000000000000000000000000000000000000000000000000001",
      },
    });
  });
});
