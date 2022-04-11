import {
  NodesDataFeedsState,
  NodesDataFeedsInput,
  ListInputData,
  ListResult,
} from "../../types";

export const listDataFeeds = (
  state: NodesDataFeedsState,
  input: NodesDataFeedsInput
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
