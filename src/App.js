import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import ChromecastProvider from './contexts/chromecast'

import NTSScreen from './screens/NTSScreen'

const App = () => {
  return (
    <SafeAreaProvider>
      <ChromecastProvider>
        <NTSScreen />
      </ChromecastProvider>
    </SafeAreaProvider>
  )
}

export default App