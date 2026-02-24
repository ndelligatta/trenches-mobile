import React from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ShopItem } from '../../constants/items';
import { COLORS, FONT, RARITY_COLORS } from '../../constants/theme';

interface ItemCardProps {
  item: ShopItem;
  cardWidth: number;
}

export function ItemCard({ item, cardWidth }: ItemCardProps) {
  const [bg1, bg2, bg3] = item.bgGradient;
  const rarityColor = RARITY_COLORS[item.rarity];
  const cardHeight = Math.floor(cardWidth * 1.25);

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth, height: cardHeight }]}
      activeOpacity={0.85}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      {/* Background gradient */}
      <LinearGradient
        colors={[bg1, bg2, bg3]}
        style={StyleSheet.absoluteFill}
      />

      {/* Rarity color bar at top */}
      <View style={[styles.rarityBar, { backgroundColor: rarityColor }]} />

      {/* Character image */}
      <Image source={item.image} style={styles.charImage} resizeMode="cover" />

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
        colors={['transparent', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.92)']}
        style={styles.infoGradient}
      >
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.bottomRow}>
          <Text style={[styles.typeName, { color: rarityColor }]}>{item.rarity}</Text>
          <View style={styles.priceRow}>
            <View style={styles.trenchIcon}>
              <Text style={styles.trenchSymbol}>V</Text>
            </View>
            <Text style={styles.priceText}>
              {item.price === -1 ? 'N/A' : item.price.toLocaleString()}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  rarityBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 10,
  },
  charImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 6,
    zIndex: 10,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: FONT.bold,
    fontSize: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 28,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  itemName: {
    color: '#fff',
    fontFamily: FONT.bold,
    fontSize: 13,
    lineHeight: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  typeName: {
    fontFamily: FONT.semibold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trenchIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trenchSymbol: {
    color: '#000',
    fontFamily: FONT.bold,
    fontSize: 8,
  },
  priceText: {
    color: '#fff',
    fontFamily: FONT.bold,
    fontSize: 12,
  },
});
