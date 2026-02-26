import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { COLORS, FONT, SPACING, RARITY_COLORS } from '../../constants/theme';
import { getItemById } from '../../constants/items';
import { ItemCard } from '../shop/ItemCard';
import { useWallet } from '../../contexts/WalletContext';
import { getPlayerUnits, type PlayerUnit } from '../../lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 12;
const GRID_GAP = 10;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2);

export function InventoryTab() {
  const { address, connected } = useWallet();
  const [units, setUnits] = useState<PlayerUnit[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInventory = useCallback(async () => {
    if (!address) return;
    console.log('[INVENTORY] Fetching units for', address);
    setLoading(true);
    try {
      const { data } = await getPlayerUnits(address);
      if (data) {
        console.log(`[INVENTORY] Got ${data.length} units`);
        setUnits(data);
      }
    } catch (err: any) {
      console.error('[INVENTORY] Fetch failed:', err?.message);
    }
    setLoading(false);
  }, [address]);

  // Re-fetch on screen focus (returning from purchase, etc.)
  useFocusEffect(
    useCallback(() => {
      if (address) fetchInventory();
    }, [address, fetchInventory])
  );

  useEffect(() => {
    if (address) fetchInventory();
  }, [address, fetchInventory]);

  if (!connected) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>INV</Text>
        </View>
        <Text style={styles.emptyTitle}>Your Inventory</Text>
        <Text style={styles.emptySubtitle}>
          Connect your wallet to view your purchased items
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={[styles.emptySubtitle, { marginTop: 16 }]}>Loading inventory...</Text>
      </View>
    );
  }

  if (units.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>INV</Text>
        </View>
        <Text style={styles.emptyTitle}>No Items Yet</Text>
        <Text style={styles.emptySubtitle}>
          Purchase items from the shop to see them here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={units}
      numColumns={2}
      keyExtractor={u => u.unit_id}
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={styles.gridRow}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Text style={styles.count}>{units.length} ITEM{units.length !== 1 ? 'S' : ''}</Text>
      }
      renderItem={({ item: unit }) => {
        const shopItem = getItemById(unit.skin_type_id);
        if (shopItem) {
          return (
            <View style={{ width: CARD_WIDTH }}>
              <ItemCard item={shopItem} cardWidth={CARD_WIDTH} />
              <View style={styles.serialBadge}>
                <Text style={styles.serialBadgeText}>#{unit.serial_number}/{unit.max_supply}</Text>
              </View>
            </View>
          );
        }
        const rarityColor = RARITY_COLORS[unit.rarity as keyof typeof RARITY_COLORS] || COLORS.textSecondary;
        return (
          <View style={[styles.fallbackCard, { width: CARD_WIDTH, borderColor: rarityColor + '40' }]}>
            <Text style={[styles.fallbackName, { color: rarityColor }]} numberOfLines={1}>{unit.name}</Text>
            <Text style={styles.fallbackSerial}>#{unit.serial_number} <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>of {unit.max_supply}</Text></Text>
            <Text style={[styles.fallbackRarity, { color: rarityColor }]}>{unit.rarity}</Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyIconText: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: FONT.black,
    fontSize: 16,
    letterSpacing: 1,
  },
  emptyTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 20,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FONT.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 100,
  },
  gridRow: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  count: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
  },
  serialBadge: {
    position: 'absolute',
    top: 8,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 20,
  },
  serialBadgeText: {
    color: '#fff',
    fontFamily: FONT.black,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  fallbackCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    padding: SPACING.md,
    height: Math.floor(CARD_WIDTH * 1.25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackName: {
    fontFamily: FONT.bold,
    fontSize: 14,
    marginBottom: 4,
  },
  fallbackSerial: {
    color: COLORS.text,
    fontFamily: FONT.black,
    fontSize: 20,
    marginBottom: 4,
  },
  fallbackRarity: {
    fontFamily: FONT.semibold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase' as any,
  },
});
