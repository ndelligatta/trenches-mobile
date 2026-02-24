import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getItemById } from '../../constants/items';
import { COLORS, FONT, SPACING, RARITY_COLORS } from '../../constants/theme';
import { useWallet } from '../../contexts/WalletContext';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { connected, connect } = useWallet();
  const [purchasing, setPurchasing] = useState(false);

  const item = getItemById(id);

  if (!item) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Item not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rarityColor = RARITY_COLORS[item.rarity];
  const [bg1, bg2, bg3] = item.bgGradient;
  const isNotForSale = item.price === -1;

  const handlePurchase = async () => {
    if (!connected) {
      await connect();
      return;
    }

    setPurchasing(true);
    setTimeout(() => {
      setPurchasing(false);
      Alert.alert('Purchase', 'Transaction flow coming soon! This will send $TRENCH to purchase the item.');
    }, 1500);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>ITEM DETAILS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Item preview with real image */}
        <View style={styles.previewCard}>
          <LinearGradient
            colors={[bg1, bg2, bg3]}
            style={StyleSheet.absoluteFill}
          />
          <Image
            source={item.image}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <View style={styles.badgeRow}>
            {item.badge && (
              <View style={[
                styles.badge,
                { backgroundColor: item.badge === '1 OF 1' ? COLORS.mythic : rarityColor }
              ]}>
                <Text style={[
                  styles.badgeText,
                  { color: item.badge === '1 OF 1' ? '#fff' : '#000' }
                ]}>{item.badge}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Item info */}
        <View style={styles.infoSection}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemType}>{item.typeName}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <View style={styles.trenchIcon}>
                <Text style={styles.trenchT}>V</Text>
              </View>
              <Text style={styles.priceText}>
                {item.price === -1 ? '∞' : item.price.toLocaleString()}
              </Text>
              <Text style={styles.currencyLabel}>$TRENCH</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{item.rarity === 'mythic' ? '1' : '∞'}</Text>
              <Text style={styles.statLabel}>Supply</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{item.typeName.split(' ')[1] || item.type}</Text>
              <Text style={styles.statLabel}>Type</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: rarityColor }]}>
                {item.rarity}
              </Text>
              <Text style={styles.statLabel}>Rarity</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Purchase button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.md }]}>
        {isNotForSale ? (
          <View style={[styles.purchaseButton, { backgroundColor: COLORS.surface }]}>
            <Text style={[styles.purchaseText, { color: COLORS.textMuted }]}>
              NOT FOR SALE
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={handlePurchase}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.purchaseText}>
                {connected ? 'PURCHASE' : 'CONNECT WALLET TO BUY'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  backLink: {
    color: COLORS.primary,
    fontFamily: FONT.semibold,
    fontSize: 16,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: COLORS.text,
    fontSize: 20,
  },
  topTitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT.bold,
    fontSize: 13,
    letterSpacing: 2,
  },
  previewCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: 20,
    height: 320,
    overflow: 'hidden',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    gap: 6,
    zIndex: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  infoSection: {
    padding: SPACING.lg,
  },
  itemName: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 28,
    letterSpacing: 0.5,
  },
  itemType: {
    color: COLORS.textMuted,
    fontFamily: FONT.semibold,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  description: {
    color: COLORS.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: SPACING.md,
  },
  priceContainer: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  trenchIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trenchT: {
    color: '#000',
    fontFamily: FONT.black,
    fontSize: 16,
  },
  priceText: {
    color: COLORS.primary,
    fontFamily: FONT.bold,
    fontSize: 28,
  },
  currencyLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 14,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 16,
    textTransform: 'capitalize',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
  },
  bottomBar: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchaseText: {
    color: '#000',
    fontFamily: FONT.black,
    fontSize: 16,
    letterSpacing: 2,
  },
});
