import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPABASE_URL = 'https://ouhzztijvgrvjpdvgido.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aHp6dGlqdmdydmpwZHZnaWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNjQzNzUsImV4cCI6MjA3NTc0MDM3NX0.60JLI7OIAZRiqNg0SOHPPORMkCcspHvFD7LwETRwUDE';

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

// ─── Unit scarcity system ───

export interface VerifyPurchaseResult {
  success: boolean;
  unit_id: string;
  serial_number: number;
  skin_type_id: string;
  name: string;
  rarity: string;
  max_supply: number;
  error?: string;
}

export function verifyPurchase(
  txSignature: string,
  walletAddress: string,
  skinTypeId: string,
  priceUsdc: number,
): Promise<VerifyPurchaseResult> {
  // Use XMLHttpRequest instead of fetch — WalletConnect's whatwg-fetch polyfill is broken
  const url = `${SUPABASE_URL}/functions/v1/verify-purchase`;
  const body = {
    tx_signature: txSignature,
    wallet_address: walletAddress,
    skin_type_id: skinTypeId,
    expected_amount_usdc: priceUsdc,
  };
  console.log(`[verifyPurchase] XHR POST ${url}`);
  console.log(`[verifyPurchase] body: ${JSON.stringify(body)}`);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.timeout = 30000;
    xhr.onreadystatechange = () => {
      console.log(`[verifyPurchase] readyState=${xhr.readyState}, status=${xhr.status}`);
      if (xhr.readyState === 4) {
        if (xhr.status > 0) {
          console.log(`[verifyPurchase] response status=${xhr.status}, body=${xhr.responseText.slice(0, 500)}`);
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error(`Invalid JSON response: ${xhr.responseText.slice(0, 200)}`));
          }
        } else {
          console.error(`[verifyPurchase] readyState=4 but status=0 — network error`);
        }
      }
    };
    xhr.onerror = () => {
      console.error(`[verifyPurchase] XHR onerror fired`);
      reject(new Error(`Network error calling verify-purchase`));
    };
    xhr.ontimeout = () => {
      console.error(`[verifyPurchase] XHR timeout after 30s`);
      reject(new Error(`Timeout calling verify-purchase`));
    };
    xhr.send(JSON.stringify(body));
  });
}

export interface SkinTypeSupply {
  skin_type_id: string;
  name: string;
  rarity: string;
  max_supply: number;
  units_minted: number;
  units_available: number;
  is_active: boolean;
}

export async function getSkinTypeSupply(skinTypeId: string) {
  const { data, error } = await supabase.rpc('get_skin_type_supply', { p_skin_type_id: skinTypeId });
  // RPC returns an array — take the first element
  const row = Array.isArray(data) ? data[0] ?? null : data;
  return { data: row as SkinTypeSupply | null, error };
}

export interface PlayerUnit {
  unit_id: string;
  skin_type_id: string;
  name: string;
  rarity: string;
  serial_number: number;
  max_supply: number;
  status: string;
  assigned_at: string;
}

export async function getPlayerUnits(wallet: string) {
  return supabase.rpc('get_player_units', { p_wallet: wallet }) as
    Promise<{ data: PlayerUnit[] | null; error: any }>;
}

// ─── Dynamic shop catalog ───

export interface CatalogItem {
  skin_type_id: string;
  name: string;
  rarity: string;
  max_supply: number;
  units_minted: number;
  is_active: boolean;
  is_tradeable: boolean;
  price_cents: number;
  image_url: string;
  description: string;
  specs: string;
  collection: string;
  color: string;
  type_name: string;
  item_type: string;
  bg_gradient: string[];
  model_url: string | null;
  camera_orbit: string | null;
  badge: string | null;
  category: string;
  display_order: number;
  is_featured: boolean;
}

// Module-level catalog cache — fetched once, used by shop + inventory + item detail
let _catalogCache: CatalogItem[] | null = null;
let _catalogFetching: Promise<CatalogItem[]> | null = null;

export async function getShopCatalog(forceRefresh = false): Promise<CatalogItem[]> {
  if (_catalogCache && !forceRefresh) return _catalogCache;
  // Deduplicate concurrent fetches
  if (_catalogFetching && !forceRefresh) return _catalogFetching;

  _catalogFetching = (async () => {
    const { data, error } = await supabase.rpc('get_shop_catalog');
    if (error) {
      console.error('[catalog] get_shop_catalog error:', error.message);
      throw error;
    }
    const items = (data ?? []) as CatalogItem[];
    _catalogCache = items;
    _catalogFetching = null;
    console.log(`[catalog] Fetched ${items.length} items from Supabase`);
    return items;
  })();

  return _catalogFetching;
}

export function getCachedCatalog(): CatalogItem[] | null {
  return _catalogCache;
}

// ─── Pack opening (server-side) ───

export interface OpenPackResult {
  success: boolean;
  unit_id: string;
  serial_number: number;
  skin_type_id: string;
  name: string;
  rarity: string;
  max_supply: number;
  image_url: string;
  rolled_rarity: string;
  error?: string;
}

export function openPack(
  txSignature: string,
  walletAddress: string,
  packId: string,
  priceUsdc: number,
): Promise<OpenPackResult> {
  const url = `${SUPABASE_URL}/functions/v1/open-pack`;
  const body = {
    tx_signature: txSignature,
    wallet_address: walletAddress,
    pack_id: packId,
    expected_amount_usdc: priceUsdc,
  };
  console.log(`[openPack] XHR POST ${url}`);
  console.log(`[openPack] body: ${JSON.stringify(body)}`);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.timeout = 30000;
    xhr.onreadystatechange = () => {
      console.log(`[openPack] readyState=${xhr.readyState}, status=${xhr.status}`);
      if (xhr.readyState === 4) {
        if (xhr.status > 0) {
          console.log(`[openPack] response status=${xhr.status}, body=${xhr.responseText.slice(0, 500)}`);
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error(`Invalid JSON response: ${xhr.responseText.slice(0, 200)}`));
          }
        } else {
          console.error(`[openPack] readyState=4 but status=0 — network error`);
        }
      }
    };
    xhr.onerror = () => {
      console.error(`[openPack] XHR onerror fired`);
      reject(new Error(`Network error calling open-pack`));
    };
    xhr.ontimeout = () => {
      console.error(`[openPack] XHR timeout after 30s`);
      reject(new Error(`Timeout calling open-pack`));
    };
    xhr.send(JSON.stringify(body));
  });
}
