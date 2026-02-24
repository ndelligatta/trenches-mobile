import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT, SPACING } from '../constants/theme';
import { SHOP_CATEGORIES } from '../constants/items';
import { CategoryRow } from '../components/shop/CategoryRow';
import { WalletButton } from '../components/shop/WalletButton';

const TABS = ['Shop', 'Inventory', 'Rewards'] as const;

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Shop');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Deep blue gradient background like the website */}
      <LinearGradient
        colors={['#0774bb', '#052f6f', '#040a3f']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={{ paddingTop: insets.top, flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../assets/shop/trenches-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.title}>TRENCHES</Text>
              <Text style={styles.subtitle}>ITEM SHOP</Text>
            </View>
          </View>
          <WalletButton />
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>$TRENCH IS LIVE</Text>
          <TouchableOpacity style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>BUY $TRENCH</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {activeTab === 'Shop' && (
            <>
              {SHOP_CATEGORIES.map(category => (
                <CategoryRow key={category.id} category={category} />
              ))}
              <View style={{ height: 100 }} />
            </>
          )}

          {activeTab === 'Inventory' && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎒</Text>
              <Text style={styles.emptyTitle}>Your Inventory</Text>
              <Text style={styles.emptySubtitle}>
                Connect your wallet to see your purchased items
              </Text>
            </View>
          )}

          {activeTab === 'Rewards' && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🏆</Text>
              <Text style={styles.emptyTitle}>Rewards</Text>
              <Text style={styles.emptySubtitle}>
                Earn $TRENCH by winning matches and completing challenges
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: FONT.black,
    fontSize: 28,
    letterSpacing: 3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 4,
    marginTop: -2,
  },
  banner: {
    marginHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  bannerText: {
    color: COLORS.primary,
    fontFamily: FONT.bold,
    fontSize: 16,
    letterSpacing: 1,
  },
  bannerButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 8,
  },
  bannerButtonText: {
    color: '#000',
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  tabTextActive: {
    color: '#000',
  },
  scroll: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 22,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FONT.regular,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
