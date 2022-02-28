import fetchers from "../../src/fetchers/index"

jest.mock('../../src/fetchers/bitso/BitsoProxy', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getExchangeRates: () => {
        const exampleResponse = require("../../src/fetchers/bitso/example-response.json");
        return Promise.resolve({
          data: exampleResponse
        });
      }
    }
  });
});

describe("bitso fetcher", () => {
  const sut = fetchers["bitso"];

  it('should properly fetch data', async () => {
    //given

    //when
    const result = await sut.fetchAll(["ETH", "BTC", "MXNUSD=X"]);

    //then
    expect(result).toEqual([
      {
        "symbol": "ETH",
        "value": 2601.49,
      },
      {
        "symbol": "BTC",
        "value": 37688.51,
      },
      {
        "symbol": "MXNUSD=X",
        "value": 0.04856726566294318
      }
    ]);

  });
});


