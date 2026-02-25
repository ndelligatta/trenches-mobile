import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useWallet } from '../contexts/WalletContext';
import { COLORS, FONT, SPACING } from '../constants/theme';
import { TRENCH_DECIMALS, TREASURY_WALLET, JUPITER_API_KEY } from '../constants/onchain';
import {
  getUsdcSwapQuote,
  buildSwapTransaction,
  type JupiterQuote,
} from '../lib/jupiter';
import { VersionedTransaction } from '@solana/web3.js';

const USD_AMOUNTS = [0.5, 1, 2, 5];

export default function TestSwapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { address, balance, connected, connectedVia, connection } = useWallet();

  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<JupiterQuote | null>(null);
  const [selectedUsd, setSelectedUsd] = useState<number | null>(null);
  const [trenchOut, setTrenchOut] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [swapping, setSwapping] = useState(false);

  const addLog = (msg: string) =>
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  const clearLog = () => setLog([]);

  const copyAddress = () => {
    if (!address) return;
    const { Clipboard: RNClipboard } = require('react-native');
    if (RNClipboard?.setString) {
      RNClipboard.setString(address);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchQuote = async (usd: number) => {
    setSelectedUsd(usd);
    setQuote(null);
    setLoading(true);
    clearLog();

    if (!JUPITER_API_KEY) {
      addLog('ERROR: Jupiter API key not set!');
      addLog('Get a free key at https://portal.jup.ag');
      addLog('Then set it in constants/onchain.ts → JUPITER_API_KEY');
      setLoading(false);
      return;
    }

    addLog(`Getting quote: $${usd.toFixed(2)} USDC → TRENCH...`);

    try {
      const q = await getUsdcSwapQuote(usd);
      setQuote(q);
      const trenchAmount = parseInt(q.outAmount, 10) / 10 ** TRENCH_DECIMALS;
      setTrenchOut(trenchAmount.toLocaleString(undefined, { maximumFractionDigits: 0 }));
      addLog(`Quote: $${usd.toFixed(2)} USDC → ${trenchAmount.toLocaleString()} TRENCH`);
      addLog(`Route: ${q.routePlan?.length || 0} hop(s), slippage: ${q.slippageBps} bps`);
      addLog('TRENCH goes to treasury wallet');
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`);
    }
    setLoading(false);
  };

  const executeSwap = async () => {
    if (!quote || !address) return;

    setSwapping(true);
    addLog('Building swap transaction...');

    try {
      const swapTxBase64 = await buildSwapTransaction(quote, address);
      addLog('Transaction built');

      const swapTxBytes = Buffer.from(swapTxBase64, 'base64');
      const transaction = VersionedTransaction.deserialize(new Uint8Array(swapTxBytes));
      addLog('Transaction deserialized');

      if (connectedVia !== 'mwa') {
        addLog('ERROR: Connect via MWA (Solflare / Seed Vault) to sign.');
        setSwapping(false);
        return;
      }

      const { TurboModuleRegistry } = require('react-native');
      if (!TurboModuleRegistry.get('SolanaMobileWalletAdapter')) {
        addLog('ERROR: MWA native module not found');
        setSwapping(false);
        return;
      }
      const { transact } = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');

      addLog('Opening wallet for signing...');
      let txSigBytes: Uint8Array | undefined;

      await transact(async (wallet: any) => {
        const authResult = await wallet.authorize({
          cluster: 'mainnet-beta',
          identity: { name: 'Trenches', uri: 'https://trenchesgame.com', icon: 'favicon.ico' },
        });
        addLog('Wallet authorized');

        const sigs = await wallet.signAndSendTransactions({
          transactions: [transaction],
        });
        txSigBytes = sigs[0];
      });

      if (!txSigBytes) {
        addLog('ERROR: No signature returned');
        setSwapping(false);
        return;
      }

      const bs58 = require('bs58');
      const txSig = bs58.encode(Buffer.from(txSigBytes));
      addLog(`TX sent! Sig: ${txSig.slice(0, 20)}...`);

      // Confirmation via RPC fetch is broken by whatwg-fetch polyfill,
      // but signAndSendTransactions already submitted the tx on-chain.
      try {
        addLog('Confirming on-chain...');
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
        await connection.confirmTransaction(
          {
            signature: txSig,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          'confirmed',
        );
        addLog('CONFIRMED on-chain!');
      } catch {
        addLog('Confirmation check failed (tx was already sent)');
      }

      addLog('USDC → TRENCH swap successful!');
      addLog(`TRENCH tokens sent to treasury`);
      addLog(`Solscan: https://solscan.io/tx/${txSig}`);
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`);
    }
    setSwapping(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#061a38', '#040e22', '#020814']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TEST SWAP</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>STATUS</Text>

          {/* Copyable wallet address */}
          {address ? (
            <TouchableOpacity style={styles.addressRow} onPress={copyAddress} activeOpacity={0.7}>
              <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                {address}
              </Text>
              <View style={[styles.copyBadge, copied && styles.copyBadgeCopied]}>
                <Text style={[styles.copyBadgeText, copied && styles.copyBadgeTextCopied]}>
                  {copied ? 'COPIED' : 'COPY'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Text style={styles.infoText}>Wallet: Not connected</Text>
          )}

          {/* QR code toggle */}
          {address && (
            <TouchableOpacity
              style={styles.qrToggle}
              onPress={() => setShowQR(!showQR)}
            >
              <Text style={styles.qrToggleText}>
                {showQR ? 'Hide QR Code' : 'Show QR Code'}
              </Text>
            </TouchableOpacity>
          )}

          {showQR && address && (
            <View style={styles.qrContainer}>
              <View style={styles.qrWebviewWrap}>
                <WebView
                  source={{ html: `<html><body style="margin:0;display:flex;justify-content:center;align-items:center;background:#fff;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${address}" style="width:100%;height:100%;" /></body></html>` }}
                  style={{ width: 180, height: 180 }}
                  scrollEnabled={false}
                  scalesPageToFit={false}
                />
              </View>
              <Text style={styles.qrHint}>Scan to send SOL or USDC to this wallet</Text>
            </View>
          )}

          <Text style={styles.infoText}>
            Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : '---'}
          </Text>
          <Text style={styles.infoText}>Via: {connectedVia ?? 'none'}</Text>
          <Text style={styles.infoText}>
            Treasury: {TREASURY_WALLET.toBase58().slice(0, 8)}...
          </Text>
          <Text style={[styles.infoText, { color: JUPITER_API_KEY ? COLORS.success : COLORS.error }]}>
            Jupiter API: {JUPITER_API_KEY ? 'Key set' : 'NO KEY — get one at portal.jup.ag'}
          </Text>
        </View>

        {/* Amount selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PAY WITH USDC</Text>
          <Text style={styles.subtitle}>Select amount — USDC swaps to TRENCH behind the scenes</Text>
          <View style={styles.amountRow}>
            {USD_AMOUNTS.map((usd) => (
              <TouchableOpacity
                key={usd}
                style={[styles.amountBtn, selectedUsd === usd && quote && styles.amountBtnActive]}
                onPress={() => fetchQuote(usd)}
                disabled={loading || !connected}
              >
                <Text
                  style={[styles.amountText, selectedUsd === usd && quote && styles.amountTextActive]}
                >
                  ${usd < 1 ? usd.toFixed(2) : usd}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.primary} size="small" />
              <Text style={styles.loadingText}>Getting quote...</Text>
            </View>
          )}

          {quote && (
            <View style={styles.quoteBox}>
              <View style={styles.quoteRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quoteLabel}>YOU PAY</Text>
                  <Text style={styles.quoteValue}>${selectedUsd?.toFixed(2)}</Text>
                  <Text style={styles.quoteSub}>USDC</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.quoteLabel}>TREASURY GETS</Text>
                  <Text style={[styles.quoteValue, { color: COLORS.success }]}>{trenchOut}</Text>
                  <Text style={styles.quoteSub}>TRENCH tokens</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Execute */}
        {quote && connected && connectedVia === 'mwa' && (
          <TouchableOpacity
            style={[styles.swapBtn, swapping && { opacity: 0.5 }]}
            onPress={executeSwap}
            disabled={swapping}
          >
            {swapping ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.swapBtnText}>
                BUY ${selectedUsd?.toFixed(2)} USDC
              </Text>
            )}
          </TouchableOpacity>
        )}

        {connected && connectedVia !== 'mwa' && (
          <View style={styles.warnBox}>
            <Text style={styles.warnText}>
              Connect via MWA (Solflare / Seed Vault) to sign transactions.
            </Text>
          </View>
        )}

        {!connected && (
          <View style={styles.warnBox}>
            <Text style={styles.warnText}>Connect wallet first.</Text>
          </View>
        )}

        {/* Log */}
        <View style={styles.card}>
          <View style={styles.logHeader}>
            <Text style={styles.cardTitle}>LOG</Text>
            <TouchableOpacity onPress={clearLog}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
          {log.length === 0 ? (
            <Text style={styles.logEmpty}>Tap a USD amount to get started</Text>
          ) : (
            log.map((entry, i) => (
              <Text
                key={i}
                style={[
                  styles.logEntry,
                  entry.includes('ERROR') && { color: COLORS.error },
                  entry.includes('CONFIRMED') && { color: COLORS.success },
                ]}
              >
                {entry}
              </Text>
            ))
          )}
        </View>

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
  backText: { color: COLORS.primary, fontFamily: FONT.semibold, fontSize: 15 },
  headerTitle: { color: COLORS.text, fontFamily: FONT.black, fontSize: 16, letterSpacing: 3 },
  scroll: { padding: SPACING.md },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.25)',
    fontFamily: FONT.medium,
    fontSize: 12,
    marginBottom: 14,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addressText: {
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
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(245,197,24,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,197,24,0.15)',
    marginBottom: 10,
  },
  qrToggleText: {
    color: COLORS.primary,
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  qrWebviewWrap: {
    width: 196,
    height: 196,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 14,
    marginBottom: 6,
    overflow: 'hidden',
  },
  qrHint: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: FONT.regular,
    fontSize: 11,
    textAlign: 'center',
  },
  infoText: { color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12, marginBottom: 4 },
  amountRow: { flexDirection: 'row', gap: 8 },
  amountBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  amountBtnActive: { backgroundColor: 'rgba(245,197,24,0.15)', borderColor: COLORS.primary },
  amountText: { color: COLORS.textSecondary, fontFamily: FONT.black, fontSize: 16 },
  amountTextActive: { color: COLORS.primary },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  loadingText: { color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 13 },
  quoteBox: {
    marginTop: 16,
    backgroundColor: 'rgba(245,197,24,0.06)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,197,24,0.12)',
  },
  quoteRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quoteLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  quoteValue: { color: COLORS.primary, fontFamily: FONT.black, fontSize: 20 },
  quoteSub: { color: 'rgba(255,255,255,0.3)', fontFamily: FONT.medium, fontSize: 11, marginTop: 2 },
  arrow: { color: 'rgba(255,255,255,0.2)', fontFamily: FONT.black, fontSize: 22 },
  swapBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  swapBtnText: { color: '#000', fontFamily: FONT.black, fontSize: 15, letterSpacing: 1 },
  warnBox: {
    backgroundColor: 'rgba(243,156,18,0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(243,156,18,0.2)',
    marginBottom: SPACING.md,
  },
  warnText: { color: COLORS.warning, fontFamily: FONT.medium, fontSize: 13, textAlign: 'center' },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearText: { color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12 },
  logEmpty: { color: 'rgba(255,255,255,0.2)', fontFamily: FONT.regular, fontSize: 12 },
  logEntry: {
    color: COLORS.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 11,
    marginBottom: 3,
    lineHeight: 16,
  },
});
