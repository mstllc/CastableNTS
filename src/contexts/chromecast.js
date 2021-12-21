import React, { useContext, createContext } from 'react'
import { useRemoteMediaClient } from 'react-native-google-cast'

const ChromecastContext = createContext()

const ChromecastProvider = ({ children }) => {
  const client = useRemoteMediaClient()

  const castMixcloud = async data => {
    if (!client) return

    try {
      const response = await fetch('https://nts.mst.mn/api/mc', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: data.src
        }) 
      })

      const json = await response.json()

      client.loadMedia({
        startTime: 0,
        mediaInfo: {
          contentUrl: json.url,
          contentType: json.contentType,
          streamDuration: json.duration,
          metadata: {
            title: json.title,
            subtitle: json.description,
            artist: json.user,
            type: 'musicTrack',
            images: [
              {
                url: json.image
              }
            ]
          }
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  const value = {
    castMixcloud
  }

  return (
    <ChromecastContext.Provider value={ value }>
      { children }
    </ChromecastContext.Provider>
  )
}

const useChromecast = () => useContext(ChromecastContext)

export default ChromecastProvider
export { useChromecast }
