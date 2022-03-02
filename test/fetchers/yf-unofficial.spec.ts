import fetchers from "../../src/fetchers/index";

jest.mock("../../src/fetchers/yf-unofficial/YahooFinanceProxy", () => {
  return jest.fn().mockImplementation(() => {
    return {
      getExchangeRates: () => {
        const exampleResponse = require("../../src/fetchers/yf-unofficial/example-response.json");

        return Promise.resolve(exampleResponse);
      }
    }
  });
});

describe("yf-unofficial fetcher", () => {
  const sut = fetchers["yf-unofficial"];


  it('should properly fetch data', async () => {
    // Given

    // When
    const result = await sut.fetchAll(["TSLA", "AMZN", "GOOG", "IBM", "AAPL", "MXN", "BRLUSD=X"]);

    // Then
    expect(result).toEqual([
      {
        "symbol": "TSLA",
        "value": 870.43
      },
      {
        "symbol": "AMZN",
        "value": 3071.26
      },
      {
        "symbol": "GOOG",
        "value": 2697.82
      },
      {
        "symbol": "IBM",
        "value": 122.51
      },
      {
        "symbol": "AAPL",
        "value": 165.12
      },
      {
        "symbol": "MXN",
        "value": 0.048896886
      },
      {
        "symbol": "BRLUSD=X",
        "value": 0.1937121
      }
    ]);
  });
});
