import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { COLORS, FONT, SPACING } from '../../constants/theme';
import { ShopItem, catalogItemToShopItem, setFetchedCatalog } from '../../constants/items';
import { ItemCard } from '../shop/ItemCard';
import { getShopCatalog } from '../../lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 12;
const GRID_GAP = 10;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2);

export function ShopTab() {
  const [catalogItems, setCatalogItems] = useState<ShopItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const fetchCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const catalog = await getShopCatalog(true);
      const items = catalog
        .filter(c => c.category !== 'packs')
        .map(catalogItemToShopItem);
      setCatalogItems(items);
      setFetchedCatalog(items);
      console.log(`[SHOP] Loaded ${items.length} items from Supabase`);
    } catch (err: any) {
      console.error('[SHOP] Catalog fetch failed:', err?.message);
      setCatalogError('Failed to load shop. Check your connection.');
      setCatalogItems([]);
    }
    setCatalogLoading(false);
  }, []);

  useEffect(() => { fetchCatalog(); }, [fetchCatalog]);

  const categories = useMemo(() => {
    const catMap = new Map<string, string>();
    for (const item of catalogItems) {
      if (!catMap.has(item.category)) {
        catMap.set(item.category, item.collection || item.category);
      }
    }
    return Array.from(catMap.entries()).map(([id, label]) => ({ id, label }));
  }, [catalogItems]);

  const filters = useMemo(() => [
    { id: 'all', label: 'All' },
    ...categories,
  ], [categories]);

  const displayItems = useMemo(() => {
    if (activeFilter === 'all') return catalogItems;
    return catalogItems.filter(item => item.category === activeFilter);
  }, [activeFilter, catalogItems]);

  const renderItem = useCallback(({ item }: { item: ShopItem }) => (
    <ItemCard item={item} cardWidth={CARD_WIDTH} />
  ), []);

  if (catalogLoading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingText}>Loading shop...</Text>
      </View>
    );
  }

  if (catalogError) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={styles.errorTitle}>Shop Unavailable</Text>
        <Text style={styles.errorSubtitle}>{catalogError}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchCatalog}>
          <Text style={styles.retryBtnText}>RETRY</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
        style={styles.filterScroll}
      >
        {filters.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.id)}
          >
            <Text style={[styles.filterText, activeFilter === f.id && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={displayItems}
        numColumns={2}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FONT.regular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  errorIconText: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: FONT.black,
    fontSize: 16,
    letterSpacing: 1,
  },
  errorTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 20,
    marginBottom: SPACING.sm,
  },
  errorSubtitle: {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FONT.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#000',
    fontFamily: FONT.bold,
    fontSize: 14,
    letterSpacing: 1,
  },
  filterScroll: { flexGrow: 0 },
  filterBar: {
    paddingHorizontal: GRID_PADDING,
    gap: 6,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: 'rgba(255,255,255,0.45)',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  filterTextActive: {
    color: '#000',
  },
  grid: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 90,
  },
  gridRow: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
});
