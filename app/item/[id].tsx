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
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getItemById, ITEM_COLORS } from '../../constants/items';
import { COLORS, FONT, SPACING, RARITY_COLORS } from '../../constants/theme';
import { useWallet } from '../../contexts/WalletContext';
import { ModelViewer } from '../../components/shop/ModelViewer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_HEIGHT = Math.min(SCREEN_WIDTH * 0.85, 340);

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { connected, connectMWA, purchaseItem } = useWallet();
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
  const has3DModel = !!item.model && Platform.OS !== 'web';

  const handlePurchase = async () => {
    if (!connected) {
      connectMWA();
      return;
    }

    setPurchasing(true);
    try {
      const success = await purchaseItem(item.id, item.price);
      if (success) {
        Alert.alert('Success', `${item.name} has been added to your inventory!`);
      }
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#061a38', '#040e22', '#020814']}
        style={StyleSheet.absoluteFill}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>ITEM DETAILS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Item preview - 3D model or image */}
        <View style={[styles.previewCard, { height: PREVIEW_HEIGHT }]}>
          {has3DModel ? (
            <ModelViewer
              modelFile={item.model!}
              cameraOrbit={item.cameraOrbit}
              bgGradient={item.bgGradient}
            />
          ) : (
            <>
              <LinearGradient
                colors={[bg1, bg2, bg3]}
                style={StyleSheet.absoluteFill}
              />
              <Image
                source={item.image}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </>
          )}
          {item.badge && (
            <View style={styles.badgeRow}>
              <View style={[
                styles.badge,
                { backgroundColor: item.badge === '1 OF 1' ? COLORS.mythic : rarityColor }
              ]}>
                <Text style={[
                  styles.badgeText,
                  { color: item.badge === '1 OF 1' ? '#fff' : '#000' }
                ]}>{item.badge}</Text>
              </View>
            </View>
          )}
          {/* Rarity bar at bottom of preview */}
          <View style={[styles.previewRarityBar, { backgroundColor: rarityColor }]} />
          {/* 3D indicator */}
          {has3DModel && (
            <View style={styles.indicator3d}>
              <Text style={styles.indicator3dText}>3D</Text>
            </View>
          )}
        </View>

        {/* Item info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={[styles.itemType, { color: rarityColor }]}>{item.typeName}</Text>
            </View>
            {/* Price inline with name */}
            <View style={styles.priceBox}>
              <View style={styles.trenchIcon}>
                <Text style={styles.trenchT}>V</Text>
              </View>
              <Text style={styles.priceText}>
                {item.price === -1 ? '∞' : item.price.toLocaleString()}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{item.description}</Text>

          {/* Stats row */}
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

          {/* Collection & Color */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Collection</Text>
              <Text style={styles.detailValue}>{item.collection}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Color</Text>
              <View style={styles.colorRow}>
                <View style={[styles.colorDot, { backgroundColor: ITEM_COLORS.find(c => c.name === item.color)?.hex || '#fff' }]} />
                <Text style={styles.detailValue}>{item.color}</Text>
              </View>
            </View>
          </View>

          {/* Specs */}
          <View style={styles.specsBox}>
            <Text style={styles.specsLabel}>SPECS</Text>
            <Text style={styles.specsText}>{item.specs}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Purchase button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.md }]}>
        {isNotForSale ? (
          <View style={[styles.purchaseButton, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
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
                {connected ? 'PURCHASE' : 'LOGIN TO BUY'}
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
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: COLORS.text,
    fontSize: 18,
  },
  topTitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 2,
  },
  previewCard: {
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewRarityBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
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
  indicator3d: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 2,
  },
  indicator3dText: {
    color: '#fff',
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  infoSection: {
    padding: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemName: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 24,
    letterSpacing: 0.3,
  },
  itemType: {
    fontFamily: FONT.semibold,
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 2,
  },
  trenchIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trenchT: {
    color: '#000',
    fontFamily: FONT.black,
    fontSize: 14,
  },
  priceText: {
    color: COLORS.primary,
    fontFamily: FONT.bold,
    fontSize: 22,
  },
  description: {
    color: COLORS.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15,
    textTransform: 'capitalize',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  detailItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
  },
  detailLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  specsBox: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
  },
  specsLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  specsText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomBar: {
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchaseText: {
    color: '#000',
    fontFamily: FONT.black,
    fontSize: 15,
    letterSpacing: 2,
  },
});
