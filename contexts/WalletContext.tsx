import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import { Connection, PublicKey, VersionedTransaction, clusterApiUrl } from '@solana/web3.js';
import { useAppKit, useAccount, useAppKitState } from '@reown/appkit-react-native';
import {
  ensurePlayer,
  getPlayer,
  addPurchasedItem,
  setName as setPlayerName,
  type Player,
} from '../lib/supabase';
import { JUPITER_API_KEY } from '../constants/onchain';
import { getUsdcSwapQuote, buildSwapTransaction } from '../lib/jupiter';

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
  purchaseItem: (itemId: string, price: number) => Promise<boolean>;
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
    async (itemId: string, price: number): Promise<boolean> => {
      if (!address) return false;

      if (!JUPITER_API_KEY) {
        Alert.alert('Setup Required', 'Jupiter API key not configured. See constants/onchain.ts.');
        return false;
      }

      // MWA required for transaction signing
      if (connectedVia !== 'mwa') {
        Alert.alert(
          'Wallet Required',
          'Connect via Seed Vault / Mobile Wallet to make purchases.',
        );
        return false;
      }

      const transact = getTransact();
      if (!transact) {
        Alert.alert('Error', 'Mobile Wallet Adapter not available.');
        return false;
      }

      // Check if already owned
      if (player?.purchased_items?.[itemId]) {
        Alert.alert('Already Owned', 'You already own this item.');
        return false;
      }

      try {
        // Step 1: Get Jupiter quote (USDC → TRENCH)
        const quote = await getUsdcSwapQuote(price);

        // Step 2: User confirmation
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

        if (!confirmed) return false;

        // Step 3: Build swap transaction (TRENCH goes to treasury)
        const swapTxBase64 = await buildSwapTransaction(quote, address);
        const swapTxBytes = Buffer.from(swapTxBase64, 'base64');
        const transaction = VersionedTransaction.deserialize(new Uint8Array(swapTxBytes));

        // Step 4: Sign & send via MWA
        let txSignatureBytes: Uint8Array | undefined;
        await transact(async (wallet: any) => {
          const authResult = await wallet.authorize({
            cluster: CLUSTER,
            identity: APP_IDENTITY,
            auth_token: mwaAuthTokenRef.current,
          });
          mwaAuthTokenRef.current = authResult.auth_token;

          const signatures = await wallet.signAndSendTransactions({
            transactions: [transaction],
          });
          txSignatureBytes = signatures[0];
        });

        if (!txSignatureBytes) {
          throw new Error('No transaction signature returned');
        }

        // Convert signature bytes to base58 for confirmation
        const bs58 = require('bs58');
        const txSignature: string = bs58.encode(Buffer.from(txSignatureBytes));

        // Step 5: Confirm on-chain (best-effort — tx is already sent)
        try {
          const latestBlockhash = await connectionRef.current.getLatestBlockhash('confirmed');
          await connectionRef.current.confirmTransaction(
            {
              signature: txSignature,
              blockhash: latestBlockhash.blockhash,
              lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            },
            'confirmed',
          );
        } catch {
          // Confirmation RPC may fail due to polyfill, but tx was already submitted
          console.warn('Confirmation check failed, tx was already sent:', txSignature);
        }

        // Step 6: Record in Supabase
        const { error: itemErr } = await addPurchasedItem(address, itemId, txSignature);
        if (itemErr) console.error('Failed to record purchase in DB:', itemErr);

        // Refresh player data + balance
        try {
          const [{ data }, lamports] = await Promise.all([
            getPlayer(address),
            connectionRef.current.getBalance(new PublicKey(address)),
          ]);
          if (data) {
            setPlayer(data);
            setPlayerNameState(data.name);
          }
          setBalance(lamports / 1e9);
        } catch (e) {
          console.error('Failed to refresh after purchase:', e);
        }

        return true;
      } catch (err: any) {
        console.error('Purchase failed:', err);
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
