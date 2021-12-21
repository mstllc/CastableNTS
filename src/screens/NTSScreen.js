import React from 'react'
import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import { useSafeArea } from 'react-native-safe-area-context'
import { CastButton } from 'react-native-google-cast'

import { useChromecast } from '../contexts/chromecast'

const injectedJavaScript = `
  document.addEventListener('click', function(event) {
    var closest = event.target.closest('.mixcloud-btn');

    if (!closest) return;

    var src = closest.dataset.src;

    if (!src) return;

    event.preventDefault();
    event.stopPropagation();
    closest.blur();
    event.target.blur();
    document.body.click();

    var message = {
      platform: 'mc',
      src: src
    }

    window.ReactNativeWebView.postMessage(JSON.stringify(message));

  }, true);
  true;
`

const NTSScreen = () => {
  const { castMixcloud } = useChromecast()
  const insets = useSafeArea()

  const onWebViewMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data)

      if (data.platform === 'mc') {
        castMixcloud(data)
      }
    } catch (error) {}
  }

  return (
    <View style={[ styles.root, { paddingTop: insets.top } ]}>
      <WebView
        style={ styles.webview }
        source={{ uri: 'https://nts.live' }}
        injectedJavaScript={ injectedJavaScript }
        onMessage={ onWebViewMessage }
        allowsBackForwardNavigationGestures
      />

      <CastButton style={[ styles.chromecastButton, { bottom: 20 + insets.bottom } ]} tintColor="black" />
    </View>
  )
}

export default NTSScreen

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'black'
  },
  webview: {
    flex: 1
  },
  chromecastButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: 'white'
  }
})
