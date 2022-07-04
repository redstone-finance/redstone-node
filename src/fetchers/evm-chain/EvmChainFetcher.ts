import axios from "axios";
import { ethers } from "ethers";
import { PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";

export class EvmChainFetcher extends BaseFetcher {
  abiUrl: string;
  connection: string | ethers.utils.ConnectionInfo;
  contractAddress: string;
  extractPrices: (contract: any) => Promise<PricesObj>;

  constructor(
    name: string,
    abiUrl: string,
    connection: string | ethers.utils.ConnectionInfo,
    contractAddress: string,
    extractPrices: (contract: any) => Promise<PricesObj>
  ) {
    super(name);
    this.abiUrl = abiUrl;
    this.connection = connection;
    this.contractAddress = contractAddress;
    this.extractPrices = extractPrices;
  }

  async fetchData(): Promise<any> {
    let abi;
    try {
      const abiResponse = await axios.get(this.abiUrl);
      abi = abiResponse.data.result;
    } catch (error) {
      throw Error(`Cannot fetch contract ABI: ${error}`);
    }
    const provider = new ethers.providers.JsonRpcProvider(this.connection);
    return new ethers.Contract(this.contractAddress, abi, provider);
  }
}
