import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT } from '../constants/theme';
import { WalletButton } from '../components/shop/WalletButton';
import { ShopTab } from '../components/tabs/ShopTab';
import { MarketTab } from '../components/tabs/MarketTab';
import { PacksTab } from '../components/tabs/PacksTab';
import { InventoryTab } from '../components/tabs/InventoryTab';
import { RewardsTab } from '../components/tabs/RewardsTab';

const GRID_PADDING = 12;

const TABS = [
  { id: 'shop', label: 'Shop', icon: '\u{1F6D2}' },
  { id: 'market', label: 'Market', icon: '\u{1F4B0}' },
  { id: 'packs', label: 'Packs', icon: '\u{1F3B4}', featured: true },
  { id: 'inventory', label: 'Inventory', icon: '\u{1F4E6}' },
  { id: 'rewards', label: 'Rewards', icon: '\u2B50' },
] as const;

const TAB_SUBTITLES: Record<string, string> = {
  shop: 'ITEM SHOP',
  market: 'MARKETPLACE',
  packs: 'CARD PACKS',
  inventory: 'INVENTORY',
  rewards: 'REWARDS',
};

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>('shop');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#061a38', '#040e22', '#020814']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.title}>TRENCHES</Text>
            <Text style={styles.subtitle}>{TAB_SUBTITLES[activeTab] || 'ITEM SHOP'}</Text>
          </View>
        </View>
        <WalletButton />
      </View>

      {/* Active tab content */}
      <View style={styles.content}>
        {activeTab === 'shop' && <ShopTab />}
        {activeTab === 'market' && <MarketTab />}
        {activeTab === 'packs' && <PacksTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'rewards' && <RewardsTab />}
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
});
