import { CcxtFetcher } from "./CcxtFetcher";

const allFetcherNames = [
  "aax",
  "aofex",
  "ascendex",
  "bibox",
];

const fetchersObj: { [name: string]: CcxtFetcher } = {};
for (const fetcherName of allFetcherNames) {
  fetchersObj[fetcherName] = new CcxtFetcher(fetcherName);
}

export default fetchersObj;
