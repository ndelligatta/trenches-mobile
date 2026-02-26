import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import {
  JUPITER_QUOTE_URL,
  JUPITER_SWAP_URL,
  JUPITER_API_KEY,
  SOL_MINT,
  USDC_MINT,
  USDC_DECIMALS,
  TRENCH_MINT,
  TREASURY_WALLET,
  DEFAULT_SLIPPAGE_BPS,
} from '../constants/onchain';

/**
 * XHR-based HTTP client — bypasses the broken whatwg-fetch polyfill
 * that @walletconnect/react-native-compat injects.
 * React Native's XMLHttpRequest is native and works reliably.
 */
function httpGet(url: string): Promise<{ ok: boolean; status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    if (JUPITER_API_KEY) xhr.setRequestHeader('x-api-key', JUPITER_API_KEY);
    xhr.timeout = 20000;
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status > 0) {
          resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, body: xhr.responseText });
        }
        // status 0 = network error, handled by onerror
      }
    };
    xhr.onerror = () => reject(new Error(`Network error (GET ${xhr.status}/${xhr.readyState}): ${url.slice(0, 80)}`));
    xhr.ontimeout = () => reject(new Error(`Timeout (GET): ${url.slice(0, 80)}`));
    xhr.send();
  });
}

function httpPost(url: string, jsonBody: any): Promise<{ ok: boolean; status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (JUPITER_API_KEY) xhr.setRequestHeader('x-api-key', JUPITER_API_KEY);
    xhr.timeout = 20000;
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status > 0) {
          resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, body: xhr.responseText });
        }
      }
    };
    xhr.onerror = () => reject(new Error(`Network error (POST ${xhr.status}/${xhr.readyState}): ${url.slice(0, 80)}`));
    xhr.ontimeout = () => reject(new Error(`Timeout (POST): ${url.slice(0, 80)}`));
    xhr.send(JSON.stringify(jsonBody));
  });
}

export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  routePlan: any[];
  contextSlot: number;
  [key: string]: any;
}

/**
 * Get a Jupiter quote for swapping SOL → TRENCH (ExactOut).
 * Returns how much SOL is needed to receive `trenchRawAmount` TRENCH tokens.
 */
export async function getSwapQuote(trenchRawAmount: number): Promise<JupiterQuote> {
  const params = new URLSearchParams({
    inputMint: SOL_MINT.toBase58(),
    outputMint: TRENCH_MINT.toBase58(),
    amount: String(trenchRawAmount),
    swapMode: 'ExactOut',
    slippageBps: String(DEFAULT_SLIPPAGE_BPS),
  });

  const res = await httpGet(`${JUPITER_QUOTE_URL}?${params}`);
  if (!res.ok) throw new Error(`Jupiter quote failed (${res.status}): ${res.body}`);
  return JSON.parse(res.body);
}

/**
 * Build a swap transaction via Jupiter.
 * The output TRENCH tokens go to the treasury's Associated Token Account.
 * Returns a base64-encoded VersionedTransaction ready for signing.
 */
export async function buildSwapTransaction(
  quoteResponse: JupiterQuote,
  userPublicKey: string,
): Promise<string> {
  // Compute treasury's TRENCH token account (Token 2022 program)
  const treasuryATA = await getAssociatedTokenAddress(
    TRENCH_MINT,
    TREASURY_WALLET,
    false,
    TOKEN_2022_PROGRAM_ID,
  );

  const res = await httpPost(JUPITER_SWAP_URL, {
    quoteResponse,
    userPublicKey,
    destinationTokenAccount: treasuryATA.toBase58(),
    wrapAndUnwrapSol: true,
    dynamicComputeUnitLimit: true,
    prioritizationFeeLamports: 'auto',
    maxAccounts: 20,
  });

  if (!res.ok) throw new Error(`Jupiter swap build failed (${res.status}): ${res.body}`);
  const data = JSON.parse(res.body);
  return data.swapTransaction;
}

/**
 * Get a Jupiter quote for swapping USDC → TRENCH (ExactIn).
 * Specify USD amount, get back how much TRENCH you receive.
 */
export async function getUsdcSwapQuote(usdAmount: number): Promise<JupiterQuote> {
  const rawUsdc = Math.round(usdAmount * 10 ** USDC_DECIMALS);
  const params = new URLSearchParams({
    inputMint: USDC_MINT.toBase58(),
    outputMint: TRENCH_MINT.toBase58(),
    amount: String(rawUsdc),
    swapMode: 'ExactIn',
    slippageBps: String(DEFAULT_SLIPPAGE_BPS),
  });

  const res = await httpGet(`${JUPITER_QUOTE_URL}?${params}`);
  if (!res.ok) throw new Error(`Jupiter USDC quote failed (${res.status}): ${res.body}`);
  return JSON.parse(res.body);
}

/**
 * Get a Jupiter quote for swapping SOL → TRENCH (ExactIn).
 * Specify SOL lamports, get back how much TRENCH you receive.
 */
export async function getSolSwapQuote(solLamports: number): Promise<JupiterQuote> {
  const params = new URLSearchParams({
    inputMint: SOL_MINT.toBase58(),
    outputMint: TRENCH_MINT.toBase58(),
    amount: String(solLamports),
    swapMode: 'ExactIn',
    slippageBps: String(DEFAULT_SLIPPAGE_BPS),
  });

  const res = await httpGet(`${JUPITER_QUOTE_URL}?${params}`);
  if (!res.ok) throw new Error(`Jupiter SOL quote failed (${res.status}): ${res.body}`);
  return JSON.parse(res.body);
}

/** Get SOL price in USD via Jupiter price API */
export async function getSolPrice(): Promise<number> {
  // Price API is separate from swap API
  const res = await httpGet('https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112');
  if (!res.ok) throw new Error(`Failed to fetch SOL price (${res.status})`);
  const data = JSON.parse(res.body);
  return parseFloat(data.data['So11111111111111111111111111111111111111112']?.price ?? '0');
}

/** Convert lamports string to human-readable SOL */
export function lamportsToSol(lamports: string): number {
  return parseInt(lamports, 10) / 1e9;
}

/** Format SOL amount for display */
export function formatSol(lamports: string): string {
  return lamportsToSol(lamports).toFixed(4);
}
