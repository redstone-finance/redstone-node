import { listNodes } from "./nodes/read/listNodes";
import { getNodeDetails } from "./nodes/read/getNodeDetails";
import {
  ContractErrorType,
  NodesDataFeedsAction,
  NodesDataFeedsContractResult,
  NodesDataFeedsState,
} from "./types";
import { registerNode } from "./nodes/write/registerNode";
import { updateNodeDetails } from "./nodes/write/updateNodeDetails";
import { removeNode } from "./nodes/write/removeNode";
import { listDataFeeds } from "./data-feeds/read/listDataFeeds";
import { getDataFeedDetailsById } from "./data-feeds/read/getDataFeedDetailsById";
import { createDataFeed } from "./data-feeds/write/createDataFeed";
import { updateDataFeed } from "./data-feeds/write/updateDataFeed";

declare const ContractError: ContractErrorType;

type ContractResult =
  | { state: NodesDataFeedsState }
  | NodesDataFeedsContractResult;

export const handle = async (
  state: NodesDataFeedsState,
  action: NodesDataFeedsAction
): Promise<ContractResult> => {
  const { input } = action;

  switch (input.function) {
    case "listNodes":
      return listNodes(state, input);
    case "getNodeDetails":
      return getNodeDetails(state, input);
    case "registerNode":
      return registerNode(state, action);
    case "updateNodeDetails":
      return updateNodeDetails(state, action);
    case "removeNode":
      return removeNode(state, action.caller);
    case "listDataFeeds":
      return listDataFeeds(state, input);
    case "getDataFeedDetailsById":
      return getDataFeedDetailsById(state, input);
    case "createDataFeed":
      return createDataFeed(state, action);
    case "updateDataFeed":
      return updateDataFeed(state, action);
    default:
      throw new ContractError(
        `No function supplied or function not recognized: "${input.function}"`
      );
  }
};
