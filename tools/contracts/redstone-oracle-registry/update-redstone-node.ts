import prompts from "prompts";
import { getOracleRegistryContract } from "./arweave-utils";
import { RedstoneOraclesInput } from "../../../src/contracts/redstone-oracle-registry/types";

export const updateRedstoneNode = async () => {
  const response = await prompts([
    {
      type: "text",
      name: "name",
      message: "Provide name of redstone node",
    },
    {
      type: "text",
      name: "logo",
      message: "Provide logo URL of redstone node",
    },
    {
      type: "text",
      name: "description",
      message: "Provide description of redstone node",
    },
    {
      type: "text",
      name: "dataFeedId",
      message: "Provide data feed id of redstone node",
    },
    {
      type: "text",
      name: "evmAddress",
      message: "Provide EVM address of redstone node",
    },
    {
      type: "text",
      name: "ipAddress",
      message: "Provide IP address of redstone node",
    },
    {
      type: "text",
      name: "url",
      message: "Provide URL of redstone node",
    },
    {
      type: "text",
      name: "walletFilePath",
      message: "Provide absolute path to wallet file",
      validate: value => !value ? "Wallet file is required" : true
    }
  ]);

  const contract = getOracleRegistryContract(response.walletFilePath);

  const { name, logo, description, dataFeedId, evmAddress, ipAddress, url } = response;
  const nodeDetails = { 
    ...(!!name && { name }),
    ...(!!logo && { logo }),
    ...(!!description && { description }),
    ...(!!dataFeedId && { dataFeedId }),
    ...(!!evmAddress && { evmAddress }),
    ...(!!ipAddress && { ipAddress }),
    ...(!!url && { url })
  };
  const updateNodeTransactionId = await contract.writeInteraction<RedstoneOraclesInput>({
    function: "updateNodeDetails",
    data: nodeDetails
  });
  console.log(`Update redstone node transaction id: ${updateNodeTransactionId}`);
};
