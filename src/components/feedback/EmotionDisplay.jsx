// EmotionDisplay — Shows detected emotion with animated emoji
import { EMOTION_LABELS } from '../../store/useSessionStore'
import './EmotionDisplay.css'

export default function EmotionDisplay({ emotion, confidence, size = 'medium' }) {
  if (!emotion) return null

  const info = EMOTION_LABELS[emotion] || EMOTION_LABELS.neutral
  const pct = Math.round((confidence || 0) * 100)

  return (
    <div className={`emotion-display-container ${size}`}>
      <div className="emoji-display" key={emotion}>
        {info.emoji}
      </div>
      <div className={`emotion-badge ${emotion}`}>
        <span>{info.label}</span>
        <span style={{ opacity: 0.7, fontSize: '0.85em' }}>{pct}%</span>
      </div>
    </div>
  )
}
