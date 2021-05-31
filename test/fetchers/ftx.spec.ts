import axios from "axios";
import fetchers from "../../src/fetchers/index"
import {mockFetcherResponse} from "./_helpers";

jest.mock('axios');

describe("ftx fetcher", () => {
  const sut = fetchers["ftx"];

  beforeEach(() => {
    mockFetcherResponse("../../src/fetchers/ftx/example-response.json");
  });

  it('should properly fetch data', async () => {
    //given

    //when
    const result = await sut.fetchAll(["USDT", "ETH", "DOGE", "UST"]);

    //then
    expect(result).toEqual([
        {
          "symbol": "USDT",
          "value": 1.0012
        },
        {
          "symbol": "ETH",
          "value": 2806.5
        },
        {
          "symbol": "DOGE",
          "value": 0.3450825
        }
    ]);

  });
});

