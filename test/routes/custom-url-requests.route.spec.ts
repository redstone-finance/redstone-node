import request from "supertest";
import axios from "axios";
import { toBase64 } from "../../src/utils/base64";
import { getApp } from "./_helpers";

const app = getApp();

// Mock axios response
const exampleResponse = {
  A: {
    B: {
      C: 42,
    },
  },
};
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.get.mockResolvedValue({ data: exampleResponse });

// Mock current timestamp
Date.now = jest.fn(() => 1652662184000);

describe("Custom URL requests route", () => {
  test("Should send correct response ", async () => {
    const customUrlRequestConfigBase64 = toBase64(
      JSON.stringify({
        url: "https://example-custom-data-source.com/hehe",
        jsonpath: "$.A.B.C",
      })
    );
    const response = await request(app)
      .get("/custom-url-requests")
      .query({
        "custom-url-request-config-base64": customUrlRequestConfigBase64,
      })
      .expect(200);

    expect(response.body).toEqual({
      signerAddress: "0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A",
      liteSignature:
        "0x6a4fab1950cf3bfd0ff0df5ef50b87d1a39cd451476081d7ef50179562aacd940ac81ddbde946dcf4c45f4cf41eebe876f0e82cd343c9a0799943c95bbad1ee51c",
      prices: [{ symbol: "0x8edd634f1bbd8320", value: 42 }],
      customRequestConfig: {
        url: "https://example-custom-data-source.com/hehe",
        jsonpath: "$.A.B.C",
      },
      timestamp: 1652662184000,
    });
  });

  test("Should handle invalid values correctly ", async () => {
    mockedAxios.get.mockResolvedValue({ data: { bad: "value" } });
    const customUrlRequestConfigBase64 = toBase64(
      JSON.stringify({
        url: "https://example-custom-data-source.com/hehe",
        jsonpath: "$.A.B.C",
      })
    );
    await request(app)
      .get("/custom-url-requests")
      .query({
        "custom-url-request-config-base64": customUrlRequestConfigBase64,
      })
      .expect(400);
  });

  test("Should handle invalid request params ", async () => {
    mockedAxios.get.mockResolvedValue({ data: { bad: "value" } });
    await request(app).get("/custom-url-requests").expect(400);
  });
});
