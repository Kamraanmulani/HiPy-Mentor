"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useRef } from "react"

type SoundContextType = {
  playSound: (soundName: "send" | "receive") => void
  soundEnabled: boolean
  toggleSound: () => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundsLoaded, setSoundsLoaded] = useState(false)
  const sounds = useRef<Record<string, HTMLAudioElement | null>>({
    send: null,
    receive: null,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Try to load sounds
        sounds.current.send = new Audio("/sounds/message-sent.mp3")
        sounds.current.receive = new Audio("/sounds/message-received.mp3")

        // Set volume
        if (sounds.current.send) sounds.current.send.volume = 0.3
        if (sounds.current.receive) sounds.current.receive.volume = 0.3

        // Add error handlers
        const handleAudioError = (e: Event) => {
          console.warn("Audio failed to load:", e)
          setSoundEnabled(false)
        }

        sounds.current.send?.addEventListener("error", handleAudioError)
        sounds.current.receive?.addEventListener("error", handleAudioError)

        // Preload audio
        sounds.current.send?.load()
        sounds.current.receive?.load()

        setSoundsLoaded(true)
      } catch (error) {
        console.error("Error initializing audio:", error)
        setSoundEnabled(false)
      }
    }

    // Cleanup
    return () => {
      if (sounds.current.send) {
        sounds.current.send.removeEventListener("error", () => {})
      }
      if (sounds.current.receive) {
        sounds.current.receive.removeEventListener("error", () => {})
      }
    }
  }, [])

  const playSound = (soundName: "send" | "receive") => {
    if (!soundEnabled || !soundsLoaded) return

    const sound = sounds.current[soundName]
    if (!sound) return

    try {
      // Reset the audio to the beginning
      sound.currentTime = 0
      sound.play().catch((error) => {
        console.warn(`Error playing ${soundName} sound:`, error)
      })
    } catch (error) {
      console.warn(`Error playing ${soundName} sound:`, error)
    }
  }

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev)
  }

  return <SoundContext.Provider value={{ playSound, soundEnabled, toggleSound }}>{children}</SoundContext.Provider>
}

export function useSound() {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider")
  }
  return context
}
