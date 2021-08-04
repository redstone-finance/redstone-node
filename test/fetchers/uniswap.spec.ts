import fetchers from "../../src/fetchers/index"
import { mockFetcherResponse, mockFetcherResponseWithFunction } from "./_helpers";

const pathToExampleResponse = "../../src/fetchers/uniswap/example-response.json";
const expectedResult = [
  {
    "symbol": "CREAM",
    "value": 122.61225384387008
  },
  {
    "symbol": "SAND",
    "value": 0.3511882127904635
  },
  {
    "symbol": "YFI",
    "value": 48717.71993117326
  },
  {
    "symbol": "KP3R",
    "value": 158.30070859099666
  },
  {
    "symbol": "XOR",
    "value": 426.7112290136115
  },
];

jest.mock("axios");

describe("uniswap fetcher", () => {
  const sut = fetchers["uniswap"];

  it("should properly fetch data", async () => {
    // Given
    mockFetcherResponse(pathToExampleResponse);

    // When
    const result = await sut.fetchAll(["CREAM", "SAND", "YFI", "KP3R", "XOR"]);

    // Then
    expect(result).toEqual(expectedResult);
  });

  it ("should retry data fetching", async () => {
    // Given
    const exampleResponse = require(pathToExampleResponse);
    let tryCounter = 0;
    const getResponse = () => {
      tryCounter++;
      if (tryCounter > 1) {
        return exampleResponse;
      } else {
        return undefined;
      }
    }
    mockFetcherResponseWithFunction(getResponse);

    // When
    const result = await sut.fetchAll(["CREAM", "SAND", "YFI", "KP3R", "XOR"]);

    // Then
    expect(result).toEqual(expectedResult);
    expect(tryCounter).toEqual(2);
  });
});
