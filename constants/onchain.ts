import { PublicKey } from '@solana/web3.js';

// TRENCH token mint (pump.fun)
export const TRENCH_MINT = new PublicKey('BzyKa1FGjs2EUpu3GGDibY4xdygn5evAiRboKmETpump');

// Native SOL wrapped mint
export const SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

// USDC on Solana mainnet
export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
export const USDC_DECIMALS = 6;

// Treasury wallet - receives TRENCH tokens from item purchases
export const TREASURY_WALLET = new PublicKey('7ErEChc5iUg7689dmWEyPanByDtsnu35DdTdd3PyqZGa');

// TRENCH token decimals (pump.fun standard = 6)
export const TRENCH_DECIMALS = 6;

// Convert item price (whole TRENCH tokens) to raw amount (smallest unit)
export function priceToRawAmount(price: number): number {
  return Math.round(price * 10 ** TRENCH_DECIMALS);
}

// Jupiter Swap API v1 (requires free API key from portal.jup.ag)
export const JUPITER_QUOTE_URL = 'https://api.jup.ag/swap/v1/quote';
export const JUPITER_SWAP_URL = 'https://api.jup.ag/swap/v1/swap';

// Free API key from https://portal.jup.ag
export const JUPITER_API_KEY = '946d1e83-5051-4cf8-8975-c0227706578f';

// Slippage tolerance in basis points (3% = 300 bps)
export const DEFAULT_SLIPPAGE_BPS = 300;
