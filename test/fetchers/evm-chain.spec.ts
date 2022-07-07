import { Contract } from "ethers";
import { MockProvider } from "ethereum-waffle";
import { deployMockContract } from "@ethereum-waffle/mock-contract";
import { EvmChainFetcher } from "../../src/fetchers/evm-chain/EvmChainFetcher";

class MockEvmChainFetcher extends EvmChainFetcher {
  async fetchData() {
    return;
  }
}

describe("EVM chain fetcher", () => {
  let contract: Contract;
  let fetcher: EvmChainFetcher;

  beforeEach(async () => {
    const provider = new MockProvider();
    const [wallet] = provider.getWallets();
    contract = await deployMockContract(wallet, []);
    fetcher = new MockEvmChainFetcher(
      "test-evm-fetcher",
      provider.connection.url,
      async () => ({ test: 11 })
    );
  });

  test("Should properly fetch contract", async () => {
    const result = await fetcher.getContractInstance([], contract.address);
    expect(result.address).toEqual(contract.address);
  });
});
