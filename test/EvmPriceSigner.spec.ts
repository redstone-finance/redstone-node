import { ethers } from "ethers";
import { SignedPricePackage, PricePackage } from "../src/types";
import EvmPriceSigner from "../src/utils/EvmPriceSigner";

const evmSigner = new EvmPriceSigner();
const ethereumPrivateKey = ethers.Wallet.createRandom().privateKey;

describe('evmSignPricesAndVerify', () => {
  it('should sign prices package', () => {
    // given
    const pricePackage: PricePackage = {
      "prices": [
        {
          "symbol": "XXX",
          "value": 10,
        },
        {
          "symbol": "YYY",
          "value": 100,
        },
        {
          "symbol": "AAA",
          "value": 20.003,
        },
      ],
      "timestamp": Date.now(),
    };

    // when
    const signedPricesData: SignedPricePackage = evmSigner.signPriceData(
      pricePackage,
      ethereumPrivateKey);

    // then
    expect(evmSigner.verifySignature(signedPricesData)).toEqual(true);
  });

  it("should fail verifyung wrong signature", () => {
    // given
    const pricePackage: PricePackage = {
      "prices": [
        {
          "symbol": "XXX",
          "value": 10,
        },
      ],
      "timestamp": Date.now(),
    };
    const anotherPricesPackage = {
      ...pricePackage,
      timestamp: pricePackage.timestamp + 1,
    };

    // when
    const signedPricesData: SignedPricePackage = evmSigner.signPriceData(
      pricePackage,
      ethereumPrivateKey);

    // then
    expect(evmSigner.verifySignature({
      ...signedPricesData,
      pricePackage: anotherPricesPackage,
    })).toEqual(false);
  });

  it("should sign and verify even packages with different price order", () => {
    // given
    const pricePackage1: PricePackage = {
      "prices": [
        {
          "symbol": "FIRST",
          "value": 1,
        },
        {
          "symbol": "SECOND",
          "value": 2,
        },
      ],
      "timestamp": Date.now(),
    };

    const pricePackageWithDifferentOrder: PricePackage = {
      "prices": [
        {
          "symbol": "SECOND",
          "value": 2,
        },
        {
          "symbol": "FIRST",
          "value": 1,
        },
      ],
      "timestamp": Date.now(),
    };

    // when
    const signedPricesData: SignedPricePackage = evmSigner.signPriceData(
      pricePackage1,
      ethereumPrivateKey);

    // then
    expect(evmSigner.verifySignature({
      ...signedPricesData,
      pricePackage: pricePackageWithDifferentOrder,
    })).toEqual(true);
  });

});
