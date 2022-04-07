import fetchers from "../../src/fetchers/index"
import { mockFetcherResponse } from "./_helpers";
import { TwapFetcher } from "../../src/fetchers/twap/TwapFetcher";

const pathToExampleResponse = "../../src/fetchers/twap/example-response.json";
const expectedTwapFetcherResult = [{
  symbol: "BTC-TWAP-60",
  value: 43292.29198643936,
}];
const defaultPriceValues = {
  symbol: "",
  timestamp: 0,
  value: 0,
  liteEvmSignature: "",
  version: "",
};
const samplePrices = [
  {
    ...defaultPriceValues,
    value: 2,
    timestamp: 0,
  },
  {
    ...defaultPriceValues,
    value: 4,
    timestamp: 20,
  },
  {
    ...defaultPriceValues,
    value: 12,
    timestamp: 100,
  },
];
const expectedTwapValueForSamplePrices = 7;

jest.mock("axios");

describe("twap fetcher", () => {
  const sut = fetchers["twap-I-5rWUehEv-MjdK9gFw09RxfSLQX9DIHxG614Wf8qo0"];

  it("should properly fetch data", async () => {
    // Given
    mockFetcherResponse(pathToExampleResponse);

    // When
    const result = await sut.fetchAll(["BTC-TWAP-60"]);

    // Then
    expect(result).toEqual(expectedTwapFetcherResult);
  });

  it("should properly calculate twap value", () => {
    // Given
    const prices = [...samplePrices];

    // When
    const twapValue = TwapFetcher.getTwapValue(prices);

    // Then
    expect(twapValue).toBe(expectedTwapValueForSamplePrices);
  });

  it("should properly calculate twap value for unsorted prices array", () => {
    // Given
    const prices = [samplePrices[1], samplePrices[0], samplePrices[2]];

    // When
    const twapValue = TwapFetcher.getTwapValue(prices);

    // Then
    expect(twapValue).toBe(expectedTwapValueForSamplePrices);
  });
});
