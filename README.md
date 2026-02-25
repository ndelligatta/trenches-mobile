# Trenches Mobile - Item Shop

Mobile item shop for the Trenches game, built for the **Solana Seeker** phone. Uses **Mobile Wallet Adapter (MWA)** + **Seed Vault** as the primary wallet connection, with **Reown AppKit** as a secondary login option (Google social login, WalletConnect). Player data is stored in **Supabase**, shared with the Trenches Unity game on Epic Games Store.

## Prerequisites

- **Node.js** 18+
- **JDK 17** (JDK 21 causes CMake build errors)
- **Android SDK** with an emulator or physical device
- **Android Studio** (for emulator management)

### Verify JDK 17

```bash
java -version
# Should show 17.x
```

If you have multiple JDKs, set `org.gradle.java.home` in `android/gradle.properties`:

```properties
org.gradle.java.home=C:\\Program Files\\Java\\jdk-17
```

### Android SDK

Set your SDK path in `android/local.properties`:

```properties
sdk.dir=C:\\Users\\YOUR_USER\\AppData\\Local\\Android\\Sdk
```

## Install

```bash
npm install
```

## Running the App

**IMPORTANT:** This app uses custom native modules (MWA). You **cannot** use Expo Go or `npx expo start` alone. You must build the native dev client.

### First time (or after native dependency changes)

```bash
npx expo run:android
```

This command:
1. Runs `expo prebuild` to generate the native Android project
2. Compiles all native code (including MWA native module)
3. Builds and installs the APK on the connected device/emulator
4. Starts the Metro JS bundler

### Subsequent JS-only changes

Once the dev client is installed on the device, you can just start Metro:

```bash
npx expo start
```

The dev client on the device will connect to Metro automatically. But if you add/remove any npm packages with native code, you need `npx expo run:android` again.

### Clean rebuild

If you hit weird native build issues:

```bash
npx expo prebuild --clean
```

Then re-add these to `android/gradle.properties` (prebuild wipes them):

```properties
org.gradle.java.home=C:\\Program Files\\Java\\jdk-17
```

And re-add `android/local.properties`:

```properties
sdk.dir=C:\\Users\\YOUR_USER\\AppData\\Local\\Android\\Sdk
```

Then build:

```bash
npx expo run:android
```

## Architecture

### Wallet Connection (Dual Adapter)

| Method | When | How |
|--------|------|-----|
| **MWA / Seed Vault** | Primary - Seeker devices | `Connect Wallet` button triggers `transact()` via Mobile Wallet Adapter protocol |
| **Reown AppKit** | Secondary - fallback | `More` button opens AppKit modal (Google login, WalletConnect) |

Both methods produce the same raw Solana wallet address, which is the primary key in Supabase. A user connecting via MWA on Seeker and via Reown on the web game shares the same player account.

### Key Files

| File | Purpose |
|------|---------|
| `contexts/WalletContext.tsx` | Dual wallet adapter - MWA primary, AppKit secondary. Syncs player data to Supabase on connect. |
| `lib/appkit.ts` | Reown AppKit initialization (project ID, Solana networks, social login config) |
| `lib/supabase.ts` | Supabase client + RPC wrappers (`ensurePlayer`, `getPlayer`, `addCurrency`, etc.) |
| `components/shop/WalletButton.tsx` | Login UI - "Connect Wallet" (MWA) + "More" (AppKit) |
| `app/item/[id].tsx` | Item detail + purchase flow |
| `index.ts` | Polyfill setup - `@walletconnect/react-native-compat` must be first import |
| `babel.config.js` | Required `unstable_transformImportMeta` for AppKit compatibility |

### Backend (Supabase)

- **URL:** `https://ouhzztijvgrvjpdvgido.supabase.co`
- **Table:** `players` keyed by `wallet_address` (raw base58 string)
- **RPCs:** `ensure_player`, `get_player_name`, `set_name`, `add_currency`, `record_game`, `add_purchased_item`, `set_purchased_items`
- No auth layer - uses anon key only. Player identity = wallet address.

### Solana Mobile Stack

This app demonstrates:
- **Mobile Wallet Adapter (MWA)** protocol for wallet connections
- **Seed Vault** compatibility on Seeker devices
- Native Android integration via TurboModules (React Native new architecture)

The MWA native module (`@solana-mobile/mobile-wallet-adapter-protocol`) is auto-linked during the build. The `transact()` function from `@solana-mobile/mobile-wallet-adapter-protocol-web3js` sends Android intents to whatever MWA-compatible wallet is on the device (Seed Vault on Seeker, Phantom/Solflare on other devices).

## Testing MWA on Emulator

MWA requires a wallet app that supports the protocol. On a real Seeker, Seed Vault is built in. On an emulator:

1. Install a MWA-compatible wallet (Solflare, or build the [Mock MWA Wallet](https://github.com/nicdelligatta/mock-mwa-wallet))
2. Run the app with `npx expo run:android`
3. Tap "Connect Wallet" - the MWA protocol will find the wallet app

## Tech Stack

- **Expo SDK 54** + React Native 0.81 (new architecture)
- **Solana Mobile Wallet Adapter** v2.2.5
- **Reown AppKit** v2.0.2 (Solana adapter)
- **Supabase** v2.97
- **TypeScript**
