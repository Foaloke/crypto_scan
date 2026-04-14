import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/etherscan/etherscan.js", () => ({
  fetchAddressFundedBy: vi.fn(),
  fetchCode: vi.fn(),
  fetchFromEtherscan: vi.fn(),
  fetchInternalTransactions: vi.fn(),
  fetchLatestEventLogs: vi.fn(),
  fetchNormalTransactions: vi.fn(),
  fetchTransactionCount: vi.fn(),
}));

import {
  fetchAddressFundedBy,
  fetchCode,
  fetchFromEtherscan,
  fetchInternalTransactions,
  fetchLatestEventLogs,
  fetchNormalTransactions,
  fetchTransactionCount,
} from "../src/etherscan/etherscan.js";
import {
  getAddressFundedBy,
  getEthereumBalance,
  getInternalTransactions,
  getIsContract,
  getLatestEventLog,
  getLatestEventLogs,
  getLatestInternalTransaction,
  getLatestNormalTransaction,
  getNormalTransactions,
  getTransactionCount,
} from "../src/service.js";

const MOCK_ADDRESS = "0x33aa44bb55cc66dd77ee88ff99001122aabbccdd";
const fetchAddressFundedByMock = vi.mocked(fetchAddressFundedBy);
const fetchCodeMock = vi.mocked(fetchCode);
const fetchFromEtherscanMock = vi.mocked(fetchFromEtherscan);
const fetchInternalTransactionsMock = vi.mocked(fetchInternalTransactions);
const fetchLatestEventLogsMock = vi.mocked(fetchLatestEventLogs);
const fetchNormalTransactionsMock = vi.mocked(fetchNormalTransactions);
const fetchTransactionCountMock = vi.mocked(fetchTransactionCount);

beforeEach(() => {
  fetchAddressFundedByMock.mockReset();
  fetchCodeMock.mockReset();
  fetchFromEtherscanMock.mockReset();
  fetchInternalTransactionsMock.mockReset();
  fetchLatestEventLogsMock.mockReset();
  fetchNormalTransactionsMock.mockReset();
  fetchTransactionCountMock.mockReset();
});

describe("getEthereumBalance", () => {
  it("returns the ETH balance formatted from wei", async () => {
    fetchFromEtherscanMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: "4200000000000000000",
    });

    await expect(getEthereumBalance(MOCK_ADDRESS)).resolves.toBe("4.2");

    expect(fetchFromEtherscanMock).toHaveBeenCalledWith(MOCK_ADDRESS);
  });

  it("throws when the address is invalid", async () => {
    await expect(getEthereumBalance("invalid-address")).rejects.toThrow("Invalid Ethereum address.");
    expect(fetchFromEtherscanMock).not.toHaveBeenCalled();
  });

  it("propagates Etherscan errors", async () => {
    fetchFromEtherscanMock.mockRejectedValue(new Error("Etherscan error: NOTOK."));

    await expect(getEthereumBalance(MOCK_ADDRESS)).rejects.toThrow("Etherscan error: NOTOK.");
  });
});

describe("getAddressFundedBy", () => {
  it("returns the funded-by result", async () => {
    fetchAddressFundedByMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: {
        block: 53708500,
        timeStamp: "1708349932",
        fundingAddress: "0x55aa66bb77cc88dd99ee00ff11223344aabbccdd",
        fundingTxn: "0xabc123",
        value: "1000000000000000",
      },
    });

    await expect(getAddressFundedBy(MOCK_ADDRESS)).resolves.toEqual({
      block: 53708500,
      timeStamp: "1708349932",
      fundingAddress: "0x55aa66bb77cc88dd99ee00ff11223344aabbccdd",
      fundingTxn: "0xabc123",
      value: "1000000000000000",
    });
    expect(fetchAddressFundedByMock).toHaveBeenCalledWith(MOCK_ADDRESS);
  });
});

describe("getNormalTransactions", () => {
  it("returns the normal transactions list", async () => {
    fetchNormalTransactionsMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: [{ hash: "0xnormal" }] as never[],
    });

    await expect(getNormalTransactions(MOCK_ADDRESS)).resolves.toEqual([{ hash: "0xnormal" }]);
    expect(fetchNormalTransactionsMock).toHaveBeenCalledWith(MOCK_ADDRESS, 1, 1);
  });

  it("passes custom pagination when provided", async () => {
    fetchNormalTransactionsMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: [{ hash: "0xnormal" }] as never[],
    });

    await expect(getNormalTransactions(MOCK_ADDRESS, 2, 5)).resolves.toEqual([{ hash: "0xnormal" }]);
    expect(fetchNormalTransactionsMock).toHaveBeenCalledWith(MOCK_ADDRESS, 2, 5);
  });
});

