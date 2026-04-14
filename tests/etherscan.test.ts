import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchAddressFundedBy,
  fetchCode,
  fetchFromEtherscan,
  fetchInternalTransactions,
  fetchLatestEventLogs,
  fetchNormalTransactions,
  fetchTransactionCount,
} from "../src/etherscan/etherscan.js";

const MOCK_ADDRESS = "0x22aa33bb44cc55dd66ee77ff88990011aabbccdd";
const originalFetch = globalThis.fetch;
const originalApiKey = process.env.ETHERSCAN_API_KEY;
const originalApiUrl = process.env.ETHERSCAN_API_URL;

beforeEach(() => {
  process.env.ETHERSCAN_API_KEY = "test-api-key";
  process.env.ETHERSCAN_API_URL = "https://api.etherscan.io/v2/api";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.ETHERSCAN_API_KEY = originalApiKey;
  process.env.ETHERSCAN_API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

describe("fetchFromEtherscan", () => {
  it("returns the parsed Etherscan balance response", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "1",
        message: "OK",
        result: "4200000000000000000",
      }),
    } as Response);

    globalThis.fetch = fetchMock;

    await expect(fetchFromEtherscan(MOCK_ADDRESS)).resolves.toEqual({
      status: "1",
      message: "OK",
      result: "4200000000000000000",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const requestUrl = fetchMock.mock.calls[0]?.[0];
    expect(requestUrl).toBeInstanceOf(URL);
    expect((requestUrl as URL).searchParams.get("module")).toBe("account");
    expect((requestUrl as URL).searchParams.get("action")).toBe("balance");
    expect((requestUrl as URL).searchParams.get("address")).toBe(MOCK_ADDRESS);
    expect((requestUrl as URL).searchParams.get("tag")).toBe("latest");
  });

  it("calls the funded-by endpoint with the expected parameters", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "1",
        message: "OK",
        result: {
          block: 53708500,
          timeStamp: "1708349932",
          fundingAddress: "0x55aa66bb77cc88dd99ee00ff11223344aabbccdd",
          fundingTxn: "0xabc123",
          value: "1000000000000000",
        },
      }),
    } as Response);

    await expect(fetchAddressFundedBy(MOCK_ADDRESS)).resolves.toEqual({
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

    const requestUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as URL;
    expect(requestUrl.searchParams.get("module")).toBe("account");
    expect(requestUrl.searchParams.get("action")).toBe("fundedby");
    expect(requestUrl.searchParams.get("address")).toBe(MOCK_ADDRESS);
  });

  it("calls the transaction count proxy endpoint with the expected parameters", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        jsonrpc: "2.0",
        id: 1,
        result: "0x2a",
      }),
    } as Response);

    await expect(fetchTransactionCount(MOCK_ADDRESS)).resolves.toEqual({
      jsonrpc: "2.0",
      id: 1,
      result: "0x2a",
    });

    const requestUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as URL;
    expect(requestUrl.searchParams.get("module")).toBe("proxy");
    expect(requestUrl.searchParams.get("action")).toBe("eth_getTransactionCount");
    expect(requestUrl.searchParams.get("address")).toBe(MOCK_ADDRESS);
    expect(requestUrl.searchParams.get("tag")).toBe("latest");
  });

  it("calls the getCode proxy endpoint with the expected parameters", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        jsonrpc: "2.0",
        id: 1,
        result: "0x60806040",
      }),
    } as Response);

    await expect(fetchCode(MOCK_ADDRESS)).resolves.toEqual({
      jsonrpc: "2.0",
      id: 1,
      result: "0x60806040",
    });

    const requestUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as URL;
    expect(requestUrl.searchParams.get("module")).toBe("proxy");
    expect(requestUrl.searchParams.get("action")).toBe("eth_getCode");
    expect(requestUrl.searchParams.get("address")).toBe(MOCK_ADDRESS);
    expect(requestUrl.searchParams.get("tag")).toBe("latest");
  });

  it("calls the normal transactions endpoint with pagination parameters", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "1",
        message: "OK",
        result: [],
      }),
    } as Response);

    await expect(fetchNormalTransactions(MOCK_ADDRESS)).resolves.toEqual({
      status: "1",
      message: "OK",
      result: [],
    });

    const requestUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as URL;
    expect(requestUrl.searchParams.get("action")).toBe("txlist");
    expect(requestUrl.searchParams.get("offset")).toBe("1");
    expect(requestUrl.searchParams.get("sort")).toBe("desc");
    expect(requestUrl.searchParams.get("startblock")).toBe("0");
    expect(requestUrl.searchParams.get("endblock")).toBe("9999999999");
  });

  it("allows overriding normal transaction pagination", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "1",
        message: "OK",
        result: [],
      }),
    } as Response);

    await expect(fetchNormalTransactions(MOCK_ADDRESS, 2, 5)).resolves.toEqual({
      status: "1",
      message: "OK",
      result: [],
    });

    const requestUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as URL;
    expect(requestUrl.searchParams.get("page")).toBe("2");
    expect(requestUrl.searchParams.get("offset")).toBe("5");
  });

  it("returns an empty list when no normal transactions are found", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "0",
        message: "NOTOK",
        result: "No transactions found",
      }),
    } as Response);

    await expect(fetchNormalTransactions(MOCK_ADDRESS)).resolves.toEqual({
      status: "1",
      message: "OK",
      result: [],
    });
  });

  it("calls the internal transactions endpoint with pagination parameters", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "1",
        message: "OK",
        result: [],
      }),
    } as Response);

    await expect(fetchInternalTransactions(MOCK_ADDRESS)).resolves.toEqual({
      status: "1",
      message: "OK",
      result: [],
    });

    const requestUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as URL;
    expect(requestUrl.searchParams.get("action")).toBe("txlistinternal");
    expect(requestUrl.searchParams.get("offset")).toBe("1");
    expect(requestUrl.searchParams.get("sort")).toBe("desc");
  });

  it("allows overriding internal transaction pagination", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "1",
        message: "OK",
        result: [],
      }),
    } as Response);

    await expect(fetchInternalTransactions(MOCK_ADDRESS, 3, 7)).resolves.toEqual({
      status: "1",
      message: "OK",
      result: [],
    });

    const requestUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as URL;
    expect(requestUrl.searchParams.get("page")).toBe("3");
    expect(requestUrl.searchParams.get("offset")).toBe("7");
  });

  it("returns an empty list when no internal transactions are found", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "0",
        message: "NOTOK",
        result: "No transactions found",
      }),
    } as Response);

    await expect(fetchInternalTransactions(MOCK_ADDRESS)).resolves.toEqual({
      status: "1",
      message: "OK",
      result: [],
    });
  });

  it("calls the event logs endpoint with latest-block parameters", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "1",
        message: "OK",
        result: [],
      }),
    } as Response);

    await expect(fetchLatestEventLogs(MOCK_ADDRESS)).resolves.toEqual({
      status: "1",
      message: "OK",
      result: [],
    });

    const requestUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as URL;
    expect(requestUrl.searchParams.get("module")).toBe("logs");
    expect(requestUrl.searchParams.get("action")).toBe("getLogs");
    expect(requestUrl.searchParams.get("fromBlock")).toBe("0");
    expect(requestUrl.searchParams.get("toBlock")).toBe("latest");
    expect(requestUrl.searchParams.get("offset")).toBe("1");
  });

  it("allows overriding event log pagination", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "1",
        message: "OK",
        result: [],
      }),
    } as Response);

    await expect(fetchLatestEventLogs(MOCK_ADDRESS, 4, 9)).resolves.toEqual({
      status: "1",
      message: "OK",
      result: [],
    });

    const requestUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as URL;
    expect(requestUrl.searchParams.get("page")).toBe("4");
    expect(requestUrl.searchParams.get("offset")).toBe("9");
  });

  it("returns an empty list when no event logs are found", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "0",
        message: "NOTOK",
        result: "No records found",
      }),
    } as Response);

    await expect(fetchLatestEventLogs(MOCK_ADDRESS)).resolves.toEqual({
      status: "1",
      message: "OK",
      result: [],
    });
  });

  it("returns an empty list when Etherscan reports no event log records with an empty array", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "0",
        message: "No records found",
        result: [],
      }),
    } as Response);

    await expect(fetchLatestEventLogs(MOCK_ADDRESS)).resolves.toEqual({
      status: "1",
      message: "OK",
      result: [],
    });
  });

  it("throws when the API key is missing", async () => {
    delete process.env.ETHERSCAN_API_KEY;

    await expect(fetchFromEtherscan(MOCK_ADDRESS)).rejects.toThrow("ETHERSCAN_API_KEY is required.");
  });

  it("throws when the API URL is missing", async () => {
    delete process.env.ETHERSCAN_API_URL;

    await expect(fetchFromEtherscan(MOCK_ADDRESS)).rejects.toThrow("ETHERSCAN_API_URL is required.");
  });

  it("throws when the HTTP request fails", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    await expect(fetchFromEtherscan(MOCK_ADDRESS)).rejects.toThrow(
      "Etherscan request failed with status 500.",
    );
  });

  it("throws when Etherscan returns an application error", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "0",
        message: "NOTOK",
        result: "Invalid API Key",
      }),
    } as Response);

    await expect(fetchFromEtherscan(MOCK_ADDRESS)).rejects.toThrow("Etherscan error: NOTOK.");
  });
});
