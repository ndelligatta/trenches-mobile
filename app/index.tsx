import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONT, SPACING } from '../constants/theme';
import { SHOP_CATEGORIES, ShopItem } from '../constants/items';
import { ItemCard } from '../components/shop/ItemCard';
import { WalletButton } from '../components/shop/WalletButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 12;
const GRID_GAP = 10;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2);

const TABS = [
  { id: 'shop', label: 'Shop', icon: '🛒' },
  { id: 'market', label: 'Market', icon: '💰' },
  { id: 'packs', label: 'Packs', icon: '🎴', featured: true },
  { id: 'inventory', label: 'Inventory', icon: '📦' },
  { id: 'rewards', label: 'Rewards', icon: '⭐' },
] as const;

const FILTERS = [
  { id: 'all', label: 'All' },
  ...SHOP_CATEGORIES.map(c => ({ id: c.id, label: c.title })),
];

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('shop');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const allUniqueItems = useMemo(() => {
    const seen = new Set<string>();
    const items: ShopItem[] = [];
    for (const cat of SHOP_CATEGORIES) {
      for (const item of cat.items) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          items.push(item);
        }
      }
    }
    return items;
  }, []);

  const displayItems = useMemo(() => {
    if (activeFilter === 'all') return allUniqueItems;
    const cat = SHOP_CATEGORIES.find(c => c.id === activeFilter);
    return cat ? cat.items : allUniqueItems;
  }, [activeFilter, allUniqueItems]);

  const renderItem = useCallback(({ item }: { item: ShopItem }) => (
    <ItemCard item={item} cardWidth={CARD_WIDTH} />
  ), []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#061a38', '#040e22', '#020814']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header - slim, just the essentials */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../assets/shop/trenches-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.title}>TRENCHES</Text>
            <Text style={styles.subtitle}>{activeTab === 'market' ? 'MARKETPLACE' : activeTab === 'packs' ? 'CARD PACKS' : activeTab === 'inventory' ? 'INVENTORY' : activeTab === 'rewards' ? 'REWARDS' : 'ITEM SHOP'}</Text>
          </View>
        </View>
        <WalletButton />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {activeTab === 'shop' && (
          <>
            {/* Pinned filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterBar}
              style={styles.filterScroll}
            >
              {FILTERS.map(f => (
                <TouchableOpacity
                  key={f.id}
                  style={[
                    styles.filterChip,
                    activeFilter === f.id && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilter(f.id)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === f.id && styles.filterTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 2-Column Item Grid */}
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
        )}

        {activeTab === 'market' && (
          <View style={styles.comingSoonWrap}>
            <LinearGradient
              colors={['rgba(245,197,24,0.08)', 'rgba(245,197,24,0.02)', 'transparent']}
              style={styles.comingSoonGlow}
            />
            <View style={styles.comingSoonIcon}>
              <Text style={styles.comingSoonIconText}>$</Text>
            </View>
            <Text style={styles.comingSoonTitle}>MARKETPLACE</Text>
            <Text style={styles.comingSoonTag}>COMING SOON</Text>
            <Text style={styles.comingSoonDesc}>
              List, trade, and resell items with other players. Peer-to-peer marketplace powered by $TRENCH.
            </Text>
          </View>
        )}

        {activeTab === 'packs' && (
          <ScrollView
            contentContainerStyle={styles.packsContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Featured Pack */}
            <View style={styles.featuredPack}>
              <LinearGradient
                colors={['rgba(245,197,24,0.15)', 'rgba(245,197,24,0.03)', 'transparent']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
              <View style={styles.featuredPackBadge}>
                <Text style={styles.featuredPackBadgeText}>FEATURED</Text>
              </View>
              <Text style={styles.packEmoji}>🎴</Text>
              <Text style={styles.featuredPackTitle}>LEGENDARY CRATE</Text>
              <Text style={styles.featuredPackDesc}>
                Guaranteed Rare+ drop. Chance at Legendary & Mythic items.
              </Text>
              <View style={styles.packPriceRow}>
                <Text style={styles.packPrice}>2,500 $TRENCH</Text>
              </View>
              <TouchableOpacity style={styles.packBuyBtn} onPress={() => router.push('/pack-opening?pack=legendary-pack')}>
                <Text style={styles.packBuyBtnText}>OPEN PACK</Text>
              </TouchableOpacity>
            </View>

            {/* Pack Grid */}
            <Text style={styles.packSectionTitle}>ALL PACKS</Text>
            <View style={styles.packGrid}>
              {[
                { name: 'STARTER PACK', price: '500', emoji: '📦', rarity: 'Common+', color: COLORS.common, packId: 'starter-pack' },
                { name: 'WARRIOR PACK', price: '1,000', emoji: '⚔️', rarity: 'Rare+', color: COLORS.rare, packId: 'warrior-pack' },
                { name: 'ELITE PACK', price: '1,500', emoji: '🔮', rarity: 'Epic+', color: COLORS.epic, packId: 'legendary-pack' },
                { name: 'LEGENDARY CRATE', price: '2,500', emoji: '🎴', rarity: 'Legendary+', color: COLORS.legendary, packId: 'legendary-pack' },
                { name: 'MYTHIC CHEST', price: '5,000', emoji: '👑', rarity: 'Mythic chance', color: COLORS.mythic, packId: 'mystery-pack' },
                { name: 'MYSTERY BOX', price: '???', emoji: '❓', rarity: '???', color: COLORS.exclusive, packId: 'mystery-pack' },
              ].map((p, i) => (
                <TouchableOpacity key={i} style={styles.packCard} onPress={() => router.push(`/pack-opening?pack=${p.packId}`)}>
                  <View style={[styles.packCardRarityDot, { backgroundColor: p.color }]} />
                  <Text style={styles.packCardEmoji}>{p.emoji}</Text>
                  <Text style={styles.packCardName}>{p.name}</Text>
                  <Text style={[styles.packCardRarity, { color: p.color }]}>{p.rarity}</Text>
                  <Text style={styles.packCardPrice}>{p.price} $T</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.packDisclaimer}>
              <Text style={styles.packDisclaimerText}>
                Pack contents are randomized. Drop rates visible before purchase. All items are cosmetic.
              </Text>
            </View>
          </ScrollView>
        )}

        {activeTab === 'inventory' && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>INV</Text>
            </View>
            <Text style={styles.emptyTitle}>Your Inventory</Text>
            <Text style={styles.emptySubtitle}>
              Connect your wallet to view your purchased items
            </Text>
          </View>
        )}

        {activeTab === 'rewards' && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: 'rgba(245,197,24,0.1)' }]}>
              <Text style={[styles.emptyIconText, { color: COLORS.primary }]}>XP</Text>
            </View>
            <Text style={styles.emptyTitle}>Rewards</Text>
            <Text style={styles.emptySubtitle}>
              Earn $TRENCH by winning matches and completing challenges
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 10 }]}>
        <View style={styles.bottomBarBg} />
        <View style={styles.bottomBarDivider} />
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const isFeatured = 'featured' in tab && tab.featured;
          if (isFeatured) {
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.featuredTab}
                onPress={() => setActiveTab(tab.id)}
              >
                <LinearGradient
                  colors={isActive ? [COLORS.primary, COLORS.primaryDim] : ['#2a2a4a', '#1a1a2e']}
                  style={styles.featuredTabInner}
                >
                  <Text style={styles.featuredTabIcon}>{tab.icon}</Text>
                </LinearGradient>
                <Text style={[
                  styles.bottomTabLabel,
                  isActive && styles.bottomTabLabelActive,
                  { marginTop: 4 },
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.bottomTab}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.bottomTabIcon}>{tab.icon}</Text>
              <Text style={[
                styles.bottomTabLabel,
                isActive && styles.bottomTabLabelActive,
              ]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: { width: 28, height: 28 },
  title: {
    color: '#fff',
    fontFamily: FONT.black,
    fontSize: 20,
    letterSpacing: 2,
    lineHeight: 22,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FONT.bold,
    fontSize: 8,
    letterSpacing: 3,
    marginTop: -1,
  },
  content: { flex: 1 },
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 10,
  },
  bottomBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,10,24,0.97)',
  },
  bottomBarDivider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  bottomTabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  bottomTabLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: FONT.semibold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  bottomTabLabelActive: {
    color: COLORS.primary,
  },
  activeIndicator: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  featuredTab: {
    flex: 1,
    alignItems: 'center',
    marginTop: -18,
  },
  featuredTabInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(245,197,24,0.3)',
  },
  featuredTabIcon: {
    fontSize: 24,
  },
  comingSoonWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 80,
  },
  comingSoonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  comingSoonIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245,197,24,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(245,197,24,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  comingSoonIconText: {
    color: COLORS.primary,
    fontFamily: FONT.black,
    fontSize: 28,
  },
  comingSoonTitle: {
    color: COLORS.text,
    fontFamily: FONT.black,
    fontSize: 22,
    letterSpacing: 3,
    marginBottom: 8,
  },
  comingSoonTag: {
    color: COLORS.primary,
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 3,
    backgroundColor: 'rgba(245,197,24,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  comingSoonDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: FONT.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  // --- Packs ---
  packsContainer: {
    padding: GRID_PADDING,
    paddingBottom: 100,
  },
  featuredPack: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,197,24,0.2)',
    backgroundColor: 'rgba(245,197,24,0.04)',
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  featuredPackBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  featuredPackBadgeText: {
    color: '#000',
    fontFamily: FONT.bold,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  packEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  featuredPackTitle: {
    color: COLORS.text,
    fontFamily: FONT.black,
    fontSize: 22,
    letterSpacing: 2,
    marginBottom: 8,
  },
  featuredPackDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FONT.regular,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  packPriceRow: {
    marginBottom: 14,
  },
  packPrice: {
    color: COLORS.primary,
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  packBuyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
  },
  packBuyBtnText: {
    color: '#000',
    fontFamily: FONT.black,
    fontSize: 15,
    letterSpacing: 2,
  },
  packSectionTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 12,
  },
  packGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  packCard: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.md,
    alignItems: 'center',
  },
  packCardRarityDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  packCardEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  packCardName: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  packCardRarity: {
    fontFamily: FONT.semibold,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  packCardPrice: {
    color: COLORS.primary,
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  packDisclaimer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  packDisclaimerText: {
    color: 'rgba(255,255,255,0.25)',
    fontFamily: FONT.regular,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
