import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT, SPACING } from '../../constants/theme';

export function RewardsTab() {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>XP</Text>
      </View>
      <Text style={styles.title}>Rewards</Text>
      <Text style={styles.subtitle}>
        Earn $TRENCH by winning matches and completing challenges
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: SPACING.xl,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245,197,24,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconText: {
    color: COLORS.primary,
    fontFamily: FONT.black,
    fontSize: 16,
    letterSpacing: 1,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 20,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FONT.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
