import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn(),
}));

vi.mock("../src/service.js", () => ({
  getEthereumBalance: vi.fn(),
  getLatestInternalTransaction: vi.fn(),
  getLatestNormalTransaction: vi.fn(),
  getIsContract: vi.fn(),
  getTransactionCount: vi.fn(),
}));

import { writeFile } from "node:fs/promises";
import {
  getEthereumBalance,
  getLatestInternalTransaction,
  getLatestNormalTransaction,
  getIsContract,
  getTransactionCount,
} from "../src/service.js";
import { main } from "../src/index.js";

const MOCK_ADDRESS = "0x44aa55bb66cc77dd88ee99ff00112233aabbccdd";
const getEthereumBalanceMock = vi.mocked(getEthereumBalance);
const getLatestInternalTransactionMock = vi.mocked(getLatestInternalTransaction);
const getLatestNormalTransactionMock = vi.mocked(getLatestNormalTransaction);
const getIsContractMock = vi.mocked(getIsContract);
const getTransactionCountMock = vi.mocked(getTransactionCount);
const writeFileMock = vi.mocked(writeFile);

beforeEach(() => {
  vi.useFakeTimers();
  getEthereumBalanceMock.mockReset();
  getLatestInternalTransactionMock.mockReset();
  getLatestNormalTransactionMock.mockReset();
  getIsContractMock.mockReset();
  getTransactionCountMock.mockReset();
  writeFileMock.mockReset();
  process.exitCode = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  process.exitCode = undefined;
});

describe("main", () => {
  it("prints usage when no address is provided", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await main([]);

    expect(errorSpy).toHaveBeenCalledWith("Usage: npm start -- <ethereum-address>");
    expect(getEthereumBalanceMock).not.toHaveBeenCalled();
    expect(writeFileMock).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it("creates a CSV file when the lookup succeeds", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    getEthereumBalanceMock.mockResolvedValue("4.2");
    getLatestNormalTransactionMock.mockResolvedValue("0xnormal-1");
    getLatestInternalTransactionMock.mockResolvedValue("0xinternal-1");
    getTransactionCountMock.mockResolvedValue("42");
    getIsContractMock.mockResolvedValue("false");

    const mainPromise = main([MOCK_ADDRESS]);
    await vi.runAllTimersAsync();
    await mainPromise;

    expect(getEthereumBalanceMock).toHaveBeenCalledWith(MOCK_ADDRESS);
    expect(getLatestNormalTransactionMock).toHaveBeenCalledWith(MOCK_ADDRESS);
    expect(getLatestInternalTransactionMock).toHaveBeenCalledWith(MOCK_ADDRESS);
    expect(getTransactionCountMock).toHaveBeenCalledWith(MOCK_ADDRESS);
    expect(getIsContractMock).toHaveBeenCalledWith(MOCK_ADDRESS);
    expect(writeFileMock).toHaveBeenCalledOnce();
    expect(writeFileMock).toHaveBeenCalledWith(
      `screening-${MOCK_ADDRESS}.csv`,
      `address,Balance,Latest normal transaction,Latest internal transaction,Transaction count,Is contract\n"${MOCK_ADDRESS}","4.2","0xnormal-1","0xinternal-1","42","false"\n`,
      "utf8",
    );
    expect(logSpy).toHaveBeenCalledWith(`CSV created at screening-${MOCK_ADDRESS}.csv`);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it("creates a CSV file when optional lookups fail", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    getEthereumBalanceMock.mockResolvedValue("4.2");
    getLatestNormalTransactionMock.mockRejectedValue(new Error("No records found."));
    getLatestInternalTransactionMock.mockResolvedValue("0xinternal-1");
    getTransactionCountMock.mockRejectedValue(new Error("No records found."));
    getIsContractMock.mockResolvedValue("false");

    const mainPromise = main([MOCK_ADDRESS]);
    await vi.runAllTimersAsync();
    await mainPromise;

    expect(writeFileMock).toHaveBeenCalledWith(
      `screening-${MOCK_ADDRESS}.csv`,
      `address,Balance,Latest normal transaction,Latest internal transaction,Transaction count,Is contract\n"${MOCK_ADDRESS}","4.2","","0xinternal-1","","false"\n`,
      "utf8",
    );
    expect(errorSpy).toHaveBeenCalledWith("Latest normal transaction unavailable: No records found.");
    expect(errorSpy).toHaveBeenCalledWith("Transaction count unavailable: No records found.");
    expect(logSpy).toHaveBeenCalledWith(`CSV created at screening-${MOCK_ADDRESS}.csv`);
    expect(process.exitCode).toBeUndefined();
  });

  it("prints the error message when the lookup fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    getEthereumBalanceMock.mockRejectedValue(new Error("Invalid Ethereum address."));

    const mainPromise = main(["invalid-address"]);
    await vi.runAllTimersAsync();
    await mainPromise;

    expect(errorSpy).toHaveBeenCalledWith("Invalid Ethereum address.");
    expect(process.exitCode).toBe(1);
  });
});
