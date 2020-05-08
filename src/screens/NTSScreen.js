import React, { useEffect, useRef } from 'react'
import { Animated, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import { SafeAreaView } from 'react-native-safe-area-context'
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
  const { playing, playerState, progress, duration, pause, play, castMixcloud } = useChromecast()
  const playbarHeight = useRef(new Animated.Value(playing ? BAR_HEIGHT : 0)).current

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
      toValue: playing ? BAR_HEIGHT : 0,
      duration: 500,
      useNativeDriver: false
    }).start()
  }, [ playing ])

  return (
    <SafeAreaView style={ styles.root }>
      <WebView
        style={ styles.webview }
        source={{ uri: 'https://nts.live' }}
        injectedJavaScript={ injectedJavaScript }
        onMessage={ onWebViewMessage }
      />

      <Animated.View style={[ styles.playbarContainer, { height: playbarHeight } ]}>
        <View style={ styles.playbar }>
          { playerState === 2 ?
            <TouchableOpacity style={ styles.playButton } onPress={ pause }>
              <Icon name="pause" size={ 32 } color="black" />
            </TouchableOpacity> :
            <TouchableOpacity style={ styles.playButton } onPress={ play }>
              <Icon name="play" size={ 32 } color="black" />
            </TouchableOpacity>
          }

          <View style={ styles.transportContainer }>
            <Text style={ styles.progressText }>{ formatSeconds(progress) }</Text>
            <View style={ styles.progressBar }>
              <View style={[ styles.progressIndicator, { left: percent } ]} />
            </View>
            <Text style={ styles.durationText }>{ formatSeconds(duration) }</Text>
          </View>
        </View>
      </Animated.View>

      <View style={ StyleSheet.absoluteFill } pointerEvents="box-none">
        <CastButton style={ styles.chromecastButton } tintColor="black" />
      </View>
    </SafeAreaView>
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
    height: 100,
    paddingLeft: 20,
    paddingRight: 100,
    alignItems: 'center',
    flexDirection: 'row'
  },
  playButton: {
    width: 32,
    height: 32,
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center'
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
  progressIndicator: {
    position: 'absolute',
    top: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'black',
    transform: [
      { translateX: -8 },
      { translateY: -6 }
    ]
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