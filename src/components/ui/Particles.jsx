// Floating particles background
import { useMemo } from 'react'

export default function Particles() {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 3,
      left: Math.random() * 100,
      delay: Math.random() * 20,
      duration: Math.random() * 15 + 15,
      color: [
        'rgba(56, 182, 168, 0.35)',
        'rgba(255, 143, 122, 0.28)',
        'rgba(95, 210, 194, 0.28)',
        'rgba(246, 193, 90, 0.28)',
        'rgba(120, 184, 255, 0.28)',
      ][Math.floor(Math.random() * 5)],
    }))
  }, [])

  return (
    <div className="particles">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
