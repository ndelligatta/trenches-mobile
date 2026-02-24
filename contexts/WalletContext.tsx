import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { useAppKit, useAccount, useAppKitState } from '@reown/appkit-react-native';
import {
  ensurePlayer,
  getPlayer,
  addCurrency,
  addPurchasedItem,
  setName as setPlayerName,
  type Player,
} from '../lib/supabase';

const CLUSTER = 'mainnet-beta';
const APP_IDENTITY = {
  name: 'Trenches',
  uri: 'https://trenchesgame.com',
  icon: 'favicon.ico',
};

// Lazy-load MWA to avoid crashes when native module isn't available
let mwaTransact: any = null;
function getTransact() {
  if (mwaTransact) return mwaTransact;
  if (Platform.OS !== 'web') {
    try {
      mwaTransact = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js').transact;
    } catch {
      mwaTransact = null;
    }
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

        const pubkey = new PublicKey(authResult.accounts[0].address);
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

  const purchaseItem = useCallback(
    async (itemId: string, price: number): Promise<boolean> => {
      if (!address || !player) return false;

      if (player.currency < price) {
        Alert.alert('Insufficient Funds', 'You don\'t have enough currency for this purchase.');
        return false;
      }

      try {
        const { error: currErr } = await addCurrency(address, -price);
        if (currErr) throw currErr;

        const { error: itemErr } = await addPurchasedItem(address, itemId, 'owned');
        if (itemErr) throw itemErr;

        const { data } = await getPlayer(address);
        if (data) {
          setPlayer(data);
          setPlayerNameState(data.name);
        }

        return true;
      } catch (err) {
        console.error('Purchase failed:', err);
        Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
        return false;
      }
    },
    [address, player],
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
