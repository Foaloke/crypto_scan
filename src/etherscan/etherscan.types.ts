export type EtherscanResponse<T> = {
  status: string;
  message: string;
  result: T;
};

export type EtherscanProxyResponse<T> = {
  jsonrpc: string;
  id: number;
  result: T;
};

export type EtherscanBalanceResponse = EtherscanResponse<string>;

export type EtherscanFundedByResult = {
  block: number;
  timeStamp: string;
  fundingAddress: string;
  fundingTxn: string;
  value: string;
};

export type EtherscanFundedByResponse = EtherscanResponse<EtherscanFundedByResult>;

export type EtherscanNormalTransaction = {
  blockNumber: string;
  blockHash: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  input: string;
  methodId: string;
  functionName: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  txreceipt_status: string;
  gasUsed: string;
  confirmations: string;
  isError: string;
};

export type EtherscanNormalTransactionsResponse = EtherscanResponse<EtherscanNormalTransaction[]>;

export type EtherscanInternalTransaction = {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
  input: string;
  type: string;
  gas: string;
  gasUsed: string;
  traceId: string;
  isError: string;
  errCode: string;
};

export type EtherscanInternalTransactionsResponse = EtherscanResponse<EtherscanInternalTransaction[]>;

export type EtherscanEventLog = {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  blockHash: string;
  timeStamp: string;
  gasPrice: string;
  gasUsed: string;
  logIndex: string;
  transactionHash: string;
  transactionIndex: string;
};

export type EtherscanEventLogsResponse = EtherscanResponse<EtherscanEventLog[]>;

export type EtherscanTransactionCountResponse = EtherscanProxyResponse<string>;

export type EtherscanCodeResponse = EtherscanProxyResponse<string>;
