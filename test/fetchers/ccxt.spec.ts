import fetchers from "../../src/fetchers/index";

jest.mock("redstone-api", () => {
  return {
    async getPrice(symbol: string) {
      if (symbol === "USDT") {
        return { value: 1 };
      } else {
        throw new Error(
          "Mock redstone-api can only beused to fetch USDT price");
      }
    }
  }
})

jest.mock("ccxt", () => {
  const mockExchanges: any = {};
  const allSupportedExchanges = require("../../src/fetchers/ccxt/all-supported-exchanges.json");
  for (const exchange of allSupportedExchanges) {
    mockExchanges[exchange] = jest.fn().mockImplementation(() => {
      return {
        has: { fetchTickers: true },
        async fetchTickers() {
          return require("../../src/fetchers/ccxt/example-response.json");
        }
      };
    });
  };

  return {
    __esModule: true,
    default: mockExchanges,
  };
});

describe("ccxt fetcher", () => {
  const sut = fetchers["aax"];

  it("should properly fetch data", async () => {
    // When
    const result = await sut.fetchAll(["BTC", "ETH"]);

    // Then
    expect(result).toEqual([
      { symbol: "BTC", value: 32228.4 },
      { symbol: "ETH", value: 2008.25 }
    ]);
  });
});
