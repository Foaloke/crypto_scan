# Crypto Address Screening Exercise

This repository contains a small TypeScript CLI for screening an Ethereum address with the Etherscan API and exporting the results to CSV.

I chose:

- TypeScript for a compact, readable implementation with strong typing
- Ethereum because the task is framed around the concept of a wallet address, and Ethereum's account model maps cleanly to that idea
- Etherscan as the initial data source because it provides a simple API for retrieving address-level balance and other useful screening signals

## Why Ethereum

I considered other blockchains before starting:

- Bitcoin is widely used, but its UTXO model makes the idea of a single "wallet" less direct because a wallet can control multiple addresses
- Solana and other account-based chains would also have worked well

I ended up using Ethereum because the task explicitly refers to a wallet address, and Ethereum gives a straightforward address-to-balance model that is easy to explain and test.

## Current Scope

The current code is intentionally small and focused:

- it accepts an Ethereum address
- it queries Etherscan for the native ETH balance, latest normal transaction hash, latest internal transaction hash, transaction count, and whether the address is a contract
- it writes those values to a CSV file from the CLI

This keeps the first iteration focused while leaving room to add richer screening signals later.

## Etherscan API

The implementation uses the Etherscan API documentation available at [etherscan.io/apis](https://etherscan.io/apis).

The current implementation uses a small set of Etherscan v2 endpoints:

```text
GET https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=<wallet-address>&tag=latest&apikey=<api-key>
```

This balance endpoint is used to fetch the native ETH balance. The parameters used in this example are:

- `chainid=1`: selects Ethereum mainnet
- `module=account`: tells Etherscan the request is about an account address
- `action=balance`: requests the native ETH balance for that address
- `address=<wallet-address>`: the Ethereum wallet address being screened
- `tag=latest`: asks for the latest confirmed balance
- `apikey=<api-key>`: authenticates the request with an Etherscan API key

This endpoint returns the balance in wei, which the script converts into ETH.

The script also calls:

- `module=account&action=txlist` for the latest normal transaction
- `module=account&action=txlistinternal` for the latest internal transaction
- `module=proxy&action=eth_getTransactionCount` for the transaction count
- `module=proxy&action=eth_getCode` to determine whether the address is a contract

These additional endpoints provide the extra screening columns that are exported to CSV.

## Planned Screening Columns

Potential future additions include:

- `first_seen_at`
- `last_seen_at`
- `funding_address`
- `first_funding_tx`
- `erc20_transfer_count`

These fields are useful when screening an address because they help distinguish dormant addresses, active addresses, and smart contracts from externally owned accounts.

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file from the example:

```bash
cp .env.example .env
```

Then update `.env` so it contains:

```bash
ETHERSCAN_API_URL=https://api.etherscan.io/v2/api
ETHERSCAN_API_KEY=your_api_key
```

## Usage

Run the CLI with an Ethereum address:

```bash
npm start -- 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

This creates a file named `screening-<address>.csv` in the project root.

Generated CSV files are ignored by git so they do not get committed by accident.

## Build

```bash
npm run build
```

## Testing

```bash
npm test
```
