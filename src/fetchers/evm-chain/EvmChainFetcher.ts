import { Contract, ContractInterface, ethers, providers } from "ethers";
import { BaseFetcher } from "../BaseFetcher";
import Multicall2 from "./contracts-details/common/Multicall2.json";
import { PricesObj } from "../../types";

interface MulticallRequest {
  address: string;
  data: string;
}

type MulticallParsedResult = {
  [x in string]: { success: boolean; value: string };
};

export abstract class EvmChainFetcher extends BaseFetcher {
  provider: providers.Provider;
  extractPrices: (_: any, ids: string[]) => Promise<PricesObj>;
  multicallContractAddress: string;

  constructor(
    name: string,
    provider: providers.Provider,
    extractPrices: (_: any, ids: string[]) => Promise<PricesObj>,
    multicallContractAddress: string
  ) {
    super(name);
    this.provider = provider;
    this.extractPrices = extractPrices;
    this.multicallContractAddress = multicallContractAddress;
  }

  getContractInstance(
    abi: ContractInterface,
    contractAddress: string
  ): Contract {
    return new ethers.Contract(contractAddress, abi, this.provider);
  }

  async performMulticall(
    requests: MulticallRequest[],
    dataToNameMap: { [x: string]: string }
  ) {
    const multicallContract = this.getContractInstance(
      Multicall2.abi,
      this.multicallContractAddress
    );
    const results: [boolean, string][] =
      await multicallContract.callStatic.tryAggregate(
        false,
        requests.map(({ address, data }) => [address, data])
      );
    const parsedResult: MulticallParsedResult = {};
    for (let i = 0; i < requests.length; i++) {
      const { data } = requests[i];
      const [success, value] = results[i];
      parsedResult[dataToNameMap[data]] = { success, value };
    }
    return parsedResult;
  }
}
