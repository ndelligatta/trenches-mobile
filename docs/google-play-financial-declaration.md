# Google Play Financial Features Declaration

## App: Trenches (com.trenchesgame)

This document guides the Play Console financial features declaration submission.

## Declaration Answers

### Does your app use cryptocurrency?
**Yes** — The app facilitates purchases of in-game digital items using cryptocurrency (USDC stablecoin swapped to TRENCH token via Jupiter DEX on Solana).

### Does your app provide a cryptocurrency wallet?
**No** — The app is **non-custodial**. It connects to external wallet apps (Phantom, Solflare) via Solana Mobile Wallet Adapter. The app never stores, manages, or has access to private keys.

### Does your app facilitate cryptocurrency transactions?
**Yes** — Users can purchase digital game items. The purchase flow:
1. User selects an item in the shop
2. App fetches a swap quote from Jupiter DEX API (USDC -> TRENCH token)
3. Transaction is built and sent to the user's external wallet app for signing
4. The wallet app (not our app) broadcasts the signed transaction to the Solana blockchain
5. Our server verifies the on-chain transaction and assigns the digital item

### Does your app hold, transmit, or manage user funds?
**No** — All funds remain in the user's self-custody wallet at all times. The app constructs unsigned transactions that the user must approve in their external wallet. The treasury wallet that receives payment is a standard Solana wallet address.

### Does your app provide investment or financial advice?
**No** — The TRENCH token is used exclusively as in-game currency for purchasing cosmetic game items. The app does not provide price charts, trading features, portfolio tracking, or any investment-related functionality.

## Technical Details

- **Blockchain:** Solana (mainnet-beta)
- **Token Standard:** SPL Token (TOKEN_2022_PROGRAM_ID)
- **DEX Integration:** Jupiter Swap API v1 (aggregator, not our liquidity)
- **Wallet Connection:** Solana Mobile Wallet Adapter v2.2.5 (Android intents)
- **Fallback Wallet:** Reown AppKit (WalletConnect protocol)
- **Payment Currency:** USDC (stablecoin pegged to USD)
- **In-Game Currency:** TRENCH token (Pump.fun launch, 6 decimals)
- **Treasury:** `7ErEChc5iUg7689dmWEyPanByDtsnu35DdTdd3PyqZGa`

## Legal Links

- **Privacy Policy:** https://trenchesgame.com/privacy.html
- **Terms of Service:** https://trenchesgame.com/terms.html

## Compliance Notes

1. The app does not custody any user funds
2. Users must have a pre-existing Solana wallet (Phantom/Solflare) installed
3. All transactions require explicit user approval via their wallet app
4. Items purchased are cosmetic game assets with no guaranteed resale value
5. The app includes a demo mode for reviewers who don't have Solana wallets
