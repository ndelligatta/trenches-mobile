import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://ouhzztijvgrvjpdvgido.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aHp6dGlqdmdydmpwZHZnaWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDI5NzksImV4cCI6MjA2MTI3ODk3OX0.dic6GDJzfGLVOBbhRKJbPMVsSMG5pQmGOhkbVTFRBkA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface Player {
  wallet_address: string;
  name: string | null;
  currency: number;
  games_played: number;
  wins: number;
  kills: number;
  purchased_items: Record<string, string> | null;
  created_at: string;
}

export async function ensurePlayer(wallet: string) {
  return supabase.rpc('ensure_player', { p_wallet: wallet });
}

export async function getPlayer(wallet: string) {
  return supabase
    .from('players')
    .select('*')
    .eq('wallet_address', wallet)
    .single<Player>();
}

export async function getPlayerName(wallet: string) {
  return supabase.rpc('get_player_name', { p_wallet: wallet });
}

export async function setName(wallet: string, name: string) {
  return supabase.rpc('set_name', { p_wallet: wallet, p_name: name });
}

export async function addCurrency(wallet: string, delta: number) {
  return supabase.rpc('add_currency', { p_wallet: wallet, p_delta: delta });
}

export async function recordGame(
  wallet: string,
  placement: number,
  kills: number,
  won: boolean,
  currencyDelta: number,
) {
  return supabase.rpc('record_game', {
    p_wallet: wallet,
    p_placement: placement,
    p_kills: kills,
    p_won: won,
    p_currency_delta: currencyDelta,
  });
}

export async function addPurchasedItem(wallet: string, key: string, value: string) {
  return supabase.rpc('add_purchased_item', {
    p_wallet: wallet,
    p_key: key,
    p_value: value,
  });
}

export async function setPurchasedItems(wallet: string, items: Record<string, string>) {
  return supabase.rpc('set_purchased_items', {
    p_wallet: wallet,
    p_items: items,
  });
}
