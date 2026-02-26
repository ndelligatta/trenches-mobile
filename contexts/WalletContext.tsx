import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import { Connection, PublicKey, VersionedTransaction, clusterApiUrl } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppKit, useAccount, useAppKitState } from '@reown/appkit-react-native';
import {
  ensurePlayer,
  getPlayer,
  verifyPurchase,
  openPack,
  setName as setPlayerName,
  type Player,
  type VerifyPurchaseResult,
  type OpenPackResult,
} from '../lib/supabase';
import { JUPITER_API_KEY } from '../constants/onchain';
import { getUsdcSwapQuote, buildSwapTransaction } from '../lib/jupiter';

const MWA_ADDRESS_KEY = '@trenches_mwa_address';
const MWA_AUTH_TOKEN_KEY = '@trenches_mwa_auth_token';

const CLUSTER = 'mainnet-beta';
const APP_IDENTITY = {
  name: 'Trenches',
  uri: 'https://trenchesgame.com',
  icon: 'favicon.ico',
};

// Lazy-load MWA transact — must verify native module exists BEFORE require()
// because the MWA package uses TurboModuleRegistry.getEnforcing() at module scope
// which throws a fatal error if the native module isn't registered.
let mwaTransact: any = null;
let mwaChecked = false;
function getTransact() {
  if (mwaTransact) return mwaTransact;
  if (mwaChecked) return null; // already checked and failed
  if (Platform.OS === 'web') { mwaChecked = true; return null; }

  // Check native module exists BEFORE requiring the JS package
  const { TurboModuleRegistry } = require('react-native');
  if (!TurboModuleRegistry.get('SolanaMobileWalletAdapter')) {
    mwaChecked = true;
    return null;
  }

  try {
    const mod = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');
    mwaTransact = mod.transact;
  } catch (e) {
    console.warn('[MWA] require failed:', e);
    mwaTransact = null;
    mwaChecked = true;
  }
  return mwaTransact;
}

interface WalletContextType {
  address: string | undefined;
  connected: boolean;
  connecting: boolean;
  balance: number | null;
  player: Player | null;
  playerName: string | null;
  playerLoading: boolean;
  connectMWA: () => Promise<void>;
  openWalletModal: () => void;
  disconnect: () => void;
  refreshPlayer: () => Promise<void>;
  updatePlayerName: (name: string) => Promise<void>;
  purchaseItem: (itemId: string, price: number) => Promise<VerifyPurchaseResult | boolean>;
  purchasePack: (packId: string, price: number) => Promise<OpenPackResult | false>;
  connection: Connection;
  connectedVia: 'mwa' | 'appkit' | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { open, disconnect: appKitDisconnect } = useAppKit();
  const { address: appKitRawAddress, isConnected: appKitConnected } = useAccount();
  const { isLoading: appKitLoading } = useAppKitState();

  // MWA-specific state
  const [mwaAddress, setMwaAddress] = useState<string | null>(null);
  const [mwaConnecting, setMwaConnecting] = useState(false);
  const mwaAuthTokenRef = useRef<string | null>(null);

