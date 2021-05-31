import axios from "axios";
import {Credentials} from "../../src/types";
import fetchers from "../../src/fetchers/index"
import {mockFetcherResponse} from "./_helpers";

jest.mock('axios');

describe("balancer fetcher", () => {
  const sut = fetchers["balancer"];

  beforeEach(() => {
    mockFetcherResponse("../../src/fetchers/balancer/example-response.json");
  })

  it('should throw if no covalent api key passed in options', async () => {
    await expect(sut.fetchAll([])).rejects.toThrowError();
    await expect(sut.fetchAll([], {credentials: {}})).rejects.toThrowError();
    await expect(sut.fetchAll([], {credentials: {infuraProjectId: ""}})).rejects.toThrowError();
  });

  it('should properly fetch data', async () => {
    //given
    const credentials: Credentials = {
      covalentApiKey: "someKey;"
    };

    //when
    const result = await sut.fetchAll(["BAL", "USDC", "WETH"], {credentials});

    //then
    expect(result).toEqual([
      {
        "symbol": "BAL",
        "value": 46.78163,
      },
      {
        "symbol": "WETH",
        "value": 1824.6058,
      },
      {
        "symbol": "USDC",
        "value": 1.0029249,
      },
    ]);

  });
});

