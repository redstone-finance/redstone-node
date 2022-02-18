import {NodeConfig} from "../../src/types";
import NodeRunner from "../../src/NodeRunner";
import {JWKInterface} from "arweave/node/lib/wallet";
import {mocked} from "ts-jest/utils";
import ArweaveProxy from "../../src/arweave/ArweaveProxy";
import fetchers from "../../src/fetchers";
import mode from "../../mode";
import axios from "axios";
import ArweaveService from "../../src/arweave/ArweaveService";
import {any} from "jest-mock-extended";
import {timeout} from "../../src/utils/objects";


/****** MOCKS START ******/
const mockArProxy = {
  getAddress: () => Promise.resolve("mockArAddress"),
};
jest.mock("../../src/arweave/ArweaveProxy", () => {
  return jest.fn().mockImplementation(() => mockArProxy);
});

const mockBundlrProxy = {
  getBalance: jest.fn(),
  prepareSignedTrasaction: jest.fn().mockResolvedValue({
    id: "mockBundlrTransactionId"
  }),
  uploadBundlrTransaction: jest.fn(),
};
jest.mock("../../src/arweave/BundlrProxy", () => {
  return jest.fn().mockImplementation(() => mockBundlrProxy);
});

jest.mock("../../src/signers/EvmPriceSigner", () => {
  return jest.fn().mockImplementation(() => {
    return {
      signPricePackage: (pricePackage: any) => ({
        signature: "mock_evm_signed",
        liteSignature: "mock_evm_signed_lite",
        signer: "mock_evm_signer",
        pricePackage,
      }),
    };
  })
});

jest.mock("../../src/fetchers/coinbase/CoinbaseFetcher");
jest.mock("../../src/fetchers/uniswap/UniswapFetcher");

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.post.mockImplementation((url) => {
  if (url.startsWith(mode.broadcasterUrl) || url == "https://api.redstone.finance/metrics") {
    return Promise.resolve();
  }
  return Promise.reject(`mock for ${url} not available and should not be called`);
});

const modeMock = jest.requireMock("../../mode");
jest.mock("../../mode", () => ({
  isProd: false,
  broadcasterUrl: "http://broadcast.test"
}));

let manifest: any = null;

jest.mock('../../src/utils/objects', () => ({
  // @ts-ignore
  ...(jest.requireActual('../../src/utils/objects')),
  readJSON: () => {
    return manifest;
  }
}));

jest.mock("uuid",
  () => ({v4: () => "00000000-0000-0000-0000-000000000000"}));
/****** MOCKS END ******/


