import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
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

interface WalletContextType {
  address: string | undefined;
  connected: boolean;
  connecting: boolean;
  balance: number | null;
  player: Player | null;
  playerName: string | null;
  playerLoading: boolean;
  openWalletModal: () => void;
  disconnect: () => void;
  refreshPlayer: () => Promise<void>;
  updatePlayerName: (name: string) => Promise<void>;
  purchaseItem: (itemId: string, price: number) => Promise<boolean>;
  connection: Connection;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { open, disconnect: appKitDisconnect } = useAppKit();
  const { address: rawAddress, isConnected } = useAccount();
  const { isLoading } = useAppKitState();

  const [balance, setBalance] = useState<number | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerNameState] = useState<string | null>(null);
  const [playerLoading, setPlayerLoading] = useState(false);

  const connectionRef = useRef(new Connection(clusterApiUrl(CLUSTER)));
  const prevAddressRef = useRef<string | undefined>(undefined);

  // Parse CAIP address if needed (e.g. "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:BASE58ADDR" → "BASE58ADDR")
  const address = rawAddress?.includes(':') ? rawAddress.split(':').pop() : rawAddress;

  // Sync player data when address changes
  useEffect(() => {
    if (!address || !isConnected) {
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

      // Ensure player exists + fetch data
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
  }, [address, isConnected]);

  const openWalletModal = useCallback(() => {
    open();
  }, [open]);

  const disconnect = useCallback(() => {
    appKitDisconnect();
    setBalance(null);
    setPlayer(null);
    setPlayerNameState(null);
    prevAddressRef.current = undefined;
  }, [appKitDisconnect]);

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

        // Refresh player data after purchase
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
        connected: isConnected,
        connecting: isLoading,
        balance,
        player,
        playerName,
        playerLoading,
        openWalletModal,
        disconnect,
        refreshPlayer,
        updatePlayerName,
        purchaseItem,
        connection: connectionRef.current,
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
