import type {
  EtherscanBalanceResponse,
  EtherscanCodeResponse,
  EtherscanEventLog,
  EtherscanEventLogsResponse,
  EtherscanFundedByResponse,
  EtherscanFundedByResult,
  EtherscanInternalTransaction,
  EtherscanInternalTransactionsResponse,
  EtherscanNormalTransaction,
  EtherscanNormalTransactionsResponse,
  EtherscanProxyResponse,
  EtherscanResponse,
  EtherscanTransactionCountResponse,
} from "./etherscan.types.js";

type FetchEtherscanOptions = {
  allowEmptyArrayResult?: boolean;
};

function isEmptyEtherscanResult(value: unknown): value is string {
  return typeof value === "string" && /no .*found/i.test(value);
}

function isEmptyEtherscanMessage(value: unknown): value is string {
  return typeof value === "string" && /no .*found/i.test(value);
}

async function fetchEtherscan<T>(
  params: Record<string, string>,
  options: FetchEtherscanOptions = {},
): Promise<EtherscanResponse<T>> {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  const apiUrl = process.env.ETHERSCAN_API_URL;

  if (!apiKey) {
    throw new Error("ETHERSCAN_API_KEY is required.");
  }

  if (!apiUrl) {
    throw new Error("ETHERSCAN_API_URL is required.");
  }

  const url = new URL(apiUrl);
  url.searchParams.set("chainid", "1");
  url.searchParams.set("apikey", apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Etherscan request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as EtherscanResponse<T>;
  if (data.status !== "1") {
    if (
      options.allowEmptyArrayResult &&
      (isEmptyEtherscanResult(data.result) ||
        (Array.isArray(data.result) && data.result.length === 0 && isEmptyEtherscanMessage(data.message)))
    ) {
      return {
        status: "1",
        message: "OK",
        result: [] as T,
      };
    }

    throw new Error(`Etherscan error: ${data.message}.`);
  }

  return data;
}

async function fetchEtherscanProxy<T>(
  params: Record<string, string>,
): Promise<EtherscanProxyResponse<T>> {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  const apiUrl = process.env.ETHERSCAN_API_URL;

  if (!apiKey) {
    throw new Error("ETHERSCAN_API_KEY is required.");
  }

  if (!apiUrl) {
    throw new Error("ETHERSCAN_API_URL is required.");
  }

  const url = new URL(apiUrl);
  url.searchParams.set("chainid", "1");
  url.searchParams.set("apikey", apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Etherscan request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as EtherscanProxyResponse<T>;
  if (data.result === undefined || data.result === null) {
    throw new Error("Etherscan proxy error: missing result.");
  }

  return data;
}

export async function fetchFromEtherscan(address: string): Promise<EtherscanBalanceResponse> {
  return fetchEtherscan<string>({
    module: "account",
    action: "balance",
    address,
    tag: "latest",
  });
}

export async function fetchAddressFundedBy(address: string): Promise<EtherscanFundedByResponse> {
  return fetchEtherscan<EtherscanFundedByResult>({
    module: "account",
    action: "fundedby",
    address,
  });
}

export async function fetchTransactionCount(
  address: string,
): Promise<EtherscanTransactionCountResponse> {
  return fetchEtherscanProxy<string>({
    module: "proxy",
    action: "eth_getTransactionCount",
    address,
    tag: "latest",
  });
}

export async function fetchCode(address: string): Promise<EtherscanCodeResponse> {
  return fetchEtherscanProxy<string>({
    module: "proxy",
    action: "eth_getCode",
    address,
    tag: "latest",
  });
}

export async function fetchNormalTransactions(
  address: string,
  page = 1,
  offset = 1,
): Promise<EtherscanNormalTransactionsResponse> {
  return fetchEtherscan<EtherscanNormalTransaction[]>(
    {
      module: "account",
      action: "txlist",
      address,
      startblock: "0",
      endblock: "9999999999",
      page: String(page),
      offset: String(offset),
      sort: "desc",
    },
    { allowEmptyArrayResult: true },
  );
}

export async function fetchInternalTransactions(
  address: string,
  page = 1,
  offset = 1,
): Promise<EtherscanInternalTransactionsResponse> {
  return fetchEtherscan<EtherscanInternalTransaction[]>(
    {
      module: "account",
      action: "txlistinternal",
      address,
      startblock: "0",
      endblock: "9999999999",
      page: String(page),
      offset: String(offset),
      sort: "desc",
    },
    { allowEmptyArrayResult: true },
  );
}

export async function fetchLatestEventLogs(
  address: string,
  page = 1,
  offset = 1,
): Promise<EtherscanEventLogsResponse> {
  return fetchEtherscan<EtherscanEventLog[]>(
    {
      module: "logs",
      action: "getLogs",
      address,
      fromBlock: "0",
      toBlock: "latest",
      page: String(page),
      offset: String(offset),
    },
    { allowEmptyArrayResult: true },
  );
}