describe("getLatestNormalTransaction", () => {
  it("returns the latest normal transaction hash", async () => {
    fetchNormalTransactionsMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: [{ hash: "0xnormal" }] as never[],
    });

    await expect(getLatestNormalTransaction(MOCK_ADDRESS)).resolves.toBe("0xnormal");
  });

  it("returns an empty string when no normal transaction is available", async () => {
    fetchNormalTransactionsMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: [],
    });

    await expect(getLatestNormalTransaction(MOCK_ADDRESS)).resolves.toBe("");
  });
});

describe("getInternalTransactions", () => {
  it("returns the internal transactions list", async () => {
    fetchInternalTransactionsMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: [{ hash: "0xinternal" }] as never[],
    });

    await expect(getInternalTransactions(MOCK_ADDRESS)).resolves.toEqual([
      { hash: "0xinternal" },
    ]);
    expect(fetchInternalTransactionsMock).toHaveBeenCalledWith(MOCK_ADDRESS, 1, 1);
  });

  it("passes custom pagination when provided", async () => {
    fetchInternalTransactionsMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: [{ hash: "0xinternal" }] as never[],
    });

    await expect(getInternalTransactions(MOCK_ADDRESS, 3, 7)).resolves.toEqual([
      { hash: "0xinternal" },
    ]);
    expect(fetchInternalTransactionsMock).toHaveBeenCalledWith(MOCK_ADDRESS, 3, 7);
  });
});

describe("getLatestInternalTransaction", () => {
  it("returns the latest internal transaction hash", async () => {
    fetchInternalTransactionsMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: [{ hash: "0xinternal" }] as never[],
    });

    await expect(getLatestInternalTransaction(MOCK_ADDRESS)).resolves.toBe("0xinternal");
  });

  it("returns an empty string when no internal transaction is available", async () => {
    fetchInternalTransactionsMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: [],
    });

    await expect(getLatestInternalTransaction(MOCK_ADDRESS)).resolves.toBe("");
  });
});

describe("getLatestEventLogs", () => {
  it("returns the event logs list", async () => {
    fetchLatestEventLogsMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: [{ transactionHash: "0xlog" }] as never[],
    });

    await expect(getLatestEventLogs(MOCK_ADDRESS)).resolves.toEqual([
      { transactionHash: "0xlog" },
    ]);
    expect(fetchLatestEventLogsMock).toHaveBeenCalledWith(MOCK_ADDRESS, 1, 1);
  });

  it("passes custom pagination when provided", async () => {
    fetchLatestEventLogsMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: [{ transactionHash: "0xlog" }] as never[],
    });

    await expect(getLatestEventLogs(MOCK_ADDRESS, 4, 9)).resolves.toEqual([
      { transactionHash: "0xlog" },
    ]);
    expect(fetchLatestEventLogsMock).toHaveBeenCalledWith(MOCK_ADDRESS, 4, 9);
  });

  it("rejects an invalid address before calling the API layer", async () => {
    await expect(getLatestEventLogs("invalid-address")).rejects.toThrow(
      "Invalid Ethereum address.",
    );
    expect(fetchLatestEventLogsMock).not.toHaveBeenCalled();
  });
});

describe("getLatestEventLog", () => {
  it("returns the latest event log descriptor", async () => {
    fetchLatestEventLogsMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: [{ transactionHash: "0xlog", logIndex: "0x1" }] as never[],
    });

    await expect(getLatestEventLog(MOCK_ADDRESS)).resolves.toBe("0xlog:0x1");
  });

  it("returns an empty string when no event log is available", async () => {
    fetchLatestEventLogsMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: [],
    });

    await expect(getLatestEventLog(MOCK_ADDRESS)).resolves.toBe("");
  });

  it("returns an empty string when the latest event log is missing fields", async () => {
    fetchLatestEventLogsMock.mockResolvedValue({
      status: "1",
      message: "OK",
      result: [{ transactionHash: "0xlog", logIndex: "" }] as never[],
    });

    await expect(getLatestEventLog(MOCK_ADDRESS)).resolves.toBe("");
  });
});

describe("getTransactionCount", () => {
  it("returns the decimal transaction count", async () => {
    fetchTransactionCountMock.mockResolvedValue({
      jsonrpc: "2.0",
      id: 1,
      result: "0x2a",
    });

    await expect(getTransactionCount(MOCK_ADDRESS)).resolves.toBe("42");
    expect(fetchTransactionCountMock).toHaveBeenCalledWith(MOCK_ADDRESS);
  });
});

describe("getIsContract", () => {
  it("returns true when code exists at the address", async () => {
    fetchCodeMock.mockResolvedValue({
      jsonrpc: "2.0",
      id: 1,
      result: "0x60806040",
    });

    await expect(getIsContract(MOCK_ADDRESS)).resolves.toBe("true");
    expect(fetchCodeMock).toHaveBeenCalledWith(MOCK_ADDRESS);
  });

  it("returns false when the address has no code", async () => {
    fetchCodeMock.mockResolvedValue({
      jsonrpc: "2.0",
      id: 1,
      result: "0x",
    });

    await expect(getIsContract(MOCK_ADDRESS)).resolves.toBe("false");
  });
});
