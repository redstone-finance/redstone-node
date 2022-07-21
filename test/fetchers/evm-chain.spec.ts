import { Contract } from "ethers";
import { Interface } from "ethers/lib/utils";
import { deployContract, MockProvider } from "ethereum-waffle";
import { EvmMulticallService } from "../../src/fetchers/evm-chain/EvmMulticallService";
import Multicall2 from "../../src/fetchers/evm-chain/contracts-details/common/Multicall2.json";

jest.setTimeout(10000);

describe("EVM chain multicall service", () => {
  let multicallService: EvmMulticallService;
  let multicallContract: Contract;

  beforeEach(async () => {
    const provider = new MockProvider();
    const [wallet] = provider.getWallets();
    multicallContract = await deployContract(wallet, {
      bytecode: Multicall2.bytecode,
      abi: Multicall2.abi,
    });
    multicallService = new EvmMulticallService(
      provider,
      multicallContract.address
    );
  });

  test("Should perform multcall", async () => {
    const blockNumberData = new Interface(Multicall2.abi).encodeFunctionData(
      "getBlockNumber"
    );
    const requests = [
      {
        address: multicallContract.address,
        data: blockNumberData,
        name: "getBlockNumber",
      },
    ];
    const result = await multicallService.performMulticall(requests);
    expect(result).toEqual({
      getBlockNumber: {
        success: true,
        value:
          "0x0000000000000000000000000000000000000000000000000000000000000001",
      },
    });
  });
});
