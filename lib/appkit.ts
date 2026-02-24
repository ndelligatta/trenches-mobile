import { createAppKit } from '@reown/appkit-react-native';
import { SolanaAdapter, PhantomConnector, SolflareConnector } from '@reown/appkit-solana-react-native';
import { solana, solanaTestnet, solanaDevnet, type Storage } from '@reown/appkit-common-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const projectId = '0b840bb98f4fea8ce4647bc0b0de86a0';

const metadata = {
  name: 'Trenches',
  description: 'Trenches Item Shop',
  url: 'https://trenchesgame.com',
  icons: ['https://trenchesgame.com/favicon.ico'],
  redirect: {
    native: 'trenches://',
  },
};

const storage: Storage = {
  async getKeys() {
    return AsyncStorage.getAllKeys() as Promise<string[]>;
  },
  async getEntries<T = any>() {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys as string[]);
    return pairs.map(([k, v]) => [k, v ? JSON.parse(v) : undefined] as [string, T]);
  },
  async getItem<T = any>(key: string) {
    const val = await AsyncStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : undefined;
  },
  async setItem<T = any>(key: string, value: T) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
  },
};

const solanaAdapter = new SolanaAdapter();

export const appkit = createAppKit({
  projectId,
  metadata,
  adapters: [solanaAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  defaultNetwork: solana,
  storage,
  extraConnectors: [
    new PhantomConnector({ cluster: 'mainnet-beta' }),
    new SolflareConnector({ cluster: 'mainnet-beta' }),
  ],
  features: {
    socials: ['google'],
    showWallets: true,
    swaps: false,
    onramp: false,
  },
});
