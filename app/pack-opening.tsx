import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, FONT, SPACING } from '../constants/theme';
import {
  PACKS,
  RARITY_COLORS,
  RARITY_GLOW,
  type RewardItem,
} from '../constants/packs';
import { useWallet } from '../contexts/WalletContext';

// Same base URL used by the working ModelViewer component
const MODEL_BASE_URL = 'https://trenchesgame.com';

const { width: SCREEN_W } = Dimensions.get('window');
const PARTICLE_COUNT = 30;

type Stage = 'ready' | 'opening' | 'reveal';

export default function PackOpeningScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { pack: packId } = useLocalSearchParams<{ pack: string }>();
  const { connected, connectMWA, purchasePack } = useWallet();

  const pack = PACKS[packId ?? 'starter-pack'] ?? PACKS['starter-pack'];
  // All packs $0.10 for testing (v1)
  const packPriceUsdc = 0.10;

  const [stage, setStage] = useState<Stage>('ready');
  const [reward, setReward] = useState<RewardItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [chestLoaded, setChestLoaded] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [loadSlow, setLoadSlow] = useState(false);
  const webviewRef = useRef<WebView>(null);

  // Intro overlay
  const introOpacity = useRef(new Animated.Value(1)).current;
  const spinnerPulse = useRef(new Animated.Value(0.4)).current;

  // Chest animations
  const chestScale = useRef(new Animated.Value(1)).current;
  const chestOpacity = useRef(new Animated.Value(1)).current;

  // Flash
  const flashOpacity = useRef(new Animated.Value(0)).current;

  // Card reveal
  const cardScale = useRef(new Animated.Value(0.3)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardRotateY = useRef(new Animated.Value(90)).current;

  // Glow pulse
  const glowScale = useRef(new Animated.Value(0.5)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // Particles
  const particleAnims = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    })),
  ).current;

  // ── Intro: fades out ONLY when chest is loaded ──
  const dismissIntro = useCallback(() => {
    if (introDone) return;
    Animated.timing(introOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setIntroDone(true));
  }, [introDone, introOpacity]);

  // Subtle pulse on spinner while loading
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(spinnerPulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(spinnerPulse, { toValue: 0.4, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    pulse.start();

    // If loading takes >10s, show a "tap to skip" hint
    const slowTimer = setTimeout(() => setLoadSlow(true), 10000);

    return () => { pulse.stop(); clearTimeout(slowTimer); };
  }, []);

  // Dismiss intro ONLY when chest is loaded
  useEffect(() => {
    if (chestLoaded && !introDone) {
      // Brief delay so transition feels smooth
      const t = setTimeout(dismissIntro, 300);
      return () => clearTimeout(t);
    }
  }, [chestLoaded, introDone, dismissIntro]);

  // ── HTML: exact same pattern as ModelViewer.tsx but with animation control ──
  const chestHtml = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden}
