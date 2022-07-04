import redstone from "redstone-api";
import { Contract, ethers } from "ethers";
import { PricesObj } from "../../types";
import { EvmChainFetcher } from "./EvmChainFetcher";

export class AvalancheYYFetcher extends EvmChainFetcher {
  symbol: string;

  constructor(
    abiUrl: string,
    connection: string | ethers.utils.ConnectionInfo,
    contractAddress: string,
    symbol: string
  ) {
    super(
      `avalanche-yy-${symbol}`,
      abiUrl,
      connection,
      contractAddress,
      (contract: any) => this.extractPricesFromContract(contract)
    );
    this.symbol = symbol;
  }

  override convertIdToSymbol(): string {
    return this.symbol;
  }

  override convertSymbolToId(): string {
    return this.symbol;
  }

  async extractPricesFromContract(contract: Contract): Promise<PricesObj> {
    const pricesObject: { [id: string]: number } = {};
    const totalDeposits = await contract.totalDeposits();
    const totalSupply = await contract.totalSupply();
    const tokenValue = totalDeposits
      .mul(ethers.utils.parseUnits("1.0"))
      .div(totalSupply);
    const priceFromApi = await redstone.getPrice("WAVAX");
    const priceValue = priceFromApi.value.toString();
    const priceAsBigNumber = ethers.utils.parseUnits(priceValue, 18);
    const finalPrice = tokenValue
      .mul(priceAsBigNumber)
      .div(ethers.utils.parseUnits("1.0"));

    const finalPriceAsNumber = ethers.utils.formatEther(finalPrice);
    pricesObject[this.symbol] = Number(finalPriceAsNumber);
    return pricesObject;
  }
}
