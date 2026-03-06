import React, { useRef, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Modal, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWallet } from '../../contexts/WalletContext';
import { COLORS, FONT, SPACING } from '../../constants/theme';

const TERMS_ACCEPTED_KEY = '@trenches_terms_accepted';

const TOS_URL = 'https://trenchesgame.com/terms';
const PP_URL = 'https://trenchesgame.com/privacy';

export function WalletButton() {
  const router = useRouter();
  const { connected, connecting, address, balance, playerName, connectMWA } = useWallet();
  const termsAccepted = useRef(false);
  const [showTerms, setShowTerms] = useState(false);

  const checkAndConnect = async () => {
    if (termsAccepted.current) {
      connectMWA();
      return;
    }

    const stored = await AsyncStorage.getItem(TERMS_ACCEPTED_KEY);
    if (stored === 'true') {
      termsAccepted.current = true;
      connectMWA();
      return;
    }

    setShowTerms(true);
  };

  const acceptTerms = async () => {
    termsAccepted.current = true;
    await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, 'true').catch(() => {});
    setShowTerms(false);
    connectMWA();
  };

  const displayName = playerName
    ? playerName
    : address
      ? `${address.slice(0, 4)}...${address.slice(-4)}`
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
      <TouchableOpacity style={styles.connectedContainer} onPress={() => router.push('/profile')}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceText}>
            {balance !== null ? `${balance.toFixed(2)} SOL` : '---'}
          </Text>
        </View>
        <View style={styles.addressBadge}>
          <View style={styles.dot} />
          <Text style={styles.addressText}>{displayName}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity style={styles.connectButton} onPress={checkAndConnect}>
        <Text style={styles.connectText}>Connect Wallet</Text>
      </TouchableOpacity>

      <Modal visible={showTerms} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Heads Up</Text>
            <Text style={styles.modalBody}>
              By connecting, you agree to our{' '}
              <Text style={styles.link} onPress={() => Linking.openURL(TOS_URL)}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text style={styles.link} onPress={() => Linking.openURL(PP_URL)}>
                Privacy Policy
              </Text>
              .
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowTerms(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.continueBtn} onPress={acceptTerms}>
                <Text style={styles.continueBtnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 18,
    marginBottom: 12,
  },
  modalBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  link: {
    color: COLORS.primary,
    fontFamily: FONT.semibold,
    textDecorationLine: 'underline' as const,
  },
  modalButtons: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center' as const,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  continueBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center' as const,
  },
  continueBtnText: {
    color: '#000',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
});
