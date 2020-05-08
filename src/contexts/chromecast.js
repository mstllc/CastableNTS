import React, { useState, useEffect, useContext, createContext } from 'react'
import GoogleCast from 'react-native-google-cast'

const ChromecastContext = createContext()

const ChromecastProvider = ({ children }) => {
  const [ activeSession, setActiveSession ] = useState(false)
  const [ playing, setPlaying ] = useState(false)
  const [ duration, setDuration ] = useState(0)
  const [ progress, setProgress ] = useState(0)
  const [ playerState, setPlayerState ] = useState(0) //0 - Idle // 2 - Playing // 3 - Paused

  useEffect(() => {
    // Establishing connection to Chromecast
    GoogleCast.EventEmitter.addListener(GoogleCast.SESSION_STARTING, (...args) => {
      // console.log('SESSION_STARTING', args)
    })

    // Connection established
    GoogleCast.EventEmitter.addListener(GoogleCast.SESSION_STARTED, (...args) => {
      // console.log('SESSION_STARTED', args)
      setActiveSession(true)
    })

    // Connection failed
    GoogleCast.EventEmitter.addListener(GoogleCast.SESSION_START_FAILED, (...args) => {
      // console.log('SESSION_START_FAILED', args)
      // console.error(error)
      setActiveSession(false)
    })

    // Connection suspended (your application went to background or disconnected)
    GoogleCast.EventEmitter.addListener(GoogleCast.SESSION_SUSPENDED, (...args) => {
      // console.log('SESSION_SUSPENDED', args)
      setActiveSession(false)
    })

    // Attempting to reconnect
    GoogleCast.EventEmitter.addListener(GoogleCast.SESSION_RESUMING, (...args) => {
      // console.log('SESSION_RESUMING', args)
    })

    // Reconnected
    GoogleCast.EventEmitter.addListener(GoogleCast.SESSION_RESUMED, (...args) => {
      // console.log('SESSION_RESUMED', args)
      setActiveSession(true)
    })

    // Disconnecting
    GoogleCast.EventEmitter.addListener(GoogleCast.SESSION_ENDING, (...args) => {
      // console.log('SESSION_ENDING', args)
    })

    // Disconnected (error provides explanation if ended forcefully)
    GoogleCast.EventEmitter.addListener(GoogleCast.SESSION_ENDED, (...args) => {
      // console.log('SESSION_ENDED', args)
      setActiveSession(false)
      resetPlayer()
    })

    // Status of the media has changed. The `mediaStatus` object contains the new status.
    GoogleCast.EventEmitter.addListener(GoogleCast.MEDIA_STATUS_UPDATED, (...args) => {
      // console.log('MEDIA_STATUS_UPDATED', args)

      const { mediaStatus } = args[0]
      
      setPlayerState(mediaStatus.playerState)
      setDuration(mediaStatus.streamDuration)
      setProgress(mediaStatus.streamPosition)
    })

    // Media started playing
    GoogleCast.EventEmitter.addListener(GoogleCast.MEDIA_PLAYBACK_STARTED, (...args) => {
      // console.log('MEDIA_PLAYBACK_STARTED', args)
      
      const { mediaStatus } = args[0]

      setPlaying(true)
      setPlayerState(mediaStatus.playerState)
      setDuration(mediaStatus.streamDuration)
      setProgress(mediaStatus.streamPosition)
    })

    // Media finished playing
    GoogleCast.EventEmitter.addListener(GoogleCast.MEDIA_PLAYBACK_ENDED, (...args) => {
      // console.log('MEDIA_PLAYBACK_ENDED', args)
      resetPlayer()
    })

    // Playing progress of the media has changed. The `mediaProgress` object contains the duration and new progress.
    GoogleCast.EventEmitter.addListener(GoogleCast.MEDIA_PROGRESS_UPDATED, (...args) => {
      // console.log('MEDIA_PROGRESS_UPDATED', args)

      const { mediaProgress } = args[0]

      setDuration(mediaProgress.duration)
      setProgress(mediaProgress.progress)
    })
  }, [])

  const resetPlayer = () => {
    setPlaying(false)
    setDuration(0)
    setProgress(0)
    setPlayerState(0)
  }

  const pause = () => {
    GoogleCast.pause()
  }

  const play = () => {
    GoogleCast.play()
  }

  const castMixcloud = async data => {
    if (!activeSession) return

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

      GoogleCast.castMedia({
        mediaUrl: json.url,
        imageUrl: json.image,
        title: json.title,
        subtitle: json.description,
        studio: json.user,
        streamDuration: json.duration,
        contentType: json.contentType,
        playPosition: 0
      })
    } catch (error) {
      
    }
  }

  const value = {
    activeSession,
    playing,
    playerState,
    duration,
    progress,

    castMixcloud,
    pause,
    play
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