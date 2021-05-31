import axios from "axios";
import fetchers from "../../src/fetchers/index"
import {mockFetcherResponse, mockLimestoneApiPrice} from "./_helpers";

jest.mock("../../src/fetchers/yahoo-finance/YahooFinanceProxy", () => {
  return jest.fn().mockImplementation(() => {
    return {
      getExchangeRates: () => {
        const exampleResponse = require("../../src/fetchers/yahoo-finance/example-response.json");

        return Promise.resolve(exampleResponse);
      }
    }
  });
});

describe("yahoo-finance fetcher", () => {
  const sut = fetchers["yahoo-finance"];


  it('should properly fetch data', async () => {
    //given

    //when
    const result = await sut.fetchAll(["TSLA", "AMZN", "GOOG", "IBM", "AAPL"]);

    //then
    expect(result).toEqual([
      {
        "symbol": "TSLA",
        "value": 619.13
      },
      {
        "symbol": "AMZN",
        "value": 3265.16
      },
      {
        "symbol": "GOOG",
        "value": 2433.53
      },
      {
        "symbol": "IBM",
        "value": 143.38
      },
      {
        "symbol": "AAPL",
        "value": 126.85
      }
    ]);
  });
});
