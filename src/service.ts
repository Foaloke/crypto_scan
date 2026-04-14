import {
  fetchAddressFundedBy,
  fetchCode,
  fetchFromEtherscan,
  fetchInternalTransactions,
  fetchLatestEventLogs,
  fetchNormalTransactions,
  fetchTransactionCount,
} from "./etherscan/etherscan.js";
import { formatWeiToEth, isValidEthereumAddress } from "./helpers.js";

function assertValidEthereumAddress(address: string): void {
  if (!isValidEthereumAddress(address)) {
    throw new Error("Invalid Ethereum address.");
  }
}

export async function getEthereumBalance(address: string): Promise<string> {
  assertValidEthereumAddress(address);

  const data = await fetchFromEtherscan(address);
  return formatWeiToEth(data.result);
}

export async function getAddressFundedBy(address: string) {
  assertValidEthereumAddress(address);
  const data = await fetchAddressFundedBy(address);
  return data.result;
}

export async function getNormalTransactions(address: string, page = 1, offset = 1) {
  assertValidEthereumAddress(address);
  const data = await fetchNormalTransactions(address, page, offset);
  return data.result;
}

export async function getLatestNormalTransaction(address: string): Promise<string> {
  const transactions = await getNormalTransactions(address);
  return transactions[0]?.hash ?? "";
}

export async function getInternalTransactions(address: string, page = 1, offset = 1) {
  assertValidEthereumAddress(address);
  const data = await fetchInternalTransactions(address, page, offset);
  return data.result;
}

export async function getLatestInternalTransaction(address: string): Promise<string> {
  const transactions = await getInternalTransactions(address);
  return transactions[0]?.hash ?? "";
}

export async function getLatestEventLogs(address: string, page = 1, offset = 1) {
  assertValidEthereumAddress(address);
  const data = await fetchLatestEventLogs(address, page, offset);
  return data.result;
}

export async function getLatestEventLog(address: string): Promise<string> {
  const log = (await getLatestEventLogs(address))[0];

  if (!log?.transactionHash || !log?.logIndex) {
    return "";
  }

  return `${log.transactionHash}:${log.logIndex}`;
}

export async function getTransactionCount(address: string): Promise<string> {
  assertValidEthereumAddress(address);
  const data = await fetchTransactionCount(address);
  return BigInt(data.result).toString();
}

export async function getIsContract(address: string): Promise<string> {
  assertValidEthereumAddress(address);
  const data = await fetchCode(address);
  return data.result !== "0x" ? "true" : "false";
}
