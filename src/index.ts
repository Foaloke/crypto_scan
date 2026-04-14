import "dotenv/config";
import { writeFile } from "node:fs/promises";
import { buildCsv, type CsvEntry } from "./csv/csv.js";
import { resolveValueInTimeFrame } from "./helpers.js";
import {
  getEthereumBalance,
  getLatestInternalTransaction,
  getLatestNormalTransaction,
  getIsContract,
  getTransactionCount,
} from "./service.js";

type CsvValueRequest = {
  request: (address: string) => Promise<string>;
  label: string;
  options?: {
    required?: boolean;
  };
};

export async function main(argv = process.argv.slice(2)): Promise<void> {
  const [address] = argv;

  if (!address) {
    console.error("Usage: npm start -- <ethereum-address>");
    process.exitCode = 1;
    return;
  }

  try {
    const requests: CsvValueRequest[] = [
      { request: getEthereumBalance, label: "Balance", options: { required: true } },
      { request: getLatestNormalTransaction, label: "Latest normal transaction" },
      { request: getLatestInternalTransaction, label: "Latest internal transaction" },
      { request: getTransactionCount, label: "Transaction count" },
      { request: getIsContract, label: "Is contract" },
    ];

    const resolvedEntries: CsvEntry[] = [{ label: "address", value: address }];
    let requestChain = Promise.resolve();

    requests.forEach(({ request, label, options }) => {
      requestChain = requestChain.then(async () => {
        const value = await resolveValueInTimeFrame(() => request(address), label, options);
        resolvedEntries.push({ label, value });
      });
    });

    await requestChain;
    const csv = buildCsv(resolvedEntries);
    const outputPath = `screening-${address}.csv`;

    await writeFile(outputPath, csv, "utf8");
    console.log(`CSV created at ${outputPath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    console.error(message);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
