import { Alert } from 'react-native';
import type { Player } from './supabase';

let _isDemoMode = false;

export function isDemoMode(): boolean {
  return _isDemoMode;
}

export function toggleDemoMode(): boolean {
  _isDemoMode = !_isDemoMode;
  Alert.alert(
    _isDemoMode ? 'Demo Mode Enabled' : 'Demo Mode Disabled',
    _isDemoMode
      ? 'Browsing with a mock wallet. Purchases will show a demo alert.'
      : 'Returned to normal mode.',
  );
  return _isDemoMode;
}

export const DEMO_WALLET_ADDRESS = 'DeMo1111111111111111111111111111111111111111';

export const DEMO_PLAYER: Player = {
  wallet_address: DEMO_WALLET_ADDRESS,
  name: 'DemoPlayer',
  currency: 50000,
  games_played: 42,
  wins: 7,
  kills: 128,
  purchased_items: null,
  created_at: new Date().toISOString(),
};

export const DEMO_BALANCE = 2.5; // SOL

export function showDemoPurchaseAlert() {
  Alert.alert(
    'Demo Mode',
    'Purchases are disabled in demo mode. Connect a real wallet to buy items.',
  );
}
