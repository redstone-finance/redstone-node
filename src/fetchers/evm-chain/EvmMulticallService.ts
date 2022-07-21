import { ethers, providers } from "ethers";
import { MulticallRequest, MulticallParsedResponses } from "../../types";
import Multicall2 from "./contracts-details/common/Multicall2.json";

export class EvmMulticallService {
  constructor(
    private provider: providers.Provider,
    private multicallContractAddress: string
  ) {}

  async performMulticall(requests: MulticallRequest[]) {
    const multicallContract = new ethers.Contract(
      this.multicallContractAddress,
      Multicall2.abi,
      this.provider
    );
    const responses: [boolean, string][] =
      await multicallContract.callStatic.tryAggregate(
        false,
        requests.map(({ address, data }) => [address, data])
      );
    const parsedResponses: MulticallParsedResponses = {};
    for (let i = 0; i < requests.length; i++) {
      const { name } = requests[i];
      const [success, value] = responses[i];
      parsedResponses[name] = { success, value };
    }
    return parsedResponses;
  }
}
