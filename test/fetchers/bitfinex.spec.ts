import axios from "axios";
import fetchers from "../../src/fetchers/index"
import {mockFetcherResponse} from "./_helpers";

jest.mock('axios');

describe("bitfinex fetcher", () => {
  const sut = fetchers["bitfinex"];

  beforeEach(() => {
    mockFetcherResponse("../../src/fetchers/bitfinex/example-response.json");
  });

  it('should properly fetch data', async () => {
    //given

    //when
    const result = await sut.fetchAll(["USDT", "ETH", "DOGE", "UST"]);

    //then
    // TODO: no value for DOGE and USDT?
    expect(result).toEqual([
      {
        "symbol": "ETH",
        "value": 2615.68658095,
      },
      {
        "symbol": "UST",
        "value": 1.0012,
      },
    ]);

  });
});

