import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { COLORS, FONT, RARITY_COLORS, Rarity } from '../../constants/theme';
import { MARKETPLACE_ITEMS, COLLECTIONS, ITEM_COLORS, ShopItem, ItemColor, Collection } from '../../constants/items';
import { ItemCard } from './ItemCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 12;
const GRID_GAP = 10;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2);

// ─── Filter constants from marketplace-data.js ───

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Items' },
  { id: 'skin', label: 'Skins' },
  { id: 'weapon', label: 'Weapons' },
];

const PRICE_QUICK = [
  { label: '<1K', min: 0, max: 1000 },
  { label: '1K-2K', min: 1000, max: 2000 },
  { label: '2K-3K', min: 2000, max: 3000 },
  { label: '>3K', min: 3000, max: null },
];

const RARITY_OPTIONS: { id: Rarity; label: string }[] = [
  { id: 'mythic', label: 'Mystic' },
  { id: 'exclusive', label: 'Exclusive' },
  { id: 'legendary', label: 'Legendary' },
  { id: 'epic', label: 'Epic' },
  { id: 'rare', label: 'Rare' },
  { id: 'common', label: 'Common' },
];

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'rarity-desc' | 'newest';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'name-asc', label: 'Name: A-Z' },
  { id: 'rarity-desc', label: 'Rarity: High to Low' },
  { id: 'newest', label: 'Newest First' },
];

const RARITY_RANK: Record<string, number> = {
  common: 1, rare: 2, epic: 3, legendary: 4, exclusive: 5, mythic: 6,
};

