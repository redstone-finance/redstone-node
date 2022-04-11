import {
  RedstoneOraclesState,
  RedstoneOraclesAction,
  CreateDataFeedInputDate,
  ContractErrorType,
} from "../../types";

declare const ContractError: ContractErrorType;

export const createDataFeed = (
  state: RedstoneOraclesState,
  action: RedstoneOraclesAction
): { state: RedstoneOraclesState } => {
  const data = action.input.data as CreateDataFeedInputDate;

  const isValidData =
    data.id && data.name && data.logo && data.description && data.manifestTxId;

  if (!isValidData) {
    throw new ContractError("Invalid data feed data");
  }

  const { id, ...restData } = data;
  if (state.dataFeeds[id]) {
    throw new ContractError(`Data feed with id ${id} already exists`);
  }

  state.dataFeeds[id] = {
    ...restData,
    admin: action.caller,
  };

  return { state };
};
