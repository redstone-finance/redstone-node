import fetchers from "../../src/fetchers/index"
import {mockFetcherResponse} from "./_helpers";

jest.mock('axios');

describe("uniswap fetcher", () => {
  const sut = fetchers["uniswap"];

  beforeEach(() => {
    mockFetcherResponse("../../src/fetchers/uniswap/example-response.json");
  })

  it('should properly fetch data', async () => {
    //given

    //when
    const result = await sut.fetchAll(["CREAM", "SAND", "YFI", "KP3R", "XOR"]);

    //then
    expect(result).toEqual([
      {
        "symbol": "XOR",
        "value": 426.7112290136115
      },
      {
        "symbol": "YFI",
        "value": 48717.71993117326
      },
      {
        "symbol": "SAND",
        "value": 0.3511882127904635
      },
      {
        "symbol": "KP3R",
        "value": 158.30070859099666
      },
      {
        "symbol": "CREAM",
        "value": 122.61225384387008
      }
    ]);
  });
});
