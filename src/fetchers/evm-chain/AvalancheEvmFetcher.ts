import redstone from "redstone-api";
import { BigNumber, ethers, providers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { EvmChainFetcher } from "./EvmChainFetcher";
import { PricesObj } from "../../types";
import { yieldYakContractDetails } from "./contracts-details/yield-yak";

export class AvalancheEvmFetcher extends EvmChainFetcher {
  constructor(
    connection: providers.Provider,
    multicallContractAddress: string
  ) {
    super(
      "avalanche-evm-fetcher",
      connection,
      (_: any, ids: string[]) => this.extractPricesFromContract(_, ids),
      multicallContractAddress
    );
  }

  async fetchData() {
    return null;
  }

  validateResponse(): boolean {
    return true;
  }

  async extractPricesFromContract(_: any, ids: string[]): Promise<PricesObj> {
    const pricesObject: PricesObj = {};
    for (const id of ids) {
      switch (id) {
        case "$YYAV3SA1": {
          const price = await this.extractPriceForYieldYak();
          this.populatePricesObject(pricesObject, id, price);
          break;
        }
        default:
          throw new Error("Invalid id for Avalanche EVM fetcher");
      }
    }
    return pricesObject;
  }

  async populatePricesObject(
    pricesObject: PricesObj,
    id: string,
    price: string | number
  ) {
    const symbol = this.convertIdToSymbol(id);
    pricesObject[symbol] = Number(price);
    return pricesObject;
  }

  async extractPriceForYieldYak() {
    if (!this.multicallContractAddress) {
      throw new Error(
        `Invalid multicall contract address: ${this.multicallContractAddress}`
      );
    }

    const { requests, dataToNameMap } = this.prepareYieldYakMulticallData();
    const multicallResult = await this.performMulticall(
      requests,
      dataToNameMap
    );

    const totalDeposits = BigNumber.from(multicallResult.totalDeposits.value);
    const totalSupply = BigNumber.from(multicallResult.totalSupply.value);
    const tokenValue = totalDeposits
      .mul(ethers.utils.parseUnits("1.0", 8))
      .div(totalSupply);

    const priceFromApi = await redstone.getPrice("AVAX");
    const priceValue = priceFromApi.value.toString();
    const priceAsBigNumber = ethers.utils.parseUnits(priceValue, 18);
    const finalPrice = tokenValue
      .mul(priceAsBigNumber)
      .div(ethers.utils.parseUnits("1.0", 8));

    return ethers.utils.formatEther(finalPrice);
  }

  prepareYieldYakMulticallData() {
    const { abi, address } = yieldYakContractDetails;
    const totalDepositsData = new Interface(abi).encodeFunctionData(
      "totalDeposits"
    );
    const totalSupplyData = new Interface(abi).encodeFunctionData(
      "totalSupply"
    );
    const dataToNameMap = {
      [totalDepositsData]: "totalDeposits",
      [totalSupplyData]: "totalSupply",
    };
    const requests = [
      {
        address,
        data: totalDepositsData,
      },
      {
        address,
        data: totalSupplyData,
      },
    ];
    return { requests, dataToNameMap };
  }
}
