# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trenches Mobile is a React Native/Expo item shop for the Trenches game, built for the Solana Seeker phone. It connects to Solana wallets via dual adapter (MWA primary, Reown AppKit secondary), processes on-chain purchases through Jupiter swaps (USDC -> TRENCH), and persists player data in Supabase.

## Build & Run Commands

```bash
npm install                    # Install dependencies
npx expo run:android           # Full native build (required first time + after native dep changes)
npx expo start                 # Start Metro bundler (JS-only changes, after dev client is installed)
npx expo prebuild --clean      # Clean native project (re-add gradle.properties after)
```

**No Expo Go** - custom MWA native modules require a dev client build via `npx expo run:android`.

**No tests or linter configured** - the project has no test framework or lint scripts.

**JDK 17 required** - JDK 21 causes CMake build errors. Set `org.gradle.java.home` in `android/gradle.properties` if needed.

After `prebuild --clean`, re-add `org.gradle.java.home` to `android/gradle.properties` and `sdk.dir` to `android/local.properties`.

## Architecture

### Dual Wallet Connection

`contexts/WalletContext.tsx` manages both wallet methods and exposes a unified context:
- **MWA (primary):** `transact()` sends Android intents to Seed Vault/Phantom/Solflare. Returns base64-encoded address that must be decoded to bytes then to base58 PublicKey.
- **Reown AppKit (secondary):** `lib/appkit.ts` configures Google OAuth + WalletConnect. Returns CAIP addresses (`solana:mainnet-beta:ADDRESS`) that must be stripped to raw base58.

Both methods produce the same raw wallet address used as primary key in Supabase `players` table.

### Purchase Flow (item/[id].tsx -> WalletContext.purchaseItem)

1. Get Jupiter quote (USDC -> TRENCH, ExactIn)
2. User confirms USD cost via Alert
3. Build swap transaction (TRENCH sent to treasury)
4. Sign & send via MWA `signAndSendTransactions()`
5. Record purchase in Supabase with tx signature

### On-Chain Integration

- `constants/onchain.ts` - Token mints (TRENCH, SOL, USDC), treasury wallet, Jupiter API config
- `lib/jupiter.ts` - Jupiter Swap API v1 wrapper. Uses XMLHttpRequest (not fetch) because WalletConnect's whatwg-fetch polyfill is broken
- Treasury wallet's TRENCH ATA uses **TOKEN_2022_PROGRAM_ID** (not standard SPL) - must pass `destinationTokenAccount` explicitly to Jupiter

### Backend (Supabase)

- `lib/supabase.ts` - Client + RPC wrappers
- No auth layer, anon key only. Player identity = wallet address
- Server-side RPCs: `ensure_player`, `get_player_name`, `set_name`, `add_currency`, `record_game`, `add_purchased_item`, `set_purchased_items`

### Routing (Expo Router, file-based)

- `app/_layout.tsx` - Root layout with providers (WalletContext, AppKit)
- `app/index.tsx` - Shop home with tabbed navigation (Shop, Market, Packs, Inventory, Rewards)
- `app/item/[id].tsx` - Item detail + purchase
- `app/pack-opening.tsx` - Pack opening animation (WebView + model-viewer)
- `app/profile.tsx` - Player profile, stats, inventory
- `app/test-swap.tsx` - Dev tool for testing USDC -> TRENCH swaps

## Critical Polyfill Order (index.ts)

```
@walletconnect/react-native-compat  ← MUST be first import
react-native-get-random-values
text-encoding
buffer (globalThis.Buffer)
expo-router/entry
```

Changing this order breaks crypto and wallet operations at runtime.

## Key Conventions

- **Path alias:** `@/*` maps to project root (tsconfig)
- **Styling:** `StyleSheet.create()` with theme constants from `constants/theme.ts`
- **Babel:** `unstable_transformImportMeta: true` required for Reown AppKit
- **New architecture:** Enabled in app.json (`newArchEnabled: true`), Expo SDK 54 + RN 0.81
- **3D models:** `components/shop/ModelViewer.tsx` loads glTF/GLB via WebView + model-viewer library

## Environment Variables

Defined in `.env` (see `.env.example`):
- `EXPO_PUBLIC_APPKIT_PROJECT_ID` - Reown project ID
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `EXPO_PUBLIC_TREASURY_WALLET` - Treasury wallet address

## Web Reference: our-trenches

This mobile app is a port of the web app at `../our-trenches/` (vanilla HTML/CSS/JS, deployed on Netlify). The web version is the source of truth for item data, UI design, and feature parity.

### Web App Pages -> Mobile Mapping

| Web Page | Mobile Screen | Port Status |
|----------|--------------|-------------|
| `index.html` (homepage + hero carousel) | N/A - mobile doesn't need landing page | Not needed |
| `item-shop.html` (7 scrollable collections) | `app/index.tsx` Shop tab (2-col grid + category filters) | Ported (adapted layout) |
| `marketplace.html` (filter sidebar, sort, grid) | `app/index.tsx` Market tab | Stub only ("Coming Soon") |
| `item-detail.html` (3D viewer + specs + buy) | `app/item/[id].tsx` | Ported (with real purchase flow) |
| `leaderboard.html` (kills/wins table from Supabase) | Not yet implemented | Missing |
| `rewards.html` (player stats + SOL balance) | `app/profile.tsx` (partial) | Partial |

### Web Features Not Yet in Mobile

- **Marketplace with filters** - Web has full filter sidebar (search, price range, type, rarity, collection, color) + sort (price, name, rarity, newest) + category tabs (All/Skins/Weapons). Mobile just shows "Coming Soon."
- **Leaderboard** - Web fetches `getLeaderboard()` from Supabase, shows sortable table (kills/wins) with top-3 gold/silver/bronze styling. No mobile screen exists.
- **Rewards/Stats page** - Web shows: display name, wallet address, SOL balance (via Solana RPC), 6-stat grid (Wins, Total Kills, Games Played, Win Rate, Avg Placement, $TRENCHES). Mobile `profile.tsx` has some of this but layout differs.
- **My Collection view** - Web marketplace supports `?collection=true` to filter to owned items from localStorage. Mobile inventory tab is a stub.
- **Item Shop horizontal sections** - Web shop has 7 horizontally-scrollable rows with left/right arrows + dot nav. Mobile uses a flat 2-column grid with filter chips instead.

### Item Data Parity

Web item catalog lives in `../our-trenches/marketplace-data.js` (21 canonical items + the `ITEMS` array). Mobile's `constants/items.ts` mirrors this with 21 marketplace items plus 3 featured-only items (Ibiza Boss, Unicorn Fart Dust, Labubu).

Items with 3D models (15 total): giga-sword, 300-rise-of-chad, chad-commandant, chill-sensei, chill-tana, gaspy, caesar, lily-pad-staff, dogwifhat, thug-lyfe, moon-bound, sword-fish, nietzsche-penguin, pump-pill, pump-pill-founder, a1lon9

GLB files are hosted at `https://trenchesgame.com/` and loaded via ModelViewer WebView.

### Web Supabase Functions (shared backend)

Both web and mobile use the same Supabase instance (`ouhzztijvgrvjpdvgido.supabase.co`). The web client at `../our-trenches/supabase-client.js` exposes the same RPCs the mobile app uses, plus:
- `ensurePlayerWithName(wallet, name)` - not used in mobile yet
- `getLeaderboard(orderBy, limit)` - queries `players` table ordered by `total_kills` or `games_won`, returns top N. Not used in mobile yet.
- `getPlayerByWallet(wallet)` - alias for `getPlayer`, used by rewards page
