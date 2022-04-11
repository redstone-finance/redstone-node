import {
  RedstoneOraclesState,
  RedstoneOraclesInput,
  ListInputData,
  ListResult,
} from "../../types";

export const listNodes = (
  state: RedstoneOraclesState,
  input: RedstoneOraclesInput
): ListResult => {
  const data = input.data as ListInputData;
  let nodesArray = Object.keys(state.nodes);

  if (data?.startAfter) {
    nodesArray = nodesArray.slice(data.startAfter);
  }

  if (data?.limit) {
    nodesArray = nodesArray.slice(0, data.limit);
  }

  return { result: nodesArray };
};
