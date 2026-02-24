import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useWallet } from '../../contexts/WalletContext';
import { COLORS, FONT, SPACING } from '../../constants/theme';

export function WalletButton() {
  const { connected, connecting, publicKey, balance, connect, disconnect } = useWallet();

  const truncatedAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : '';

  if (connecting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={COLORS.primary} size="small" />
        <Text style={styles.connectingText}>Connecting...</Text>
      </View>
    );
  }

  if (connected) {
    return (
      <TouchableOpacity style={styles.connectedContainer} onPress={disconnect}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceText}>
            {balance !== null ? `${balance.toFixed(2)} SOL` : '---'}
          </Text>
        </View>
        <View style={styles.addressBadge}>
          <View style={styles.dot} />
          <Text style={styles.addressText}>{truncatedAddress}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.connectButton} onPress={connect}>
      <Text style={styles.connectText}>Connect Wallet</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  connectingText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  connectButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 20,
  },
  connectText: {
    color: '#000',
    fontFamily: FONT.bold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  connectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  balanceRow: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 12,
  },
  balanceText: {
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  addressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  addressText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 13,
  },
});
