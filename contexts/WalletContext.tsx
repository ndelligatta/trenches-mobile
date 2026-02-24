import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Platform, Alert, TurboModuleRegistry } from 'react-native';
import { PublicKey, Transaction, Connection, clusterApiUrl } from '@solana/web3.js';

// Check if the Solana Mobile native module is available (custom dev client / production only)
// TurboModuleRegistry.get() returns null instead of throwing, unlike getEnforcing()
const hasSolanaMobileNative = !!TurboModuleRegistry.get('SolanaMobileWalletAdapter');

let transactFn: any = null;
function getTransact() {
  if (!transactFn && hasSolanaMobileNative) {
    try {
      transactFn = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js').transact;
    } catch {
      transactFn = null;
    }
  }
  return transactFn;
}

const CLUSTER = 'mainnet-beta';
const APP_IDENTITY = {
  name: 'Trenches',
  uri: 'https://trenchesgame.com',
  icon: 'favicon.ico',
};

interface WalletState {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  balance: number | null;
  trenchBalance: number | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  signAndSendTransaction: (tx: Transaction) => Promise<string | null>;
  connection: Connection;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    publicKey: null,
    connected: false,
    connecting: false,
    balance: null,
    trenchBalance: null,
  });

  const connectionRef = useRef(new Connection(clusterApiUrl(CLUSTER)));
  const authTokenRef = useRef<string | null>(null);

  const connect = useCallback(async () => {
    if (Platform.OS === 'web') {
      console.warn('Solana Mobile Wallet Adapter is not available on web');
      return;
    }

    const transact = getTransact();
    if (!transact) {
      Alert.alert(
        'Dev Client Required',
        'Solana Mobile Wallet Adapter requires a custom dev client build. Run `npx expo run:android` to build one.',
      );
      return;
    }

    setState(prev => ({ ...prev, connecting: true }));

    try {
      await transact(async (wallet: any) => {
        const authResult = await wallet.authorize({
          cluster: CLUSTER,
          identity: APP_IDENTITY,
        });

        const pubkey = new PublicKey(authResult.accounts[0].address);
        authTokenRef.current = authResult.auth_token;

        // Fetch SOL balance
        let solBalance: number | null = null;
        try {
          const lamports = await connectionRef.current.getBalance(pubkey);
          solBalance = lamports / 1e9;
        } catch {
          // Balance fetch failed, continue anyway
        }

        setState({
          publicKey: pubkey,
          connected: true,
          connecting: false,
          balance: solBalance,
          trenchBalance: null, // TODO: Fetch $TRENCH SPL token balance
        });
      });
    } catch (err) {
      console.error('Wallet connection failed:', err);
      setState(prev => ({ ...prev, connecting: false }));
    }
  }, []);

  const disconnect = useCallback(() => {
    authTokenRef.current = null;
    setState({
      publicKey: null,
      connected: false,
      connecting: false,
      balance: null,
      trenchBalance: null,
    });
  }, []);

  const signAndSendTransaction = useCallback(async (tx: Transaction): Promise<string | null> => {
    if (Platform.OS === 'web') return null;

    const transact = getTransact();
    if (!transact) return null;

    try {
      const signature = await transact(async (wallet: any) => {
        if (authTokenRef.current) {
          await wallet.reauthorize({
            auth_token: authTokenRef.current,
            identity: APP_IDENTITY,
          });
        }

        const { blockhash } = await connectionRef.current.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = state.publicKey!;

        const signedTxs = await wallet.signAndSendTransactions({
          transactions: [tx],
        });

        return signedTxs[0];
      });

      return typeof signature === 'string' ? signature : null;
    } catch (err) {
      console.error('Transaction failed:', err);
      return null;
    }
  }, [state.publicKey]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        signAndSendTransaction,
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
