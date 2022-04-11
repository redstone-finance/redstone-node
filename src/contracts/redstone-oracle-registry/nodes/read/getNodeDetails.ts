import {
  NodesDataFeedsState,
  NodesDataFeedsInput,
  GetNodeDetailsInputData,
  GetNodesDetailsResult,
  ContractErrorType,
} from "../../types";

declare const ContractError: ContractErrorType;

export const getNodeDetails = (
  state: NodesDataFeedsState,
  input: NodesDataFeedsInput
): GetNodesDetailsResult => {
  const data = input.data as GetNodeDetailsInputData;
  if (!data?.address) {
    throw new ContractError("Missing node address");
  }

  const nodeAddress = data.address;
  const nodeDetails = state.nodes[nodeAddress];

  if (!nodeDetails) {
    throw new ContractError(`Node with address ${nodeAddress} does not exist`);
  }

  return { result: { ...nodeDetails, address: nodeAddress } };
};
