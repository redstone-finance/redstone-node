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
    const result = await sut.fetchAll(["ETH", "BTC", "MXN", "ARS", "BRLUSD=X"]);

    //then
    expect(result).toEqual([
      {
        "symbol": "ETH",
        "value": 2686.6049809402,
      },
      {
        "symbol": "BTC",
        "value": 38232.5989964214,
      },
      {
        "symbol": "MXN",
        "value": 0.049057945228460416
      },
      {
        "symbol": "ARS",
        "value": 0.00489695698024985
      },
      {
        "symbol": "BRLUSD=X",
        "value": 0.19192569610248375
      },
    ]);

  });
});


