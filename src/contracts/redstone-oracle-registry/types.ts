export interface RedstoneOraclesState {
  canEvolve: boolean;
  contractAdmins: string[];
  nodes: { [key in string]: Node };
  dataFeeds: { [key in string]: DataFeed };
}

interface Node {
  name: string;
  logo: string;
  description: string;
  dataFeedId: string;
  evmAddress: string;
  ipAddress: string;
  url?: string;
}

interface DataFeed {
  name: string;
  manifestTxId: string;
  logo: string;
  description: string;
  admin: string;
}

export interface RedstoneOraclesAction {
  input: RedstoneOraclesInput;
  caller: string;
}

export interface RedstoneOraclesInput {
  function:
    | "listNodes"
    | "getNodeDetails"
    | "registerNode"
    | "updateNodeDetails"
    | "removeNode"
    | "listDataFeeds"
    | "getDataFeedDetailsById"
    | "createDataFeed"
    | "updateDataFeed";
  data:
    | ListInputData
    | GetNodeDetailsInputData
    | RegisterNodeInputData
    | UpdateNodeDetailInputData
    | GetDataFeedDetailsByIdInputData
    | CreateDataFeedInputDate
    | UpdateDataFeedInputDate;
}

export interface ListInputData {
  limit?: number;
  startAfter?: number;
}

export interface GetNodeDetailsInputData {
  address: string;
}

export type RegisterNodeInputData = Node;

export type UpdateNodeDetailInputData = Partial<Node>;

export interface ListResult {
  result: string[];
}

export interface GetNodesDetailsResult {
  result: NodeWithAddress;
}

interface NodeWithAddress extends Node {
  address: string;
}

export type RedstoneOraclesContractResult =
  | ListResult
  | GetNodesDetailsResult
  | GetDataFeedDetailsByIdResult;

export interface GetDataFeedDetailsByIdInputData {
  id: string;
}

export interface CreateDataFeedInputDate extends Omit<DataFeed, "admin"> {
  id: string;
}

export interface UpdateDataFeedInputDate {
  id: string;
  update: Partial<DataFeed>;
}

export interface GetDataFeedDetailsByIdResult {
  result: DataFeedWithId;
}

interface DataFeedWithId extends DataFeed {
  id: string;
}

export type ContractErrorType = new (message: string) => any;