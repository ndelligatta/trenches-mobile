import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, FONT, SPACING } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 12;
const GRID_GAP = 10;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2);

const PACK_LIST = [
  { name: 'STARTER PACK', price: '500', emoji: '\u{1F4E6}', rarity: 'Common+', color: COLORS.common, packId: 'starter-pack' },
  { name: 'WARRIOR PACK', price: '1,000', emoji: '\u2694\uFE0F', rarity: 'Rare+', color: COLORS.rare, packId: 'warrior-pack' },
  { name: 'ELITE PACK', price: '1,500', emoji: '\u{1F52E}', rarity: 'Epic+', color: COLORS.epic, packId: 'legendary-pack' },
  { name: 'LEGENDARY CRATE', price: '2,500', emoji: '\u{1F3B4}', rarity: 'Legendary+', color: COLORS.legendary, packId: 'legendary-pack' },
  { name: 'MYTHIC CHEST', price: '5,000', emoji: '\u{1F451}', rarity: 'Mythic chance', color: COLORS.mythic, packId: 'mystery-pack' },
  { name: 'MYSTERY BOX', price: '???', emoji: '\u2753', rarity: '???', color: COLORS.exclusive, packId: 'mystery-pack' },
];

export function PacksTab() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
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
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>FEATURED</Text>
        </View>
        <Text style={styles.featuredEmoji}>{'\u{1F3B4}'}</Text>
        <Text style={styles.featuredTitle}>LEGENDARY CRATE</Text>
        <Text style={styles.featuredDesc}>
          Guaranteed Rare+ drop. Chance at Legendary & Mythic items.
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>2,500 $TRENCH</Text>
        </View>
        <TouchableOpacity style={styles.buyBtn} onPress={() => router.push('/pack-opening?pack=legendary-pack')}>
          <Text style={styles.buyBtnText}>OPEN PACK</Text>
        </TouchableOpacity>
      </View>

      {/* Pack Grid */}
      <Text style={styles.sectionTitle}>ALL PACKS</Text>
      <View style={styles.grid}>
        {PACK_LIST.map((p, i) => (
          <TouchableOpacity
            key={i}
            style={styles.card}
            onPress={() => router.push(`/pack-opening?pack=${p.packId}`)}
          >
            <View style={[styles.rarityDot, { backgroundColor: p.color }]} />
            <Text style={styles.cardEmoji}>{p.emoji}</Text>
            <Text style={styles.cardName}>{p.name}</Text>
            <Text style={[styles.cardRarity, { color: p.color }]}>{p.rarity}</Text>
            <Text style={styles.cardPrice}>{p.price} $T</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Pack contents are randomized. Drop rates visible before purchase. All items are cosmetic.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  featuredBadgeText: {
    color: '#000',
    fontFamily: FONT.bold,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  featuredEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  featuredTitle: {
    color: COLORS.text,
    fontFamily: FONT.black,
    fontSize: 22,
    letterSpacing: 2,
    marginBottom: 8,
  },
  featuredDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FONT.regular,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  priceRow: {
    marginBottom: 14,
  },
  price: {
    color: COLORS.primary,
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  buyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
  },
  buyBtnText: {
    color: '#000',
    fontFamily: FONT.black,
    fontSize: 15,
    letterSpacing: 2,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.md,
    alignItems: 'center',
  },
  rarityDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  cardName: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardRarity: {
    fontFamily: FONT.semibold,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  cardPrice: {
    color: COLORS.primary,
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  disclaimer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  disclaimerText: {
    color: 'rgba(255,255,255,0.25)',
    fontFamily: FONT.regular,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
