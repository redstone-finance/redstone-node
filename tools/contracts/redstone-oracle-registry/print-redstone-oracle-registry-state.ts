import util from "util";
import { getContract } from "./arweave-utils";
import contracts from "../../../src/config/contracts.json";

const oracleRegistryContractId = contracts["oracle-registry"];

export const printRedstoneOracleRegistryState = async () => {
  const contract = getContract(oracleRegistryContractId);
  const { state } = await contract.readState();
  console.log(util.inspect(state, { depth: null, colors: true }));
};
