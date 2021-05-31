import axios from "axios";
import fetchers from "../../src/fetchers/index"
import {mockFetcherResponse, mockLimestoneApiPrice} from "./_helpers";

jest.mock('axios');

mockLimestoneApiPrice(1.002);

describe("binance fetcher", () => {
  const sut = fetchers["binance"];

  beforeEach(() => {
    mockFetcherResponse("../../src/fetchers/binance/example-response.json");
  });


  it('should properly fetch data', async () => {
    //given

    //when
    const result = await sut.fetchAll(["BAL", "USDC", "WETH"]);

    //then
    expect(result).toEqual([
      {
        "symbol": "BAL",
        "value": 31.821516,
      },
      {
        "symbol": "USDC",
        "value": 1.0002966,
      },
    ]);

  });
});

