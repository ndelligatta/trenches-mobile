import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { COLORS, FONT, SPACING } from '../constants/theme';

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#061a38', '#040e22', '#020814']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PRIVACY POLICY</Text>
        <View style={{ width: 60 }} />
      </View>

      <WebView
        source={{ uri: 'https://trenchesgame.com/privacy.html' }}
        style={styles.webview}
        startInLoadingState
        injectedJavaScript={`
          document.querySelector('.main-nav')?.remove();
          document.querySelector('.main-footer')?.remove();
          document.body.style.backgroundColor = '#0a0a14';
          true;
        `}
      />
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
  webview: {
    flex: 1,
    backgroundColor: '#0a0a14',
  },
});
