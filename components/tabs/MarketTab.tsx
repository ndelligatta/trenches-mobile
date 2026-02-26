import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT, SPACING } from '../../constants/theme';

export function MarketTab() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(245,197,24,0.08)', 'rgba(245,197,24,0.02)', 'transparent']}
        style={styles.glow}
      />
      <View style={styles.icon}>
        <Text style={styles.iconText}>$</Text>
      </View>
      <Text style={styles.title}>MARKETPLACE</Text>
      <Text style={styles.tag}>COMING SOON</Text>
      <Text style={styles.desc}>
        List, trade, and resell items with other players. Peer-to-peer marketplace powered by $TRENCH.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 80,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  icon: {
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
  iconText: {
    color: COLORS.primary,
    fontFamily: FONT.black,
    fontSize: 28,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONT.black,
    fontSize: 22,
    letterSpacing: 3,
    marginBottom: 8,
  },
  tag: {
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
  desc: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: FONT.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
});