  // Shared state
  const [balance, setBalance] = useState<number | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerNameState] = useState<string | null>(null);
  const [playerLoading, setPlayerLoading] = useState(false);

  const connectionRef = useRef(new Connection(clusterApiUrl(CLUSTER)));
  const prevAddressRef = useRef<string | undefined>(undefined);

  // Restore saved MWA wallet on mount
  useEffect(() => {
    (async () => {
      try {
        const savedAddr = await AsyncStorage.getItem(MWA_ADDRESS_KEY);
        const savedToken = await AsyncStorage.getItem(MWA_AUTH_TOKEN_KEY);
        if (savedAddr) {
          setMwaAddress(savedAddr);
          mwaAuthTokenRef.current = savedToken;
        }
      } catch {}
    })();
  }, []);

  // Determine active connection: MWA takes priority
  const connectedVia: 'mwa' | 'appkit' | null = mwaAddress
    ? 'mwa'
    : appKitConnected
      ? 'appkit'
      : null;

  // Parse CAIP address if needed for AppKit
  const appKitAddress = appKitRawAddress?.includes(':')
    ? appKitRawAddress.split(':').pop()
    : appKitRawAddress;

  // The active address from whichever connection method is active
  const address = mwaAddress ?? (appKitConnected ? appKitAddress : undefined);
  const connected = !!address;
  const connecting = mwaConnecting || appKitLoading;

  // MWA connect — primary method for Seeker
  const connectMWA = useCallback(async () => {
    const transact = getTransact();
    if (!transact) {
      Alert.alert(
        'Wallet Not Available',
        'Mobile Wallet Adapter is not available on this device. Try other login options.',
      );
      return;
    }

    setMwaConnecting(true);
    try {
      await transact(async (wallet: any) => {
        const authResult = await wallet.authorize({
          cluster: CLUSTER,
          identity: APP_IDENTITY,
        });

        // MWA protocol returns address as base64 string — decode to bytes for PublicKey
        const rawAddr = authResult.accounts[0].address;
        let pubkey: PublicKey;
        if (typeof rawAddr === 'string') {
          // Base64 string from MWA protocol
          const bytes = Buffer.from(rawAddr, 'base64');
          pubkey = new PublicKey(bytes);
        } else {
          // Uint8Array (some versions)
          pubkey = new PublicKey(new Uint8Array(rawAddr));
        }
        const addr = pubkey.toBase58();
        mwaAuthTokenRef.current = authResult.auth_token;
        setMwaAddress(addr);
        // Persist wallet address + auth token
        AsyncStorage.setItem(MWA_ADDRESS_KEY, addr).catch(() => {});
        if (authResult.auth_token) {
          AsyncStorage.setItem(MWA_AUTH_TOKEN_KEY, authResult.auth_token).catch(() => {});
        }
      });
    } catch (err) {
      console.error('MWA connection failed:', err);
    }
    setMwaConnecting(false);
  }, []);

  // AppKit modal — secondary option (Google login, etc.)
  const openWalletModal = useCallback(() => {
    open();
  }, [open]);

  // Disconnect whichever method is active
  const disconnect = useCallback(() => {
    if (mwaAddress) {
      mwaAuthTokenRef.current = null;
      setMwaAddress(null);
      AsyncStorage.multiRemove([MWA_ADDRESS_KEY, MWA_AUTH_TOKEN_KEY]).catch(() => {});
    }
    if (appKitConnected) {
      appKitDisconnect();
    }
    setBalance(null);
    setPlayer(null);
    setPlayerNameState(null);
    prevAddressRef.current = undefined;
  }, [mwaAddress, appKitConnected, appKitDisconnect]);

  // Sync player data when address changes (works for both MWA and AppKit)
  useEffect(() => {
    if (!address) {
      if (prevAddressRef.current) {
        setBalance(null);
        setPlayer(null);
        setPlayerNameState(null);
      }
      prevAddressRef.current = undefined;
      return;
    }

    if (address === prevAddressRef.current) return;
    prevAddressRef.current = address;

    let cancelled = false;

    (async () => {
      setPlayerLoading(true);

      // Fetch SOL balance
      try {
        const lamports = await connectionRef.current.getBalance(new PublicKey(address));
        if (!cancelled) setBalance(lamports / 1e9);
      } catch {
        if (!cancelled) setBalance(null);
      }

      // Ensure player exists + fetch data from Supabase
      try {
        await ensurePlayer(address);
        const { data } = await getPlayer(address);
        if (!cancelled && data) {
          setPlayer(data);
          setPlayerNameState(data.name);
        }
      } catch (err) {
        console.error('Failed to load player:', err);
      }

      if (!cancelled) setPlayerLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [address]);

  const refreshPlayer = useCallback(async () => {
    if (!address) return;
    setPlayerLoading(true);
    try {
      const { data } = await getPlayer(address);
      if (data) {
        setPlayer(data);
        setPlayerNameState(data.name);
      }
    } catch (err) {
      console.error('Failed to refresh player:', err);
    }
    setPlayerLoading(false);
  }, [address]);

  const updatePlayerName = useCallback(
    async (name: string) => {
      if (!address) return;
      const { error } = await setPlayerName(address, name);
      if (error) {
        Alert.alert('Error', 'Failed to update name');
        return;
      }
      setPlayerNameState(name);
      if (player) setPlayer({ ...player, name });
    },
    [address, player],
  );

  /**
   * On-chain purchase flow (USDC → TRENCH):
   * 1. Get Jupiter quote (USDC → TRENCH, ExactIn)
   * 2. User confirms USD cost
   * 3. Build swap tx via Jupiter (TRENCH goes to treasury)
   * 4. Sign & send via MWA
   * 5. Confirm on-chain
   * 6. Record purchase in Supabase
   *
   * price param = USD amount (e.g. 5 = $5 USDC)
   */
  const purchaseItem = useCallback(
    async (itemId: string, price: number): Promise<VerifyPurchaseResult | boolean> => {
      console.log(`[PURCHASE] ========== START ==========`);
      console.log(`[PURCHASE] itemId=${itemId}, price=$${price}, wallet=${address}, connectedVia=${connectedVia}`);

      if (!address) { console.log('[PURCHASE] ABORT: no address'); return false; }

      if (!JUPITER_API_KEY) {
        console.log('[PURCHASE] ABORT: no Jupiter API key');
        Alert.alert('Setup Required', 'Jupiter API key not configured. See constants/onchain.ts.');
        return false;
      }

      if (connectedVia !== 'mwa') {
        console.log('[PURCHASE] ABORT: not connected via MWA, connectedVia=' + connectedVia);
        Alert.alert('Wallet Required', 'Connect via Seed Vault / Mobile Wallet to make purchases.');
        return false;
      }

      const transact = getTransact();
      if (!transact) {
        console.log('[PURCHASE] ABORT: MWA transact() not available');
        Alert.alert('Error', 'Mobile Wallet Adapter not available.');
        return false;
      }

      // No client-side "already owned" check — the edge function handles duplicates
      // and some items can be bought multiple times (different serial numbers)

      try {
        // Step 1: Get Jupiter quote (USDC → TRENCH)
        console.log(`[PURCHASE] Step 1: Getting Jupiter quote for $${price} USDC...`);
        const quoteStart = Date.now();
        const quote = await getUsdcSwapQuote(price);
        console.log(`[PURCHASE] Step 1 DONE in ${Date.now() - quoteStart}ms — inAmount=${quote.inAmount}, outAmount=${quote.outAmount}`);

        // Step 2: User confirmation
        console.log('[PURCHASE] Step 2: Waiting for user confirmation...');
        const confirmed = await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Confirm Purchase',
            `This will charge $${price.toFixed(2)} USDC from your wallet.\n\nProceed?`,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Buy Now', onPress: () => resolve(true) },
            ],
          );
        });

        if (!confirmed) { console.log('[PURCHASE] ABORT: user cancelled'); return false; }
        console.log('[PURCHASE] Step 2 DONE: user confirmed');

        // Step 3: Build swap transaction (TRENCH goes to treasury)
        console.log('[PURCHASE] Step 3: Building swap transaction...');
        const buildStart = Date.now();
        const swapTxBase64 = await buildSwapTransaction(quote, address);
        console.log(`[PURCHASE] Step 3 DONE in ${Date.now() - buildStart}ms — tx base64 length=${swapTxBase64.length}`);
        const swapTxBytes = Buffer.from(swapTxBase64, 'base64');
        const transaction = VersionedTransaction.deserialize(new Uint8Array(swapTxBytes));

        // Step 4: Sign & send via MWA
        console.log('[PURCHASE] Step 4: Opening MWA for signing...');
        const mwaStart = Date.now();
        let txSignatureBytes: Uint8Array | undefined;
        await transact(async (wallet: any) => {
          console.log('[PURCHASE] Step 4a: Authorizing with MWA wallet...');
          const authResult = await wallet.authorize({
            cluster: CLUSTER,
            identity: APP_IDENTITY,
            auth_token: mwaAuthTokenRef.current,
          });
          mwaAuthTokenRef.current = authResult.auth_token;
          if (authResult.auth_token) {
            AsyncStorage.setItem(MWA_AUTH_TOKEN_KEY, authResult.auth_token).catch(() => {});
          }
          console.log('[PURCHASE] Step 4b: Signing and sending transaction...');
          const signatures = await wallet.signAndSendTransactions({
            transactions: [transaction],
          });
          txSignatureBytes = signatures[0];
          console.log(`[PURCHASE] Step 4c: Got signature bytes, length=${txSignatureBytes?.length}`);
        });
        console.log(`[PURCHASE] Step 4 DONE: MWA returned in ${Date.now() - mwaStart}ms`);

        if (!txSignatureBytes) {
          throw new Error('No transaction signature returned');
        }

        // MWA signAndSendTransactions returns the tx signature.
        // On Seeker/Saga it comes back as a BASE58 STRING already (not base64, not raw bytes).
        // If it's a Uint8Array, encode it to base58. If it's a string, use it directly.
        const bs58 = require('bs58');
        let txSignature: string;
        if (typeof txSignatureBytes === 'string') {
          // MWA returned a string — it's already base58
          txSignature = txSignatureBytes;
          console.log(`[PURCHASE] Signature is string (base58), length=${txSignature.length}`);
        } else {
          // Raw bytes — encode to base58
          const sigBytes = new Uint8Array(txSignatureBytes);
          console.log(`[PURCHASE] Signature is Uint8Array, length=${sigBytes.length}`);
          txSignature = bs58.encode(sigBytes);
        }
        console.log(`[PURCHASE] Transaction signature: ${txSignature} (len=${txSignature.length})`);

        // After MWA returns, Android needs time to restore networking AND
        // the transaction needs time to propagate across Solana validators.
        console.log('[PURCHASE] Step 5: Waiting 5s for Android networking + Solana tx propagation...');
        await new Promise(r => setTimeout(r, 5000));
        console.log('[PURCHASE] Step 5: 5s wait done, starting network calls with retry logic...');

        // Retry helper — retries with delay when calls fail after MWA
        const retry = async <T,>(label: string, fn: () => Promise<T>, attempts = 5, delayMs = 2000): Promise<T> => {
          for (let i = 0; i < attempts; i++) {
            try {
              console.log(`[PURCHASE] [${label}] attempt ${i + 1}/${attempts}...`);
              const start = Date.now();
              const result = await fn();
              console.log(`[PURCHASE] [${label}] attempt ${i + 1} SUCCESS in ${Date.now() - start}ms`);
              return result;
            } catch (err: any) {
              console.warn(`[PURCHASE] [${label}] attempt ${i + 1} FAILED: ${err?.message?.slice(0, 120)}`);
              // Non-retryable errors (e.g. edge function says "sold out") — fail immediately
              if (err?.nonRetryable) {
                console.error(`[PURCHASE] [${label}] NON-RETRYABLE — stopping`);
                throw err;
              }
              if (i < attempts - 1) {
                console.log(`[PURCHASE] [${label}] waiting ${delayMs}ms before retry...`);
                await new Promise(r => setTimeout(r, delayMs));
                continue;
              }
              throw err;
            }
          }
          throw new Error('All retries exhausted');
        };

        // Step 6: Verify purchase and assign numbered unit via Edge Function
        // This is the ONLY purchase path — no legacy fallback. If this fails, user sees the error.
        console.log('[PURCHASE] Step 6: Calling verify-purchase Edge Function...');
        // 8 attempts, 3s apart = up to 24s of retrying for tx propagation
        const verifyResult = await retry('verify-purchase', async () => {
          const result = await verifyPurchase(txSignature, address, itemId, price);
          console.log(`[PURCHASE] [verify-purchase] response: ${JSON.stringify(result).slice(0, 300)}`);
          if (result?.error) {
            // Retryable: tx hasn't propagated to Solana yet
            if (result.error.includes('not found') || result.error.includes('confirming')) {
              throw new Error(result.error);
            }
            // Non-retryable: bad signature, insufficient funds, sold out, etc.
            const fatal = new Error(result.error);
            (fatal as any).nonRetryable = true;
            throw fatal;
          }
          if (!result?.success) {
            const fatal = new Error('Edge function returned no success flag');
            (fatal as any).nonRetryable = true;
            throw fatal;
          }
          return result;
        }, 8, 3000);

        console.log(`[PURCHASE] Step 6 SUCCESS: ${verifyResult.name} #${verifyResult.serial_number} (unit_id=${verifyResult.unit_id})`);

        // Step 7: Refresh balance
        console.log('[PURCHASE] Step 7: Refreshing balance...');
        try {
          const lamports = await retry('balance', () =>
            connectionRef.current.getBalance(new PublicKey(address))
          );
          setBalance(lamports / 1e9);
          console.log(`[PURCHASE] Step 7 SUCCESS: balance=${lamports / 1e9} SOL`);
        } catch (e: any) {
          console.error(`[PURCHASE] Step 7 balance refresh failed (non-critical): ${e?.message}`);
        }

        console.log(`[PURCHASE] ========== COMPLETE ==========`);
        return verifyResult;
      } catch (err: any) {
        console.error(`[PURCHASE] ========== FATAL ERROR: ${err?.message} ==========`);
        console.error('[PURCHASE] Full error:', err);
        const msg = err?.message || 'Something went wrong';
        if (msg.includes('User rejected') || msg.includes('declined')) {
          Alert.alert('Cancelled', 'Transaction was cancelled.');
        } else if (msg.includes('Jupiter') && msg.includes('quote')) {
          Alert.alert('Swap Unavailable', 'Could not get a swap route. Try again later.');
        } else {
          Alert.alert('Purchase Failed', msg);
        }
        return false;
      }
    },
    [address, player, balance, connectedVia],
  );

  /**
   * Pack purchase flow — same on-chain flow as purchaseItem but calls open-pack
   * edge function instead of verify-purchase.
   */
  const purchasePack = useCallback(
    async (packId: string, price: number): Promise<OpenPackResult | false> => {
      console.log(`[PACK] ========== START ==========`);
      console.log(`[PACK] packId=${packId}, price=$${price}, wallet=${address}, connectedVia=${connectedVia}`);

      if (!address) { console.log('[PACK] ABORT: no address'); return false; }

      if (!JUPITER_API_KEY) {
        console.log('[PACK] ABORT: no Jupiter API key');
        Alert.alert('Setup Required', 'Jupiter API key not configured.');
        return false;
      }

      if (connectedVia !== 'mwa') {
        console.log('[PACK] ABORT: not connected via MWA');
        Alert.alert('Wallet Required', 'Connect via Seed Vault / Mobile Wallet to open packs.');
        return false;
      }

      const transact = getTransact();
      if (!transact) {
        Alert.alert('Error', 'Mobile Wallet Adapter not available.');
        return false;
      }

      try {
        // Step 1: Get Jupiter quote
        console.log(`[PACK] Step 1: Getting Jupiter quote for $${price} USDC...`);
        const quote = await getUsdcSwapQuote(price);
        console.log(`[PACK] Step 1 DONE — inAmount=${quote.inAmount}, outAmount=${quote.outAmount}`);

        // Step 2: User confirmation
        const confirmed = await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Open Pack',
            `This will charge $${price.toFixed(2)} USDC to open a pack.\n\nProceed?`,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Open Pack', onPress: () => resolve(true) },
            ],
          );
        });

        if (!confirmed) { console.log('[PACK] ABORT: user cancelled'); return false; }

        // Step 3: Build swap tx
        console.log('[PACK] Step 3: Building swap transaction...');
        const swapTxBase64 = await buildSwapTransaction(quote, address);
        const swapTxBytes = Buffer.from(swapTxBase64, 'base64');
        const transaction = VersionedTransaction.deserialize(new Uint8Array(swapTxBytes));

        // Step 4: Sign & send via MWA
        console.log('[PACK] Step 4: Opening MWA for signing...');
        let txSignatureBytes: Uint8Array | undefined;
        await transact(async (wallet: any) => {
          const authResult = await wallet.authorize({
            cluster: CLUSTER,
            identity: APP_IDENTITY,
            auth_token: mwaAuthTokenRef.current,
          });
          mwaAuthTokenRef.current = authResult.auth_token;
          if (authResult.auth_token) {
            AsyncStorage.setItem(MWA_AUTH_TOKEN_KEY, authResult.auth_token).catch(() => {});
          }
          const signatures = await wallet.signAndSendTransactions({
            transactions: [transaction],
          });
          txSignatureBytes = signatures[0];
        });

        if (!txSignatureBytes) throw new Error('No transaction signature returned');

        const bs58 = require('bs58');
        let txSignature: string;
        if (typeof txSignatureBytes === 'string') {
          txSignature = txSignatureBytes;
        } else {
          txSignature = bs58.encode(new Uint8Array(txSignatureBytes));
        }
        console.log(`[PACK] Transaction signature: ${txSignature}`);

        // Step 5: Wait for propagation
        console.log('[PACK] Step 5: Waiting 5s for tx propagation...');
        await new Promise(r => setTimeout(r, 5000));

        // Retry helper
        const retry = async <T,>(label: string, fn: () => Promise<T>, attempts = 8, delayMs = 3000): Promise<T> => {
          for (let i = 0; i < attempts; i++) {
            try {
              console.log(`[PACK] [${label}] attempt ${i + 1}/${attempts}...`);
              const result = await fn();
              console.log(`[PACK] [${label}] attempt ${i + 1} SUCCESS`);
              return result;
            } catch (err: any) {
              console.warn(`[PACK] [${label}] attempt ${i + 1} FAILED: ${err?.message?.slice(0, 120)}`);
              if (err?.nonRetryable) throw err;
              if (i < attempts - 1) {
                await new Promise(r => setTimeout(r, delayMs));
                continue;
              }
              throw err;
            }
          }
          throw new Error('All retries exhausted');
        };

        // Step 6: Call open-pack edge function
        console.log('[PACK] Step 6: Calling open-pack Edge Function...');
        const packResult = await retry('open-pack', async () => {
          const result = await openPack(txSignature, address, packId, price);
          console.log(`[PACK] [open-pack] response: ${JSON.stringify(result).slice(0, 300)}`);
          if (result?.error) {
            if (result.error.includes('not found') || result.error.includes('confirming')) {
              throw new Error(result.error);
            }
            const fatal = new Error(result.error);
            (fatal as any).nonRetryable = true;
            throw fatal;
          }
          if (!result?.success) {
            const fatal = new Error('Edge function returned no success flag');
            (fatal as any).nonRetryable = true;
            throw fatal;
          }
          return result;
        });

        console.log(`[PACK] Step 6 SUCCESS: ${packResult.name} #${packResult.serial_number}`);

        // Step 7: Refresh balance
        try {
          const lamports = await connectionRef.current.getBalance(new PublicKey(address));
          setBalance(lamports / 1e9);
        } catch {}

        console.log(`[PACK] ========== COMPLETE ==========`);
        return packResult;
      } catch (err: any) {
        console.error(`[PACK] ========== FATAL ERROR: ${err?.message} ==========`);
        const msg = err?.message || 'Something went wrong';
        if (msg.includes('User rejected') || msg.includes('declined')) {
          Alert.alert('Cancelled', 'Transaction was cancelled.');
        } else if (msg.includes('Jupiter') && msg.includes('quote')) {
          Alert.alert('Swap Unavailable', 'Could not get a swap route. Try again later.');
        } else {
          Alert.alert('Pack Opening Failed', msg);
        }
        return false;
      }
    },
    [address, player, balance, connectedVia],
  );

  return (
    <WalletContext.Provider
      value={{
        address,
        connected,
        connecting,
        balance,
        player,
        playerName,
        playerLoading,
        connectMWA,
        openWalletModal,
        disconnect,
        refreshPlayer,
        updatePlayerName,
        purchaseItem,
        purchasePack,
        connection: connectionRef.current,
        connectedVia,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