export function MarketplaceView() {
  // Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priceQuick, setPriceQuick] = useState<number | null>(null);
  const [selectedRarities, setSelectedRarities] = useState<Set<Rarity>>(new Set());
  const [selectedCollections, setSelectedCollections] = useState<Set<Collection>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<ItemColor>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const toggleRarity = (r: Rarity) => {
    setSelectedRarities(prev => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next;
    });
  };

  const toggleCollection = (c: Collection) => {
    setSelectedCollections(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  const toggleColor = (c: ItemColor) => {
    setSelectedColors(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setPriceQuick(null);
    setSelectedRarities(new Set());
    setSelectedCollections(new Set());
    setSelectedColors(new Set());
    setSortBy('price-asc');
  };

  const activeFilterCount =
    (category !== 'all' ? 1 : 0) +
    (priceQuick !== null ? 1 : 0) +
    selectedRarities.size +
    selectedCollections.size +
    selectedColors.size;

  // Filter + sort
  const displayItems = useMemo(() => {
    let items = MARKETPLACE_ITEMS;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.typeName.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.collection.toLowerCase().includes(q),
      );
    }

    // Category (skin/weapon)
    if (category === 'skin') {
      items = items.filter(i => i.type === 'skin');
    } else if (category === 'weapon') {
      items = items.filter(i => i.type === 'weapon');
    }

    // Price quick filter
    if (priceQuick !== null) {
      const pq = PRICE_QUICK[priceQuick];
      items = items.filter(i => {
        const p = i.price === -1 ? 0 : i.price;
        if (pq.min !== null && p < pq.min) return false;
        if (pq.max !== null && p > pq.max) return false;
        return true;
      });
    }

    // Rarity
    if (selectedRarities.size > 0) {
      items = items.filter(i => selectedRarities.has(i.rarity));
    }

    // Collection
    if (selectedCollections.size > 0) {
      items = items.filter(i => selectedCollections.has(i.collection));
    }

    // Color
    if (selectedColors.size > 0) {
      items = items.filter(i => selectedColors.has(i.color));
    }

    // Sort
    const sorted = [...items];
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => (a.price === -1 ? 999999 : a.price) - (b.price === -1 ? 999999 : b.price));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.price === -1 ? 999999 : b.price) - (a.price === -1 ? 999999 : a.price));
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rarity-desc':
        sorted.sort((a, b) => (RARITY_RANK[b.rarity] || 0) - (RARITY_RANK[a.rarity] || 0));
        break;
      case 'newest':
        sorted.reverse();
        break;
    }

    return sorted;
  }, [search, category, priceQuick, selectedRarities, selectedCollections, selectedColors, sortBy]);

  const renderItem = useCallback(
    ({ item }: { item: ShopItem }) => <ItemCard item={item} cardWidth={CARD_WIDTH} />,
    [],
  );

  const ListHeader = (
    <>
      {/* Category bar */}
      <View style={styles.categoryBar}>
        {CATEGORY_FILTERS.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[styles.catChip, category === f.id && styles.catChipActive]}
            onPress={() => setCategory(f.id)}
          >
            <Text style={[styles.catText, category === f.id && styles.catTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Controls row: filter button + sort + count */}
      <View style={styles.controlsRow}>
        <View style={styles.controlsLeft}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => setShowFilters(true)}>
            <Text style={styles.controlBtnText}>Filters</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => setShowSort(true)}>
            <Text style={styles.controlBtnText}>{SORT_OPTIONS.find(s => s.id === sortBy)?.label}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.resultCount}>{displayItems.length} items</Text>
      </View>

      {/* Price quick filters */}
      <View style={styles.priceQuickRow}>
        {PRICE_QUICK.map((pq, idx) => (
          <TouchableOpacity
            key={pq.label}
            style={[styles.priceChip, priceQuick === idx && styles.priceChipActive]}
            onPress={() => setPriceQuick(priceQuick === idx ? null : idx)}
          >
            <Text style={[styles.priceChipText, priceQuick === idx && styles.priceChipTextActive]}>{pq.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>&#x1F50D;</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Text style={styles.clearText}>X</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Grid */}
      <FlatList
        data={displayItems}
        numColumns={2}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No items found</Text>
            <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* ─── Filter Modal ─── */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Rarity */}
              <Text style={styles.filterSectionTitle}>Rarity</Text>
              <View style={styles.filterChipWrap}>
                {RARITY_OPTIONS.map(r => {
                  const active = selectedRarities.has(r.id);
                  const color = RARITY_COLORS[r.id];
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.filterChip, active && { backgroundColor: color + '25', borderColor: color }]}
                      onPress={() => toggleRarity(r.id)}
                    >
                      <View style={[styles.rarityDot, { backgroundColor: color }]} />
                      <Text style={[styles.filterChipLabel, active && { color }]}>{r.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Collection */}
              <Text style={styles.filterSectionTitle}>Collection</Text>
              <View style={styles.filterChipWrap}>
                {COLLECTIONS.map(c => {
                  const active = selectedCollections.has(c);
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.filterChip, active && styles.filterChipSelected]}
                      onPress={() => toggleCollection(c)}
                    >
                      <Text style={[styles.filterChipLabel, active && styles.filterChipLabelSelected]}>{c}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Color */}
              <Text style={styles.filterSectionTitle}>Color</Text>
              <View style={styles.colorRow}>
                {ITEM_COLORS.map(c => {
                  const active = selectedColors.has(c.name);
                  return (
                    <TouchableOpacity
                      key={c.name}
                      style={[styles.colorSwatch, { backgroundColor: c.hex }, active && styles.colorSwatchActive]}
                      onPress={() => toggleColor(c.name)}
                    />
                  );
                })}
              </View>

              {/* Reset */}
              <TouchableOpacity style={styles.resetFiltersBtn} onPress={() => { resetFilters(); setShowFilters(false); }}>
                <Text style={styles.resetFiltersBtnText}>Reset All Filters</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Sort Modal ─── */}
      <Modal visible={showSort} animationType="fade" transparent>
        <TouchableOpacity style={styles.sortOverlay} activeOpacity={1} onPress={() => setShowSort(false)}>
          <View style={styles.sortSheet}>
            {SORT_OPTIONS.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[styles.sortOption, sortBy === s.id && styles.sortOptionActive]}
                onPress={() => { setSortBy(s.id); setShowSort(false); }}
              >
                <Text style={[styles.sortOptionText, sortBy === s.id && styles.sortOptionTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: GRID_PADDING,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontFamily: FONT.regular,
    fontSize: 14,
    padding: 0,
  },
  clearBtn: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  clearText: { color: 'rgba(255,255,255,0.5)', fontFamily: FONT.bold, fontSize: 10 },

  // Category bar
  categoryBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { color: 'rgba(255,255,255,0.45)', fontFamily: FONT.semibold, fontSize: 12 },
  catTextActive: { color: '#000' },

  // Controls row
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlsLeft: { flexDirection: 'row', gap: 6 },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  controlBtnText: { color: 'rgba(255,255,255,0.5)', fontFamily: FONT.medium, fontSize: 11 },
  filterBadge: {
    backgroundColor: COLORS.primary,
    width: 16, height: 16, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  filterBadgeText: { color: '#000', fontFamily: FONT.bold, fontSize: 9 },
  resultCount: { color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 12 },

  // Price quick
  priceQuickRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  priceChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  priceChipActive: { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
  priceChipText: { color: 'rgba(255,255,255,0.35)', fontFamily: FONT.semibold, fontSize: 11 },
  priceChipTextActive: { color: COLORS.primary },

  // Grid
  grid: { paddingHorizontal: GRID_PADDING, paddingBottom: 90 },
  gridRow: { gap: GRID_GAP, marginBottom: GRID_GAP },

  // Empty
  emptyState: { paddingTop: 60, alignItems: 'center', gap: 12 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontFamily: FONT.medium, fontSize: 14 },
  resetBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  resetBtnText: { color: 'rgba(255,255,255,0.5)', fontFamily: FONT.semibold, fontSize: 12 },

  // ─── Filter Modal ───
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0d0d1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { color: '#fff', fontFamily: FONT.bold, fontSize: 18 },
  modalClose: { color: COLORS.primary, fontFamily: FONT.bold, fontSize: 15 },
  filterSectionTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 16,
  },
  filterChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipSelected: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  filterChipLabel: { color: 'rgba(255,255,255,0.5)', fontFamily: FONT.medium, fontSize: 13 },
  filterChipLabelSelected: { color: '#fff' },
  rarityDot: { width: 10, height: 10, borderRadius: 5 },

  // Color swatches
  colorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorSwatch: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: '#fff',
    borderWidth: 3,
  },

  // Reset
  resetFiltersBtn: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  resetFiltersBtnText: { color: 'rgba(255,255,255,0.5)', fontFamily: FONT.semibold, fontSize: 14 },

  // ─── Sort Modal ───
  sortOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  sortSheet: {
    backgroundColor: '#16162a',
    borderRadius: 16,
    overflow: 'hidden',
  },
  sortOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sortOptionActive: { backgroundColor: 'rgba(255,255,255,0.06)' },
  sortOptionText: { color: 'rgba(255,255,255,0.5)', fontFamily: FONT.medium, fontSize: 14 },
  sortOptionTextActive: { color: COLORS.primary, fontFamily: FONT.bold },
});
