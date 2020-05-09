import React, { useEffect, useRef } from 'react'
import { Animated, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import { useSafeArea } from 'react-native-safe-area-context'
import { CastButton } from 'react-native-google-cast'

import Icon from '../components/Icon'

import { useChromecast } from '../contexts/chromecast'

const formatSeconds = seconds => {
  return new Date(seconds * 1000).toISOString().substr(11, 8)
}

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

const BAR_HEIGHT = 100

const NTSScreen = () => {
  const { playing, loading, playerState, progress, duration, pause, play, castMixcloud } = useChromecast()
  const insets = useSafeArea()
  const playbarHeight = useRef(new Animated.Value(playing ? (BAR_HEIGHT + insets.bottom) : 0)).current

  const percent = `${(progress / duration) * 100}%`

  const onWebViewMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data)

      if (data.platform === 'mc') {
        castMixcloud(data)
      }
    } catch (error) {}
  }

  useEffect(() => {
    Animated.timing(playbarHeight, {
      toValue: (playing || loading) ? (BAR_HEIGHT + insets.bottom) : 0,
      duration: 250,
      useNativeDriver: false
    }).start()
  }, [ playing, loading ])

  return (
    <View style={[ styles.root, { paddingTop: insets.top } ]}>
      <WebView
        style={ styles.webview }
        source={{ uri: 'https://nts.live' }}
        injectedJavaScript={ injectedJavaScript }
        onMessage={ onWebViewMessage }
        allowsBackForwardNavigationGestures
      />

      <Animated.View style={[ styles.playbarContainer, { height: playbarHeight } ]}>
        <View style={[ styles.playbar, { height: (BAR_HEIGHT + insets.bottom), paddingBottom: insets.bottom } ]}>
          { loading ?
            <View style={ styles.playButton }>
              <ActivityIndicator size="large" tintColor="black" />
            </View> :
            <>
              { playerState === 2 ?
                <TouchableOpacity style={ styles.playButton } onPress={ pause }>
                  <Icon name="pause" size={ 32 } color="black" />
                </TouchableOpacity> :
                <TouchableOpacity style={ styles.playButton } onPress={ play } disabled={ playerState !== 3 }>
                  <Icon name="play" size={ 32 } color="black" />
                </TouchableOpacity>
              }
            </>
          }

          <View style={ styles.transportContainer }>
            <Text style={ styles.progressText }>{ formatSeconds(progress) }</Text>
            <View style={ styles.progressBar }>
              <Animated.View style={[ styles.progressIndicatorContainer, { left: percent } ]}>
                <View style={ styles.progressIndicator } />
              </Animated.View>
            </View>
            <Text style={ styles.durationText }>{ formatSeconds(duration) }</Text>
          </View>
        </View>
      </Animated.View>

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
  },
  playbarContainer: {
    width: '100%',
    height: 0,
    backgroundColor: 'white'
  },
  playbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: BAR_HEIGHT,
    paddingLeft: 20,
    paddingRight: 100,
    alignItems: 'center',
    flexDirection: 'row'
  },
  playButton: {
    width: 60,
    height: 60,
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  transportContainer: {
    flex: 1,
    height: 16,
    justifyContent: 'center'
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'black'
  },
  progressIndicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [
      { translateX: -20 },
      { translateY: -18 }
    ]
  },
  progressIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'black'
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
    position: 'absolute',
    bottom: -26,
    left: 0
  },
  durationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
    position: 'absolute',
    bottom: -26,
    right: 0
  }
})