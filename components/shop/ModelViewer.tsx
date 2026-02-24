import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, FONT } from '../../constants/theme';

const MODEL_BASE_URL = 'https://trenchesgame.com';

interface ModelViewerProps {
  modelFile: string;
  cameraOrbit?: string;
  bgGradient: [string, string, string];
}

export function ModelViewer({ modelFile, cameraOrbit, bgGradient }: ModelViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bg1, bg2, bg3] = bgGradient;
  const orbit = cameraOrbit || '45deg 75deg 5m';

  const html = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden}
body{background:linear-gradient(180deg,${bg1},${bg2},${bg3})}
model-viewer{width:100%;height:100%;background:transparent;--poster-color:transparent}
model-viewer::part(default-progress-bar){display:none}
.loading{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:rgba(255,255,255,0.5);font-family:system-ui;font-size:13px;text-align:center}
</style>
</head><body>
<div class="loading" id="loader">Loading 3D Model...</div>
<model-viewer
  src="${modelFile}"
  alt="3D Model"
  auto-rotate
  rotation-per-second="15deg"
  camera-controls
  touch-action="pan-y"
  shadow-intensity="1"
  exposure="1.2"
  camera-orbit="${orbit}"
  min-camera-orbit="auto auto 2m"
  max-camera-orbit="auto auto 20m"
  interaction-prompt="none"
></model-viewer>
<script>
var mv=document.querySelector('model-viewer');
mv.addEventListener('load',function(){
  document.getElementById('loader').style.display='none';
  window.ReactNativeWebView.postMessage('loaded');
});
mv.addEventListener('error',function(e){
  document.getElementById('loader').textContent='Failed to load model';
  window.ReactNativeWebView.postMessage('error:' + (e.detail || e.message || 'unknown'));
});
setTimeout(function(){
  if(document.getElementById('loader').style.display!=='none'){
    document.getElementById('loader').textContent='Still loading...';
  }
},8000);
</script>
</body></html>`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html, baseUrl: MODEL_BASE_URL }}
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
        onMessage={(event) => {
          const msg = event.nativeEvent.data;
          if (msg === 'loaded') setLoading(false);
          if (msg.startsWith('error')) { setLoading(false); setError(true); }
        }}
        onError={() => { setLoading(false); setError(true); }}
      />
      {loading && !error && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={COLORS.primary} size="small" />
          <Text style={styles.loadingText}>Loading 3D Model...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
});
