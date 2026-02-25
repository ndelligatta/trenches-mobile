import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useWallet } from '../contexts/WalletContext';
import { COLORS, FONT, SPACING } from '../constants/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    address,
    balance,
    player,
    playerName,
    playerLoading,
    connectedVia,
    disconnect,
    updatePlayerName,
    refreshPlayer,
  } = useWallet();

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(playerName ?? '');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!address) return;
    // Use deprecated but still functional RN Clipboard
    const { Clipboard: RNClipboard } = require('react-native');
    if (RNClipboard?.setString) {
      RNClipboard.setString(address);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-6)}`
    : '';

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    await updatePlayerName(trimmed);
    setEditing(false);
  };

  const handleDisconnect = () => {
    disconnect();
    router.back();
  };

  const ownedItems = player?.purchased_items
    ? Object.keys(player.purchased_items)
    : [];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#061a38', '#040e22', '#020814']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar + Name */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={['rgba(245,197,24,0.12)', 'transparent']}
            style={styles.avatarGlow}
          />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(playerName ?? address ?? '?').charAt(0).toUpperCase()}
            </Text>
          </View>

          {editing ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Enter name..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                autoFocus
                maxLength={20}
              />
              <TouchableOpacity style={styles.nameSaveBtn} onPress={handleSaveName}>
                <Text style={styles.nameSaveBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text style={styles.nameCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => { setNameInput(playerName ?? ''); setEditing(true); }}>
              <Text style={styles.playerName}>{playerName ?? 'Set Name'}</Text>
              <Text style={styles.editHint}>tap to edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Wallet Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>WALLET</Text>
            <View style={styles.connectionBadge}>
              <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.connectionText}>
                {connectedVia === 'mwa' ? 'Seed Vault' : 'AppKit'}
              </Text>
            </View>
          </View>

          {/* Copyable address */}
          <TouchableOpacity style={styles.addressRow} onPress={copyAddress} activeOpacity={0.7}>
            <Text style={styles.addressFull} numberOfLines={1} ellipsizeMode="middle">
              {address}
            </Text>
            <View style={[styles.copyBadge, copied && styles.copyBadgeCopied]}>
              <Text style={[styles.copyBadgeText, copied && styles.copyBadgeTextCopied]}>
                {copied ? 'COPIED' : 'COPY'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* QR Code toggle */}
          <TouchableOpacity
            style={styles.qrToggle}
            onPress={() => setShowQR(!showQR)}
          >
            <Text style={styles.qrToggleText}>
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </Text>
          </TouchableOpacity>

          {showQR && address && (
            <View style={styles.qrContainer}>
              <View style={styles.qrWebviewWrap}>
                <WebView
                  source={{ html: `<html><body style="margin:0;display:flex;justify-content:center;align-items:center;background:#fff;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${address}" style="width:100%;height:100%;" /></body></html>` }}
                  style={{ width: 200, height: 200 }}
                  scrollEnabled={false}
                  scalesPageToFit={false}
                />
              </View>
              <Text style={styles.qrHint}>
                Scan to send SOL or USDC to this wallet
              </Text>
            </View>
          )}

          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>SOL Balance</Text>
              <Text style={styles.balanceValue}>
                {balance !== null ? `${balance.toFixed(4)} SOL` : '---'}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>$TRENCH</Text>
              <Text style={styles.balanceValue}>Coming Soon</Text>
            </View>
          </View>
        </View>

        {/* Game Stats Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>GAME STATS</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player?.games_played ?? 0}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player?.wins ?? 0}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player?.kills ?? 0}</Text>
              <Text style={styles.statLabel}>Kills</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>
                {player?.currency?.toLocaleString() ?? 0}
              </Text>
              <Text style={styles.statLabel}>Currency</Text>
            </View>
          </View>
        </View>

        {/* Inventory Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>INVENTORY</Text>
          {ownedItems.length > 0 ? (
            <View style={styles.inventoryGrid}>
              {ownedItems.map((itemId) => (
                <View key={itemId} style={styles.inventoryItem}>
                  <Text style={styles.inventoryItemText}>{itemId}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No items yet. Visit the shop!</Text>
          )}
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.refreshBtn} onPress={refreshPlayer}>
          <Text style={styles.refreshBtnText}>Refresh Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: 'rgba(245,197,24,0.1)', borderColor: 'rgba(245,197,24,0.2)' }]}
          onPress={() => router.push('/test-swap')}
        >
          <Text style={[styles.refreshBtnText, { color: COLORS.primary }]}>Test Swap (Dev)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
          <Text style={styles.disconnectBtnText}>Disconnect Wallet</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: 12,
  },
  backBtn: { width: 60 },
  backText: {
    color: COLORS.primary,
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  headerTitle: {
    color: COLORS.text,
    fontFamily: FONT.black,
    fontSize: 16,
    letterSpacing: 3,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarGlow: {
    position: 'absolute',
    top: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245,197,24,0.15)',
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: COLORS.primary,
    fontFamily: FONT.black,
    fontSize: 32,
  },
  playerName: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 22,
    textAlign: 'center',
  },
  editHint: {
    color: 'rgba(255,255,255,0.2)',
    fontFamily: FONT.regular,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: COLORS.text,
    fontFamily: FONT.medium,
    fontSize: 16,
    minWidth: 150,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  nameSaveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  nameSaveBtnText: {
    color: '#000',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  nameCancelText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  // Cards
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(46,204,113,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 12,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  connectionText: {
    color: COLORS.success,
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  addressFull: {
    flex: 1,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FONT.regular,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  copyBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  copyBadgeCopied: {
    backgroundColor: 'rgba(46,204,113,0.15)',
    borderColor: 'rgba(46,204,113,0.3)',
  },
  copyBadgeText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  copyBadgeTextCopied: {
    color: COLORS.success,
  },
  qrToggle: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(245,197,24,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,197,24,0.15)',
    marginBottom: 12,
  },
  qrToggleText: {
    color: COLORS.primary,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrWebviewWrap: {
    width: 216,
    height: 216,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  qrHint: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: FONT.regular,
    fontSize: 11,
    textAlign: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  balanceItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FONT.medium,
    fontSize: 11,
    marginBottom: 4,
  },
  balanceValue: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontFamily: FONT.black,
    fontSize: 24,
    marginBottom: 2,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FONT.medium,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  // Inventory
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inventoryItem: {
    backgroundColor: 'rgba(245,197,24,0.08)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(245,197,24,0.15)',
  },
  inventoryItemText: {
    color: COLORS.primary,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.25)',
    fontFamily: FONT.regular,
    fontSize: 13,
  },
  // Actions
  refreshBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: SPACING.sm,
  },
  refreshBtnText: {
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  disconnectBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(231,76,60,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.15)',
  },
  disconnectBtnText: {
    color: COLORS.error,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
});
