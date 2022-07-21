import redstone from "redstone-api";
import { BigNumber, ethers, providers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { BaseFetcher } from "../BaseFetcher";
import { EvmMulticallService } from "./EvmMulticallService";
import { yieldYakContractDetails } from "./contracts-details/yield-yak";
import { MulticallParsedResponses, PricesObj } from "../../types";

const MUTLICALL_CONTRACT_ADDRESS = "0x8755b94F88D120AB2Cc13b1f6582329b067C760d";

export class AvalancheEvmFetcher extends BaseFetcher {
  private evmMulticallService: EvmMulticallService;

  constructor(
    provider: providers.Provider,
    multicallContractAddress: string = MUTLICALL_CONTRACT_ADDRESS
  ) {
    super("avalanche-evm-fetcher");
    this.evmMulticallService = new EvmMulticallService(
      provider,
      multicallContractAddress
    );
  }

  async fetchData() {
    const requests = this.prepareYieldYakMulticallRequests();
    return await this.evmMulticallService.performMulticall(requests);
  }

  prepareYieldYakMulticallRequests() {
    const { abi, address } = yieldYakContractDetails;
    const totalDepositsData = new Interface(abi).encodeFunctionData(
      "totalDeposits"
    );
    const totalSupplyData = new Interface(abi).encodeFunctionData(
      "totalSupply"
    );
    const requests = [
      {
        address,
        data: totalDepositsData,
        name: "totalDeposits",
      },
      {
        address,
        data: totalSupplyData,
        name: "totalSupply",
      },
    ];
    return requests;
  }

  async extractPrices(
    response: MulticallParsedResponses,
    ids: string[]
  ): Promise<PricesObj> {
    const pricesObject: PricesObj = {};
    for (const id of ids) {
      switch (id) {
        case "$YYAV3SA1": {
          const price = await this.extractPriceForYieldYak(response);
          pricesObject[id] = Number(price);
          break;
        }
        default:
          throw new Error("Invalid id for Avalanche EVM fetcher");
      }
    }
    return pricesObject;
  }

  async extractPriceForYieldYak(multicallResult: MulticallParsedResponses) {
    const totalDeposits = BigNumber.from(multicallResult.totalDeposits.value);
    const totalSupply = BigNumber.from(multicallResult.totalSupply.value);
    const tokenValue = totalDeposits
      .mul(ethers.utils.parseUnits("1.0", 8))
      .div(totalSupply);

    const avaxPrice = await this.fetchAvaxPrice();
    const yieldYakPrice = tokenValue
      .mul(avaxPrice)
      .div(ethers.utils.parseUnits("1.0", 8));

    return ethers.utils.formatEther(yieldYakPrice);
  }

  async fetchAvaxPrice() {
    const avaxPriceObjectFromApi = await redstone.getPrice("AVAX");
    const avaxPriceAsString = avaxPriceObjectFromApi.value.toString();
    return ethers.utils.parseUnits(avaxPriceAsString, 18);
  }
}
