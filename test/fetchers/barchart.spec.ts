import fetchers from "../../src/fetchers/index"
import {mockFetcherResponse} from "./_helpers";
import {Credentials} from "../../src/types";

jest.mock('axios');

describe("barchart fetcher", () => {
  const sut = fetchers["barchart"];

  beforeEach(() => {
    mockFetcherResponse("../../src/fetchers/barchart/example-response.json");
  });

  it('should properly fetch data', async () => {
    //given
    const credentials: Credentials = { barchartApiKey: "someKey" };

    //when
    const result = await sut.fetchAll(
      ["AAPL", "IBM", "TSLA", "AMZN"],
      { credentials });

    //then
    expect(result).toEqual([
      {
        "symbol": "AAPL",
        "value": 126.74,
      },
      {
        "symbol": "IBM",
        "value": 149.07,
      },
      {
        "symbol": "TSLA",
        "value": 603.59,
      },
      {
        "symbol": "AMZN",
        "value": 3264.11,
      },
    ]);
  });
});
