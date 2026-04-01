// Mascot component — the friendly guide character
import { useState, useEffect } from 'react'

export default function Mascot({ message, mood = 'happy', size = 'medium' }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(false)
    const t = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(t)
  }, [message])

  const mascotSize = size === 'large' ? '120px' : size === 'small' ? '60px' : '90px'
  
  const mascotEmoji = {
    happy: '🤖',
    thinking: '🤖',
    excited: '🤖',
    encouraging: '🤖',
  }[mood] || '🤖'

  return (
    <div className="flex-col-center gap-md" style={{ minHeight: size === 'large' ? 200 : 140 }}>
      <div className="mascot">
        <div className="mascot-body" style={{ fontSize: mascotSize }}>
          {mascotEmoji}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: 8,
            background: 'radial-gradient(ellipse, rgba(56,182,168,0.28), transparent)',
            borderRadius: '50%',
          }}
        />
      </div>
      {message && show && (
        <div className="mascot-speech" key={message}>
          {message}
        </div>
      )}
    </div>
  )
}
