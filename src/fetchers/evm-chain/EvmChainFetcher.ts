import { Contract, ContractInterface, ethers } from "ethers";
import { PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";

export abstract class EvmChainFetcher extends BaseFetcher {
  connection: string;
  extractPrices: (_: any, ids: string[]) => Promise<PricesObj>;

  constructor(
    name: string,
    connection: string,
    extractPrices: (_: any, ids: string[]) => Promise<PricesObj>
  ) {
    super(name);
    this.connection = connection;
    this.extractPrices = extractPrices;
  }

  async getContractInstance(
    abi: ContractInterface,
    contractAddress: string
  ): Promise<Contract> {
    const provider = new ethers.providers.JsonRpcProvider(this.connection);
    return new ethers.Contract(contractAddress, abi, provider);
  }
}