describe("NodeRunner", () => {

  const jwk: JWKInterface = {
    e: "e", kty: "kty", n: "n"
  }

  const nodeConfig: NodeConfig = {
    arweaveKeysFile: "", credentials: {
      infuraProjectId: "ipid",
      ethereumPrivateKey: "0x1111111111111111111111111111111111111111111111111111111111111111"
    },
    addEvmSignature: true,
    manifestFile: "",
    minimumArBalance: 0.2,
    enableStreamrBroadcaster: false,
  }

  beforeEach(() => {
    jest.useFakeTimers();
    mockBundlrProxy.getBalance.mockClear();
    mockBundlrProxy.prepareSignedTrasaction.mockClear();
    mockBundlrProxy.uploadBundlrTransaction.mockClear();
    mockedAxios.post.mockClear();

    jest.spyOn(global.Date, 'now')
      .mockImplementation(() => 111111111);

    fetchers["coinbase"] = {
      fetchAll: jest.fn().mockResolvedValue([
        {symbol: "BTC", value: 444}
      ])
    };
    fetchers["uniswap"] = {
      fetchAll: jest.fn().mockResolvedValue([
        {symbol: "BTC", value: 445}
      ])
    };

    manifest = {
      defaultSource: ["uniswap"],
      interval: 10000,
      maxPriceDeviationPercent: 25,
      priceAggregator: "median",
      sourceTimeout: 2000,
      evmChainId: 1,
      tokens: {
        "BTC": {
          source: ["coinbase"]
        },
        "ETH": {}
      }
    }
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should create node instance", async () => {
    //given
    const mockedArProxy = mocked(ArweaveProxy, true);

    const sut = await NodeRunner.create(
      jwk,
      nodeConfig
    );

    //then
    expect(sut).not.toBeNull();
    expect(mockedArProxy).toHaveBeenCalledWith(jwk)
  });

  it("should throw if no maxDeviationPercent configured for token", async () => {
    //given
    mockBundlrProxy.getBalance.mockResolvedValue(0.2);
    manifest =
      JSON.parse(`{
        "defaultSource": ["uniswap"],
        "interval": 0,
        "priceAggregator": "median",
        "sourceTimeout": 2000,
        "tokens": {
          "BTC": {
           "source": ["coinbase"]
          },
          "ETH": {}
        }
      }`)

    const sut = await NodeRunner.create(
      jwk,
      nodeConfig
    );

    await expect(sut.run()).rejects.toThrowError("Could not determine maxPriceDeviationPercent");
  });

  it("should throw if no sourceTimeout", async () => {
    //given
    manifest = JSON.parse(`{
        "defaultSource": ["uniswap"],
        "interval": 0,
        "priceAggregator": "median",
        "maxPriceDeviationPercent": 25,
        "evmChainId": 1,
        "tokens": {
          "BTC": {
           "source": ["coinbase"]
          },
          "ETH": {}
        }
      }`);
    mockBundlrProxy.getBalance.mockResolvedValue(0.2);
    const sut = await NodeRunner.create(
      jwk,
      nodeConfig
    );

    await expect(sut.run()).rejects.toThrowError("No timeout configured for");
  });

  it("should throw if minimumArBalance not defined in config file", async () => {
    await expect(async () => {
      await NodeRunner.create(
        jwk,
        JSON.parse(`{
      "arweaveKeysFile": "",
      "credentials": {
        "ethereumPrivateKey": "0x1111111111111111111111111111111111111111111111111111111111111111",
        "infuraProjectId": "ipid",
        "covalentApiKey": "ckey"
      },
      "manifestFile": ""
    }`));
    }).rejects.toThrow("minimumArBalance not defined in config file");
  });

  it("should save 'error' value if fetcher fails", async () => {
    // Given
    mockBundlrProxy.getBalance.mockResolvedValue(0.2);
    const sut = await NodeRunner.create(
      jwk,
      nodeConfig
    );
    fetchers["coinbase"] = {
      fetchAll: jest.fn(() => {
        throw new Error("test-error-coinbase");
      }),
    };

    // When
    await sut.run();

    // Then
    expect(mockBundlrProxy.prepareSignedTrasaction).toHaveBeenCalledWith([{
      "id": "00000000-0000-0000-0000-000000000000",
      "source": {
        "coinbase": "error",
        "uniswap": 445,
      },
      "symbol": "BTC",
      "timestamp": 111111111,
      "version": "0.4",
      "value": 445,
    }]);
  });

  it("should broadcast fetched and signed prices", async () => {
    //given
    mockBundlrProxy.getBalance.mockResolvedValue(0.2);

    const sut = await NodeRunner.create(
      jwk,
      nodeConfig
    );

    await sut.run();
    expect(mockBundlrProxy.prepareSignedTrasaction).toHaveBeenCalledWith([{
      "id": "00000000-0000-0000-0000-000000000000",
      "source": {"coinbase": 444, "uniswap": 445},
      "symbol": "BTC",
      "timestamp": 111111111,
      "value": 444.5,
      "version": "0.4"
    }]);

    expect(axios.post).toHaveBeenCalledWith(
      "http://broadcast.test/prices",
      [
        {
          "evmSignature": "mock_evm_signed",
          "liteEvmSignature": "mock_evm_signed_lite",
          "id": "00000000-0000-0000-0000-000000000000",
          "permawebTx": "mockBundlrTransactionId",
          "provider": "mockArAddress",
          "source": {"coinbase": 444, "uniswap": 445},
          "symbol": "BTC",
          "timestamp": 111111111,
          "value": 444.5,
          "version": "0.4"
        }
      ]
    );
    expect(axios.post).toHaveBeenCalledWith(
      "http://broadcast.test/packages",
      {
        timestamp: 111111111,
        signature: "mock_evm_signed",
        liteSignature: "mock_evm_signed_lite",
        signer: "mock_evm_signer",
        provider: "mockArAddress",
        prices: [{symbol: "BTC", value: 444.5}]
      }
    );
    expect(mockBundlrProxy.uploadBundlrTransaction).not.toHaveBeenCalled();
    // TODO: cannot spy on setInterval after upgrade to jest 27.
    // expect(setInterval).toHaveBeenCalledWith(any(), manifest.interval);
  });

  it("should not broadcast fetched and signed prices if values deviates too much", async () => {
    //given
    mockBundlrProxy.getBalance.mockResolvedValue(0.2);

    manifest = {
      ...manifest,
      maxPriceDeviationPercent: 0
    }

    const sut = await NodeRunner.create(
      jwk,
      nodeConfig
    );

    await sut.run();
    expect(mockBundlrProxy.prepareSignedTrasaction).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalledWith(mode.broadcasterUrl, any());
  });

  it("should save transaction on Arweave in mode=PROD", async () => {
    //given
    mockBundlrProxy.getBalance.mockResolvedValue(0.2);
    modeMock.isProd = true;

    const sut = await NodeRunner.create(
      jwk,
      nodeConfig
    );

    await sut.run();

    expect(axios.post).toHaveBeenCalledWith(
      mode.broadcasterUrl + "/prices",
      [
        {
          "id": "00000000-0000-0000-0000-000000000000",
          "source": {
            "coinbase": 444,
            "uniswap": 445
          },
          "symbol": "BTC",
          "timestamp": 111111111,
          "version": "0.4",
          "value": 444.5,
          "permawebTx": "mockBundlrTransactionId",
          "provider": "mockArAddress",
          "evmSignature": "mock_evm_signed",
          "liteEvmSignature": "mock_evm_signed_lite"
        }
      ]
    );

    expect(mockBundlrProxy.uploadBundlrTransaction).toHaveBeenCalledWith({
      "id": "mockBundlrTransactionId",
    });

  });

  it("should broadcast prices without evm signature when addEvmSignature is not set", async () => {
    const sut = await NodeRunner.create(
      jwk,
      {
        ...nodeConfig,
        addEvmSignature: false,
      }
    );

    await sut.run();

    expect(axios.post).toHaveBeenCalledWith(
      mode.broadcasterUrl + "/prices",
      [
        {
          "id": "00000000-0000-0000-0000-000000000000",
          "source": {
            "coinbase": 444,
            "uniswap": 445
          },
          "symbol": "BTC",
          "timestamp": 111111111,
          "version": "0.4",
          "value": 444.5,
          "permawebTx": "mockBundlrTransactionId",
          "provider": "mockArAddress",
        }
      ]
    );
  });

  describe("when useManifestFromSmartContract flag is set", () => {
    let nodeConfigManifestFromAr: any;
    beforeEach(() => {
      nodeConfigManifestFromAr = {
        ...nodeConfig,
        useManifestFromSmartContract: true
      }
    });

    it("should download prices when manifest is available", async () => {
      //given
      const arServiceSpy = jest.spyOn(ArweaveService.prototype, 'getCurrentManifest')
        .mockImplementation(() => Promise.resolve(manifest));

      const sut = await NodeRunner.create(
        jwk,
        nodeConfigManifestFromAr
      );

      await sut.run();

      expect(fetchers.uniswap.fetchAll).toHaveBeenCalled();
      expect(mockBundlrProxy.prepareSignedTrasaction).toHaveBeenCalled();

      arServiceSpy.mockClear();
    });

    it("should not create NodeRunner instance until manifest is available", async () => {
      //given
      jest.useRealTimers();
      let arServiceSpy = jest.spyOn(ArweaveService.prototype, 'getCurrentManifest')
        .mockImplementation(async () => {
          await timeout(200);
          return Promise.reject("no way!");
        })

      // this effectively makes manifest available after 100ms - so
      // we expect that second manifest fetching trial will succeed.
      setTimeout(() => {
        arServiceSpy = jest.spyOn(ArweaveService.prototype, 'getCurrentManifest')
          .mockImplementation(() => Promise.resolve(manifest));
      }, 100);
      const sut = await NodeRunner.create(
        jwk,
        nodeConfigManifestFromAr
      );
      expect(sut).not.toBeNull();
      expect(ArweaveService.prototype.getCurrentManifest).toHaveBeenCalledTimes(2);
      arServiceSpy.mockClear();
      jest.useFakeTimers();
    });

  });

});
