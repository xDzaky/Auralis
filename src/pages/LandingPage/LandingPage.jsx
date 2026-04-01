import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useSessionStore, {
  DIFFICULTY_LEVELS,
  REWARD_OPTIONS,
  SESSION_TYPES,
} from '../../store/useSessionStore'
import Mascot from '../../components/ui/Mascot'
import './LandingPage.css'

const STEP_NAME = 0
const STEP_SETUP = 1

export default function LandingPage() {
  const navigate = useNavigate()
  const {
    childName,
    setChildName,
    sessionType,
    setSessionType,
    difficulty,
    setDifficulty,
    rewardPreference,
    setRewardPreference,
    sessionHistory,
  } = useSessionStore()

  const [step, setStep] = useState(childName ? STEP_SETUP : STEP_NAME)
  const [nameInput, setNameInput] = useState(childName || '')

  const recentSummary = useMemo(() => sessionHistory.slice(0, 3), [sessionHistory])

  const handleNameSubmit = (event) => {
    event.preventDefault()
    if (!nameInput.trim()) return

    setChildName(nameInput.trim())
    setStep(STEP_SETUP)
  }

  const handleStart = () => {
    if (!sessionType) return
    navigate('/session')
  }

  return (
    <div className="landing-page page-enter">
      <div className="landing-hero">
        <div className="landing-logo">
          <span className="landing-logo-icon">✨</span>
          <h1 className="landing-title">
            <span className="text-gradient">Auralis</span>
          </h1>
          <p className="landing-subtitle">Pendamping digital terstruktur untuk latihan emosi anak</p>
        </div>
      </div>

      <div className="landing-content container">
        {step === STEP_NAME ? (
          <div className="landing-card glass-card">
            <Mascot
              message={childName ? `Halo ${childName}, kita siap mulai lagi?` : 'Halo, siapa nama hebatmu hari ini?'}
              mood="happy"
              size="medium"
            />

            <form onSubmit={handleNameSubmit} className="landing-form">
              <div className="input-group">
                <label htmlFor="child-name" className="input-label">
                  Nama Anak
                </label>
                <input
                  id="child-name"
                  type="text"
                  className="input-field"
                  placeholder="Ketik nama di sini..."
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  autoFocus
                  autoComplete="off"
                  maxLength={20}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg landing-btn" disabled={!nameInput.trim()}>
                <span>Lanjutkan</span>
                <span className="btn-arrow">→</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="landing-setup-grid">
            <div className="landing-card glass-card landing-card-wide">
              <Mascot
                message={`${childName}, pilih cara latihan yang paling nyaman ya.`}
                mood="excited"
                size="medium"
              />

              <section className="setup-section">
                <div className="setup-header">
                  <h2 className="text-subheading">1. Pilih jenis sesi</h2>
                  <p className="text-caption">Semua sesi tetap singkat, positif, dan terstruktur.</p>
                </div>

                <div className="session-types">
                  {SESSION_TYPES.map((type, index) => (
                    <button
                      key={type.id}
                      type="button"
                      className={`session-type-card ${sessionType === type.id ? 'active' : ''}`}
                      onClick={() => setSessionType(type.id)}
                      style={{ animationDelay: `${index * 0.08}s` }}
                    >
                      <span className="session-type-icon">{type.icon}</span>
                      <div className="session-type-info">
                        <span className="session-type-name">{type.name}</span>
                        <span className="session-type-desc">{type.description}</span>
                      </div>
                      <span className="session-type-arrow">{sessionType === type.id ? '✓' : '→'}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="setup-section">
                <div className="setup-header">
                  <h2 className="text-subheading">2. Atur tingkat latihan</h2>
                  <p className="text-caption">Difficulty memengaruhi jumlah emosi dan target latihan.</p>
                </div>

                <div className="choice-row">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      className={`choice-chip ${difficulty === level.id ? 'active' : ''}`}
                      onClick={() => setDifficulty(level.id)}
                    >
                      <strong>{level.name}</strong>
                      <span>{level.description}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="setup-section">
                <div className="setup-header">
                  <h2 className="text-subheading">3. Pilih reward favorit</h2>
                  <p className="text-caption">Reward dipakai saat berhasil agar interaksi terasa konsisten.</p>
                </div>

                <div className="reward-row">
                  {REWARD_OPTIONS.map((reward) => (
                    <button
                      key={reward.id}
                      type="button"
                      className={`reward-card ${rewardPreference === reward.id ? 'active' : ''}`}
                      onClick={() => setRewardPreference(reward.id)}
                    >
                      <span className="reward-icon">{reward.icon}</span>
                      <span className="reward-label">{reward.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="landing-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(STEP_NAME)}>
                  ← Ganti Nama
                </button>
                <button type="button" className="btn btn-primary btn-lg" onClick={handleStart} disabled={!sessionType}>
                  Mulai Sesi
                </button>
              </div>
            </div>

            <aside className="landing-sidebar glass-card">
              <div className="setup-header">
                <h2 className="text-subheading">Ringkasan Cepat</h2>
                <p className="text-caption">Sesuai tech spec: on-device, aman, dan ramah anak Indonesia.</p>
              </div>

              <div className="feature-list">
                <div className="feature-item">
                  <span>📷</span>
                  <p>Kamera diproses langsung di browser, tanpa kirim ke server.</p>
                </div>
                <div className="feature-item">
                  <span>🎙️</span>
                  <p>Speech recognition Bahasa Indonesia dipakai untuk latihan verbal sederhana.</p>
                </div>
                <div className="feature-item">
                  <span>🧠</span>
                  <p>Fokus pada 4 emosi inti: senang, sedih, biasa, dan bingung.</p>
                </div>
              </div>

              <div className="history-panel">
                <h3 className="history-title">Riwayat Sesi Terakhir</h3>
                {recentSummary.length === 0 ? (
                  <p className="text-caption">Belum ada sesi tersimpan di perangkat ini.</p>
                ) : (
                  <div className="history-list">
                    {recentSummary.map((item) => (
                      <div key={item.id} className="history-item">
                        <strong>{item.childName || 'Anak'}</strong>
                        <span>{item.sessionType || 'Sesi'} • {item.score} poin</span>
                        <span>{item.completedExercises}/{item.totalExercises} latihan</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>

      <div className="landing-footer">
        <p className="text-caption">On-device, predictable, dan dibuat untuk konteks anak Indonesia.</p>
      </div>
    </div>
  )
}
