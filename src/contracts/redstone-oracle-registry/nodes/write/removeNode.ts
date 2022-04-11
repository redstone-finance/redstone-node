import { ContractErrorType, NodesDataFeedsState } from "../../types";

declare const ContractError: ContractErrorType;

export const removeNode = (
  state: NodesDataFeedsState,
  caller: string
): { state: NodesDataFeedsState } => {
  const currentNodeState = state.nodes[caller];

  if (!currentNodeState) {
    throw new ContractError(`Node with owner ${caller} not found`);
  }

  delete state.nodes[caller];

  return { state };
};
