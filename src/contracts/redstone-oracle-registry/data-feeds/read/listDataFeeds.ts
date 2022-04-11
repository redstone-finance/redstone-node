import {
  RedstoneOraclesState,
  RedstoneOraclesInput,
  ListInputData,
  ListResult,
} from "../../types";

export const listDataFeeds = (
  state: RedstoneOraclesState,
  input: RedstoneOraclesInput
): ListResult => {
  const data = input.data as ListInputData;
  let dataFeedsArray = Object.keys(state.dataFeeds);

  if (data?.startAfter) {
    dataFeedsArray = dataFeedsArray.slice(data.startAfter);
  }

  if (data?.limit) {
    dataFeedsArray = dataFeedsArray.slice(0, data.limit);
  }

  return { result: dataFeedsArray };
};
