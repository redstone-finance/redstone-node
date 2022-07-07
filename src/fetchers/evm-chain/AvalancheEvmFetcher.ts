import redstone from "redstone-api";
import { ethers } from "ethers";
import { PricesObj } from "../../types";
import { EvmChainFetcher } from "./EvmChainFetcher";
import { yieldYakContractDetails } from "./contracts-details/yield-yak";

export class AvalancheEvmFetcher extends EvmChainFetcher {
  constructor(connection: string) {
    super("avalanche-evm-fetcher", connection, (_: any, ids: string[]) =>
      this.extractPricesFromContract(_, ids)
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
    const { abi, address } = yieldYakContractDetails;
    const contract = await this.getContractInstance(abi, address);
    const totalDeposits = await contract.totalDeposits();
    const totalSupply = await contract.totalSupply();
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
}
