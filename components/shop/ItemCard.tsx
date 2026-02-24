import React from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ShopItem } from '../../constants/items';
import { COLORS, FONT, SPACING, RARITY_COLORS } from '../../constants/theme';

const CARD_WIDTH = (Dimensions.get('window').width - SPACING.lg * 2 - SPACING.sm) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.6;

interface ItemCardProps {
  item: ShopItem;
  wide?: boolean;
}

export function ItemCard({ item, wide }: ItemCardProps) {
  const cardWidth = wide ? CARD_WIDTH * 1.3 : CARD_WIDTH;
  const [bg1, bg2, bg3] = item.bgGradient;

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      activeOpacity={0.85}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      {/* Background gradient */}
      <LinearGradient
        colors={[bg1, bg2, bg3]}
        style={StyleSheet.absoluteFill}
      />

      {/* Character image */}
      <Image
        source={item.image}
        style={styles.charImage}
        resizeMode="cover"
      />

      {/* Badge */}
      {item.badge && (
        <View style={styles.badgeContainer}>
          <View style={[
            styles.badge,
            { backgroundColor: item.badge === '1 OF 1' ? COLORS.mythic : COLORS.accent }
          ]}>
            <Text style={[
              styles.badgeText,
              { color: item.badge === '1 OF 1' ? '#fff' : '#000' }
            ]}>{item.badge}</Text>
          </View>
        </View>
      )}

      {/* Bottom info overlay */}
      <LinearGradient
        colors={['transparent', bg3 + 'cc', bg3]}
        style={styles.infoGradient}
      >
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemType}>{item.typeName}</Text>
        <View style={styles.priceRow}>
          <View style={styles.trenchIcon}>
            <Text style={styles.trenchSymbol}>V</Text>
          </View>
          <Text style={styles.priceText}>
            {item.price === -1 ? '∞' : item.price.toLocaleString()}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: SPACING.sm,
    height: CARD_HEIGHT,
  },
  charImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  badgeText: {
    fontFamily: FONT.bold,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  itemName: {
    color: '#fff',
    fontFamily: FONT.bold,
    fontSize: 14,
    lineHeight: 17,
  },
  itemType: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: FONT.medium,
    fontSize: 10,
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trenchIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trenchSymbol: {
    color: '#000',
    fontFamily: FONT.bold,
    fontSize: 9,
  },
  priceText: {
    color: '#fff',
    fontFamily: FONT.bold,
    fontSize: 13,
  },
});
