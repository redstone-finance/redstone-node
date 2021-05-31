import axios from "axios";
import fetchers from "../../src/fetchers/index"
import {mockFetcherResponse, mockLimestoneApiPrice} from "./_helpers";

jest.mock('axios');

mockLimestoneApiPrice(1.002);

describe("huobi fetcher", () => {
  const sut = fetchers["huobi"];

  beforeEach(() => {
    mockFetcherResponse("../../src/fetchers/huobi/example-response.json");
  });

  it('should properly fetch data', async () => {
    //given

    //when
    const result = await sut.fetchAll(["BTC", "ETH", "AR"]);

    //then
    expect(result).toEqual([
      {
        "symbol": "BTC",
        "value": 39941.31318
      },
      {
        "symbol": "ETH",
        "value": 2835.79026
      },
      {
        "symbol": "AR",
        "value": 16.444323
      }
    ]);

  });
});

