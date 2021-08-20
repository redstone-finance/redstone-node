import fetchers from "../../src/fetchers/index"
import { mockFetcherResponse, mockFetcherResponseWithFunction } from "./_helpers";

const pathToExampleResponse = "../../src/fetchers/pangolin/example-response.json";
const expectedResult = [
  {
    "symbol": "PNG",
    "value": 1.961300404160255
  },
  {
    "symbol": "WAVAX",
    "value": 31.57420037328621
  },
  {
    "symbol": "WETH.e",
    "value": 2924.895751318377
  },
  {
    "symbol": "WBTC.e",
    "value": 42841.82368580627
  },
  {
    "symbol": "LINK.e",
    "value": 24.582718758081775
  },
  {
    "symbol": "XAVA",
    "value": 1.646059710078366
  }
];

jest.mock("axios");

describe("pangolin fetcher", () => {
  const sut = fetchers["pangolin"];

  it("should properly fetch data", async () => {
    // Given
    mockFetcherResponse(pathToExampleResponse);

    // When
    const result = await sut.fetchAll(["PNG", "WAVAX", "WETH.e", "WBTC.e", "LINK.e", "XAVA"]);

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
    const result = await sut.fetchAll(["PNG", "WAVAX", "WETH.e", "WBTC.e", "LINK.e", "XAVA"]);

    // Then
    expect(result).toEqual(expectedResult);
    expect(tryCounter).toEqual(2);
  });
});
