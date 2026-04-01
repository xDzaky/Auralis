import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import useSessionStore, { EMOTION_LABELS } from '../../store/useSessionStore'
import ttsService from '../../services/ttsService'
import Mascot from '../../components/ui/Mascot'
import './ReviewPage.css'

const SESSION_NAMES = {
  mirror: 'Cermin Emosi',
  guess: 'Tebak Emosi',
  story: 'Cerita Emosi',
}

export default function ReviewPage() {
  const navigate = useNavigate()
  const {
    childName,
    score,
    completedExercises,
    totalExercises,
    emotionHistory,
    transcriptHistory,
    sessionType,
    sessionHistory,
    getSessionDuration,
    resetSession,
  } = useSessionStore()

  const stats = useMemo(() => {
    const duration = getSessionDuration()
    const emotionCounts = {}

    emotionHistory.forEach(({ emotion }) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
    })

    const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]
    const starCount = score >= 45 ? 3 : score >= 24 ? 2 : score > 0 ? 1 : 0

    return {
      duration,
      emotionCounts,
      dominantEmotion,
      starCount,
    }
  }, [emotionHistory, score, getSessionDuration])

  const recentSessions = useMemo(() => sessionHistory.slice(0, 3), [sessionHistory])

  useEffect(() => {
    if (score > 0) {
      const colors = ['#38b6a8', '#ff8f7a', '#f6c15a', '#5fd2c2', '#78b8ff']
      setTimeout(() => {
        confetti({ particleCount: 90, spread: 88, origin: { y: 0.6 }, colors })
      }, 400)
    }

    const closingMsg =
      score >= 45
        ? `Luar biasa ${childName}! Hari ini kamu sangat fokus.`
        : score > 0
          ? `Bagus ${childName}. Kamu sudah menyelesaikan sesi dengan hebat.`
          : `Terima kasih sudah mencoba, ${childName}. Kita bisa latihan lagi nanti.`

    ttsService.speak(closingMsg)
    return () => ttsService.stop()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlayAgain = () => {
    resetSession()
    navigate('/')
  }

  return (
    <div className="review-page page-enter">
      <div className="container">
        <div className="review-hero">
          <Mascot
            message={
              score >= 45
                ? `${childName}, kamu luar biasa hari ini.`
                : score > 0
                  ? `${childName}, latihanmu bagus sekali.`
                  : `Terima kasih sudah mencoba, ${childName}.`
            }
            mood="excited"
            size="large"
          />
        </div>

        <div className="review-stars">
          {[1, 2, 3].map((star) => (
            <span key={star} className={`star ${star <= stats.starCount ? 'filled' : ''}`}>
              {star <= stats.starCount ? '⭐' : '☆'}
            </span>
          ))}
        </div>

        <div className="review-card glass-card">
          <h2 className="review-card-title">{SESSION_NAMES[sessionType] || 'Sesi Auralis'}</h2>

          <div className="review-stats">
            <div className="review-stat">
              <span className="review-stat-value">{score}</span>
              <span className="review-stat-label">Poin</span>
            </div>
            <div className="review-stat-divider" />
            <div className="review-stat">
              <span className="review-stat-value">{completedExercises}/{totalExercises}</span>
              <span className="review-stat-label">Latihan</span>
            </div>
            <div className="review-stat-divider" />
            <div className="review-stat">
              <span className="review-stat-value">{stats.duration || '<1'}</span>
              <span className="review-stat-label">Menit</span>
            </div>
          </div>
        </div>

        <div className="review-card glass-card review-insights">
          <h3 className="review-section-title">Insight Sesi</h3>
          <div className="insight-list">
            <div className="insight-item">
              <strong>Emosi dominan</strong>
              <span>{stats.dominantEmotion ? EMOTION_LABELS[stats.dominantEmotion[0]]?.label : 'Belum cukup data'}</span>
            </div>
            <div className="insight-item">
              <strong>Respons verbal</strong>
              <span>{transcriptHistory.length} kali tangkapan suara</span>
            </div>
            <div className="insight-item">
              <strong>Progress</strong>
              <span>{completedExercises >= totalExercises ? 'Sesi selesai penuh' : 'Sesi diakhiri lebih awal'}</span>
            </div>
          </div>
        </div>

        {stats.dominantEmotion && (
          <div className="review-card glass-card review-emotions">
            <h3 className="review-section-title">Distribusi Emosi</h3>
            <div className="review-emotion-grid">
              {Object.entries(stats.emotionCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([emotion, count]) => {
                  const info = EMOTION_LABELS[emotion]
                  const pct = Math.round((count / emotionHistory.length) * 100)

                  return (
                    <div key={emotion} className="review-emotion-item">
                      <span className="review-emotion-emoji">{info?.emoji || '😊'}</span>
                      <span className="review-emotion-name">{info?.label || emotion}</span>
                      <div className="review-emotion-bar">
                        <div
                          className="review-emotion-bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: info?.color || 'var(--color-primary)',
                          }}
                        />
                      </div>
                      <span className="review-emotion-pct">{pct}%</span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        <div className="review-card glass-card">
          <h3 className="review-section-title">Riwayat Lokal</h3>
          <div className="history-list review-history-list">
            {recentSessions.map((item) => (
              <div key={item.id} className="history-item">
                <strong>{SESSION_NAMES[item.sessionType] || 'Sesi'}</strong>
                <span>{item.score} poin • {item.completedExercises}/{item.totalExercises} latihan</span>
                <span>{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="review-actions">
          <button className="btn btn-primary btn-lg" onClick={handlePlayAgain}>
            Main Lagi
          </button>
          <button className="btn btn-ghost" onClick={handlePlayAgain}>
            Kembali ke Awal
          </button>
        </div>
      </div>
    </div>
  )
}
