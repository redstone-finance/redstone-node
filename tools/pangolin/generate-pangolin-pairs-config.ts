import fs from "fs";
import graphProxy from "../../src/utils/graph-proxy";

const OUTPUT_FILE = "./src/fetchers/pangolin/pangolin-pairs.json";
const MIN_RESERVE_USD = 1;

main();

async function main() {
  // Fetching data
  const pairs = await getPairs();

  // Filtering
  const filteredPairs = pairs.filter(p => Number(p.reserveUSD) > MIN_RESERVE_USD);

  // Saving data to config file
  const path = OUTPUT_FILE;
  console.log(`Saving pairs config to ${path}`);
  fs.writeFileSync(path, JSON.stringify(filteredPairs, null, 2) + "\n");
}

// TODO: update to load all the pairs
async function getPairs(): Promise<any[]> {
  const url = "https://api.thegraph.com/subgraphs/name/dasconnor/pangolin-dex";
  const query = `{
    pairs(first: 1000, orderBy: reserveUSD, orderDirection: desc) {
      id
      token0 {
        symbol
        name
      }
      token1 {
        symbol
        name
      }
      reserve0
      reserve1
      reserveUSD
      txCount
      totalSupply
      token0Price
      token1Price
      liquidityProviderCount
      volumeUSD
    }
  }`;

  let response;
  try {
    response = await graphProxy.executeQuery(url, query);
  } catch (e) {
    console.log("Error occured", e);
    throw "stop";
  }

  return response.data.pairs;
}