body{background:linear-gradient(180deg,#0a0a20,#060e22,#040e22)}
model-viewer{width:100%;height:100%;background:transparent;--poster-color:transparent}
model-viewer::part(default-progress-bar){display:none}
.loading{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:rgba(255,255,255,0.5);font-family:system-ui;font-size:13px;text-align:center}
</style>
</head><body>
<div class="loading" id="loader">Loading 3D Model...</div>
<model-viewer id="chest"
  src="models/treasure-chest.glb"
  alt="Treasure Chest"
  auto-rotate
  rotation-per-second="30deg"
  camera-controls
  disable-zoom
  touch-action="pan-y"
  shadow-intensity="1"
  exposure="1.2"
  camera-orbit="0deg 75deg 105%"
  field-of-view="45deg"
  min-field-of-view="45deg"
  max-field-of-view="45deg"
  interaction-prompt="none"
></model-viewer>
<script>
var mv = document.getElementById('chest');
mv.addEventListener('load', function(){
  document.getElementById('loader').style.display = 'none';
  window.ReactNativeWebView.postMessage(JSON.stringify({type:'loaded'}));
});
mv.addEventListener('error', function(e){
  document.getElementById('loader').textContent = 'Failed to load model';
  window.ReactNativeWebView.postMessage(JSON.stringify({type:'error', detail:String(e.detail||e.message||'')}));
});
setTimeout(function(){
  if(document.getElementById('loader').style.display !== 'none'){
    document.getElementById('loader').textContent = 'Still loading...';
  }
}, 8000);

function handleMsg(e){
  try {
    var msg = JSON.parse(e.data);
    if (msg.action === 'playOpen') {
      mv.removeAttribute('auto-rotate');
      mv.animationName = 'HarrisChestClips';
      mv.play({repetitions: 1});
      mv.addEventListener('finished', function(){
        window.ReactNativeWebView.postMessage(JSON.stringify({type:'animDone'}));
      }, {once: true});
      setTimeout(function(){
        window.ReactNativeWebView.postMessage(JSON.stringify({type:'animDone'}));
      }, 4000);
    } else if (msg.action === 'reset') {
      mv.setAttribute('auto-rotate', '');
      mv.pause();
      mv.currentTime = 0;
    }
  } catch(err){}
}
document.addEventListener('message', handleMsg);
window.addEventListener('message', handleMsg);
</script>
</body></html>`;

  // ── WebView message handler ──
  const onMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'loaded') setChestLoaded(true);
      if (msg.type === 'animDone') runRevealSequence();
      if (msg.type === 'error') console.warn('Chest model error:', msg.detail);
    } catch {}
  }, []);

  // ── Animation helpers ──

  const resetAnims = useCallback(() => {
    chestScale.setValue(1);
    chestOpacity.setValue(1);
    flashOpacity.setValue(0);
    cardScale.setValue(0.3);
    cardOpacity.setValue(0);
    cardRotateY.setValue(90);
    glowScale.setValue(0.5);
    glowOpacity.setValue(0);
    particleAnims.forEach((p) => {
      p.x.setValue(0);
      p.y.setValue(0);
      p.opacity.setValue(0);
      p.scale.setValue(0);
    });
  }, [chestScale, chestOpacity, flashOpacity, cardScale, cardOpacity, cardRotateY, glowScale, glowOpacity, particleAnims]);

  // Phase 2: after chest open animation finishes -> flash, particles, card reveal
  const runRevealSequence = useCallback(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(chestScale, { toValue: 1.3, duration: 200, easing: Easing.out(Easing.exp), useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(chestOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        ...particleAnims.map((p, i) => {
          const angle = (Math.PI * 2 * i) / PARTICLE_COUNT;
          const dist = 120 + Math.random() * 100;
          return Animated.parallel([
            Animated.timing(p.opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
            Animated.timing(p.scale, { toValue: 0.5 + Math.random() * 1, duration: 100, useNativeDriver: true }),
            Animated.timing(p.x, { toValue: Math.cos(angle) * dist, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(p.y, { toValue: Math.sin(angle) * dist, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          ]);
        }),
      ]),
      Animated.parallel(
        particleAnims.map((p) =>
          Animated.timing(p.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ),
      ),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(cardScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(cardRotateY, { toValue: 0, duration: 500, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.6, duration: 400, useNativeDriver: true }),
        Animated.timing(glowScale, { toValue: 1.2, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start(() => {
      setStage('reveal');
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowScale, { toValue: 1.4, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1.1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ).start();
    });
  }, [chestScale, chestOpacity, flashOpacity, cardScale, cardOpacity, cardRotateY, glowScale, glowOpacity, particleAnims]);

  // OPEN PACK: purchase on-chain → server rolls item → THEN animate
  const handleOpenPack = useCallback(async () => {
    if (stage === 'opening' || purchasing) return;

    if (!connected) {
      connectMWA();
      return;
    }

    setPurchasing(true);
    try {
      const result = await purchasePack(packId ?? 'starter-pack', packPriceUsdc);
      if (!result) {
        // User cancelled or error — stay on ready stage
        setPurchasing(false);
        return;
      }

      // Server returned a real item — set reward, then play animation
      const rewardItem: RewardItem = {
        name: result.name,
        type: result.rarity.charAt(0).toUpperCase() + result.rarity.slice(1) + ' Item',
        rarity: result.rarity as RewardItem['rarity'],
        img: result.image_url || `https://trenchesgame.com/${result.skin_type_id}.png`,
        skinTypeId: result.skin_type_id,
        serialNumber: result.serial_number,
        maxSupply: result.max_supply,
      };
      setReward(rewardItem);
      setStage('opening');

      // Tell the 3D chest to play its open animation
      webviewRef.current?.postMessage(JSON.stringify({ action: 'playOpen' }));
    } catch (err: any) {
      console.error('[PACK-OPENING] Error:', err?.message);
    }
    setPurchasing(false);
  }, [stage, purchasing, connected, connectMWA, purchasePack, packId, packPriceUsdc]);

  const openAnother = useCallback(() => {
    resetAnims();
    setReward(null);
    setStage('ready');
    setChestLoaded(false);
    // Tell WebView to reset chest to closed position
    webviewRef.current?.postMessage(JSON.stringify({ action: 'reset' }));
    // Give it a moment to reset then mark loaded again
    setTimeout(() => setChestLoaded(true), 500);
  }, [resetAnims]);

  const rarityColor = reward ? RARITY_COLORS[reward.rarity] ?? '#fff' : '#fff';
  const rarityGlow = reward ? RARITY_GLOW[reward.rarity] ?? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.2)';

  const cardRotateInterp = cardRotateY.interpolate({
    inputRange: [0, 90],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#061a38', '#040e22', '#020814']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.packType}>{pack.type}</Text>
          <Text style={styles.packName}>{pack.name}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <Text style={styles.subtitle}>
        {purchasing ? 'Processing payment...' : stage === 'ready' ? 'Tap below to reveal your items' : stage === 'opening' ? 'Opening...' : ''}
      </Text>

      {/* Main area */}
      <View style={styles.stageArea}>
        {/* Particles */}
        {particleAnims.map((p, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                opacity: p.opacity,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  { scale: p.scale },
                ],
                backgroundColor: [
                  COLORS.primary, '#FF6B6B', '#4ECDC4', '#A855F7', '#fff',
                  '#F59E0B', '#3B82F6', '#EC4899',
                ][i % 8],
              },
            ]}
          />
        ))}

        {/* Flash overlay */}
        <Animated.View
          style={[styles.flash, { opacity: flashOpacity }]}
          pointerEvents="none"
        />

        {/* 3D Treasure Chest */}
        {stage !== 'reveal' && (
          <Animated.View
            style={[
              styles.chestWrap,
              {
                opacity: chestOpacity,
                transform: [{ scale: chestScale }],
              },
            ]}
          >
            <View style={styles.chestGlow} />
            <View style={styles.chestModelContainer}>
              {/* Exact same WebView props as ModelViewer.tsx */}
              <WebView
                ref={webviewRef}
                source={{ html: chestHtml, baseUrl: MODEL_BASE_URL }}
                style={styles.webview}
                originWhitelist={['*']}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                scrollEnabled={false}
                bounces={false}
                overScrollMode="never"
                mixedContentMode="always"
                allowFileAccess
                allowUniversalAccessFromFileURLs
                androidLayerType="hardware"
                onMessage={onMessage}
                onError={() => console.warn('Chest WebView error')}
              />
            </View>
          </Animated.View>
        )}

        {/* Rarity glow behind card */}
        {reward && (
          <Animated.View
            style={[
              styles.rarityGlow,
              {
                opacity: glowOpacity,
                backgroundColor: rarityGlow,
                transform: [{ scale: glowScale }],
              },
            ]}
          />
        )}

        {/* Revealed card */}
        {reward && (
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardOpacity,
                borderColor: rarityColor,
                transform: [
                  { scale: cardScale },
                  { perspective: 800 },
                  { rotateY: cardRotateInterp },
                ],
              },
            ]}
          >
            <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
              <Text style={styles.rarityBadgeText}>{reward.rarity.toUpperCase()}</Text>
            </View>
            <View style={styles.cardImageWrap}>
              <Image
                source={{ uri: reward.img }}
                style={styles.cardImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.cardName}>{reward.name.toUpperCase()}</Text>
            <Text style={[styles.cardType, { color: rarityColor }]}>{reward.type}</Text>
            {reward.serialNumber != null && reward.maxSupply != null && (
              <Text style={styles.cardSerial}>#{reward.serialNumber} of {reward.maxSupply}</Text>
            )}
          </Animated.View>
        )}
      </View>

      {/* Loading overlay - stays until chest model is ready */}
      {!introDone && (
        <Animated.View style={[styles.introOverlay, { opacity: introOpacity }]} pointerEvents={introDone ? 'none' : 'auto'}>
          <LinearGradient colors={['#061a38', '#040e22', '#020814']} style={StyleSheet.absoluteFill} />
          <Animated.View style={[styles.introContent, { opacity: spinnerPulse }]}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </Animated.View>
          <Text style={styles.introPackName}>{pack.name}</Text>
          {loadSlow && (
            <TouchableOpacity style={styles.skipBtn} onPress={dismissIntro}>
              <Text style={styles.skipText}>Tap to skip</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Bottom actions */}
      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 16 }]}>
        {stage === 'ready' && (
          <TouchableOpacity
            style={styles.openBtn}
            onPress={handleOpenPack}
            activeOpacity={0.8}
            disabled={purchasing}
          >
            <LinearGradient
              colors={purchasing ? ['#666', '#444'] : ['#A855F7', '#7C3AED']}
              style={styles.openBtnGrad}
            >
              {purchasing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.openBtnText}>
                  {connected ? `OPEN PACK — $${packPriceUsdc.toFixed(2)}` : 'LOGIN TO OPEN'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {stage === 'reveal' && (
          <View style={styles.revealActions}>
            <TouchableOpacity
              style={styles.openAnotherBtn}
              onPress={openAnother}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#A855F7', '#7C3AED']}
                style={styles.openBtnGrad}
              >
                <Text style={styles.openBtnText}>OPEN ANOTHER — ${packPriceUsdc.toFixed(2)}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backToShopBtn} onPress={() => router.back()}>
              <Text style={styles.backToShopText}>BACK TO SHOP</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingHorizontal: SPACING.md,
    paddingBottom: 8,
  },
  backBtn: { width: 60 },
  backText: { color: COLORS.primary, fontFamily: FONT.semibold, fontSize: 15 },
  headerCenter: { alignItems: 'center' },
  packType: {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  packName: {
    color: COLORS.text,
    fontFamily: FONT.black,
    fontSize: 20,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: FONT.medium,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  stageArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chestWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_W * 0.8,
    height: SCREEN_W * 0.8,
  },
  chestGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(168,85,247,0.12)',
  },
  chestModelContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 5,
  },
  rarityGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  card: {
    width: SCREEN_W * 0.72,
    backgroundColor: 'rgba(20,20,30,0.95)',
    borderRadius: 20,
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
    zIndex: 15,
  },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  rarityBadgeText: {
    color: '#000',
    fontFamily: FONT.black,
    fontSize: 12,
    letterSpacing: 2,
  },
  cardImageWrap: {
    width: SCREEN_W * 0.55,
    height: SCREEN_W * 0.55,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '85%',
    height: '85%',
  },
  cardName: {
    color: COLORS.text,
    fontFamily: FONT.black,
    fontSize: 22,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardType: {
    fontFamily: FONT.medium,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  cardSerial: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 6,
  },
  bottomArea: {
    paddingHorizontal: SPACING.lg,
  },
  openBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  openBtnGrad: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  openBtnText: {
    color: '#fff',
    fontFamily: FONT.black,
    fontSize: 16,
    letterSpacing: 2,
  },
  revealActions: {
    gap: 10,
  },
  openAnotherBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  backToShopBtn: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  backToShopText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.bold,
    fontSize: 14,
    letterSpacing: 1.5,
  },
  // Loading overlay
  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introContent: {
    alignItems: 'center',
  },
  introPackName: {
    color: 'rgba(255,255,255,0.25)',
    fontFamily: FONT.bold,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 20,
  },
  skipBtn: {
    position: 'absolute',
    bottom: 100,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: FONT.medium,
    fontSize: 13,
  },
});
