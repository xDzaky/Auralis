// Floating feedback bubble for praise/instructions
import { useEffect, useState } from 'react'
import './FeedbackBubble.css'

export default function FeedbackBubble({ text, emoji, type = 'praise', visible = true }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible && text) {
      setShow(false)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setShow(true))
      })
    } else {
      setShow(false)
    }
  }, [text, visible])

  if (!text || !visible) return null

  const typeClass = {
    praise: 'feedback-praise',
    instruction: 'feedback-instruction',
    success: 'feedback-success',
    retry: 'feedback-retry',
  }[type] || 'feedback-praise'

  return (
    <div className={`feedback-bubble ${typeClass} ${show ? 'show' : ''}`}>
      {emoji && <span className="feedback-emoji">{emoji}</span>}
      <span className="feedback-text">{text}</span>
    </div>
  )
}
