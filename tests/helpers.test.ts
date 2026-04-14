import { describe, expect, it } from "vitest";
import { formatWeiToEth, isValidEthereumAddress } from "../src/helpers.js";

const MOCK_ADDRESS = "0x11aa22bb33cc44dd55ee66ff77889900aabbccdd";

describe("isValidEthereumAddress", () => {
  it("accepts a valid Ethereum address", () => {
    expect(isValidEthereumAddress(MOCK_ADDRESS)).toBe(true);
  });

  it("rejects a string without the 0x prefix", () => {
    expect(isValidEthereumAddress("11aa22bb33cc44dd55ee66ff77889900aabbccdd")).toBe(false);
  });

  it("rejects an address with the wrong length", () => {
    expect(isValidEthereumAddress("0x1234")).toBe(false);
  });
});

describe("formatWeiToEth", () => {
  it("formats zero balances", () => {
    expect(formatWeiToEth("0")).toBe("0");
  });

  it("formats whole ETH balances", () => {
    expect(formatWeiToEth("1000000000000000000")).toBe("1");
  });

  it("formats fractional ETH balances", () => {
    expect(formatWeiToEth("1234500000000000000")).toBe("1.2345");
  });

  it("preserves very small fractional balances", () => {
    expect(formatWeiToEth("1")).toBe("0.000000000000000001");
  });
});
