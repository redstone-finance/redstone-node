import {
  RedstoneOraclesState,
  RedstoneOraclesInput,
  GetDataFeedDetailsByIdInputData,
  GetDataFeedDetailsByIdResult,
  ContractErrorType,
} from "../../types";

declare const ContractError: ContractErrorType;

export const getDataFeedDetailsById = (
  state: RedstoneOraclesState,
  input: RedstoneOraclesInput
): GetDataFeedDetailsByIdResult => {
  const data = input.data as GetDataFeedDetailsByIdInputData;
  if (!data?.id) {
    throw new ContractError("Missing data feed id");
  }

  const id = data.id;
  const dataFeedDetails = state.dataFeeds[id];

  if (!dataFeedDetails) {
    throw new ContractError(`Data feed with id ${id} does not exist`);
  }

  return { result: { ...dataFeedDetails, id: id } };
};
