const ETHEREUM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const WEI_DIGITS = 18;

const REQUEST_TIME_FRAME_MS = 500;

export type ResolveValueOptions = {
  timeFrame?: number;
  required?: boolean;
};

export function isValidEthereumAddress(address: string): boolean {
  return ETHEREUM_ADDRESS_REGEX.test(address);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function resolveValueInTimeFrame(
  request: () => Promise<string>,
  label: string,
  { timeFrame = REQUEST_TIME_FRAME_MS, required = false }: ResolveValueOptions = {},
): Promise<string> {
  const startedAt = Date.now();

  try {
    return await request();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";

    if (required) {
      throw error;
    }

    console.error(`${label} unavailable: ${message}`);
    return "";
  } finally {
    const elapsedMs = Date.now() - startedAt;
    const remainingMs = timeFrame - elapsedMs;

    if (remainingMs > 0) {
      await sleep(remainingMs);
    }
  }
}

export function formatWeiToEth(balanceInWei: string): string {
  const balance = BigInt(balanceInWei);
  const whole = balance / 10n ** BigInt(WEI_DIGITS);
  const fraction = balance % 10n ** BigInt(WEI_DIGITS);

  if (fraction === 0n) {
    return whole.toString();
  }

  return `${whole}.${fraction.toString().padStart(WEI_DIGITS, "0").replace(/0+$/, "")}`;
}
