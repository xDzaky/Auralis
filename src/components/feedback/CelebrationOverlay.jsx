// Celebration overlay with confetti for correct answers
import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import './CelebrationOverlay.css'

export default function CelebrationOverlay({ message, emoji = '🎉', streakMessage, onDone }) {
  const timerRef = useRef(null)

  useEffect(() => {
    // Fire confetti
    const colors = ['#38b6a8', '#ff8f7a', '#f6c15a', '#5fd2c2', '#78b8ff']
    
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      disableForReducedMotion: true,
    })

    if (streakMessage) {
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
          colors,
          disableForReducedMotion: true,
        })
      }, 500)
    }

    timerRef.current = setTimeout(() => {
      if (onDone) onDone()
    }, 2500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [streakMessage, onDone])

  return (
    <div className="celebration-container" onClick={onDone}>
      <div className="celebration-emoji">{emoji}</div>
      <div className="celebration-message">{message}</div>
      {streakMessage && (
        <div className="celebration-streak">{streakMessage}</div>
      )}
    </div>
  )
}
