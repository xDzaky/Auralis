import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useSessionStore, {
  DIFFICULTY_LEVELS,
  EMOTION_LABELS,
  PHASES,
} from '../../store/useSessionStore'
import useEmotion from '../../hooks/useEmotion'
import logicEngine from '../../engine/logicEngine'
import speechService from '../../services/speechService'
import ttsService from '../../services/ttsService'
import EmotionDisplay from '../../components/feedback/EmotionDisplay'
import FeedbackBubble from '../../components/feedback/FeedbackBubble'
import CelebrationOverlay from '../../components/feedback/CelebrationOverlay'
import Mascot from '../../components/ui/Mascot'
import './SessionPage.css'

const PHASE_LABELS = {
  [PHASES.OPENING]: { label: 'Pembukaan', icon: '👋' },
  [PHASES.WARMUP]: { label: 'Warm-up', icon: '🔥' },
  [PHASES.TRAINING]: { label: 'Latihan', icon: '🎯' },
  [PHASES.REVIEW]: { label: 'Review', icon: '📊' },
  [PHASES.CLOSING]: { label: 'Penutup', icon: '🌟' },
  [PHASES.PAUSED]: { label: 'Istirahat', icon: '☕' },
}

const SESSION_DESCRIPTIONS = {
  mirror: 'Kenali emosi dari wajah sendiri lewat kamera.',
  guess: 'Tunjukkan emosi yang diminta oleh Auralis.',
  story: 'Sebutkan perasaanmu sambil melihat ekspresi wajah.',
}

export default function SessionPage() {
  const navigate = useNavigate()
  const {
    childName,
    sessionType,
    difficulty,
    rewardPreference,
    phase,
    setPhase,
    startSession,
    endSession,
    finalizeSessionReview,
    currentEmotion,
    currentConfidence,
    score,
    addScore,
    completedExercises,
    completeExercise,
    totalExercises,
    streak,
    incrementStreak,
    resetStreak,
    recordExerciseOutcome,
    targetEmotion,
    setTargetEmotion,
    feedback,
    setFeedback,
    clearFeedback,
    isSpeaking,
    setIsSpeaking,
    isListening,
    setIsListening,
    isMicrophoneReady,
    isCustomModelLoaded,
    customModelMode,
    lastSpokenText,
    setLastSpokenText,
    lastHeardText,
    addTranscript,
  } = useSessionStore()

  const { videoRef, canvasRef, isLoading, error, faceDetected, startCamera, stopCamera, startDetection } = useEmotion()

  const [showCelebration, setShowCelebration] = useState(null)
  const [mascotMessage, setMascotMessage] = useState('')
  const [speechError, setSpeechError] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement))
  const lastProcessedEmotion = useRef(null)
  const processTimerRef = useRef(null)
  const targetHistoryRef = useRef([])
  const phaseTimeoutRef = useRef(null)
  const latestEmotionRef = useRef(currentEmotion)
  const latestConfidenceRef = useRef(currentConfidence)
  const latestPhaseRef = useRef(phase)
  const latestSessionTypeRef = useRef(sessionType)

  useEffect(() => {
    latestEmotionRef.current = currentEmotion
    latestConfidenceRef.current = currentConfidence
    latestPhaseRef.current = phase
    latestSessionTypeRef.current = sessionType
  }, [currentEmotion, currentConfidence, phase, sessionType])

  useEffect(() => {
    if (!childName || !sessionType) {
      navigate('/')
    }
  }, [childName, sessionType, navigate])

  useEffect(() => {
    ttsService.onStart(() => setIsSpeaking(true))
    ttsService.onEnd(() => setIsSpeaking(false))

    speechService.onStart(() => setIsListening(true))
    speechService.onEnd(() => setIsListening(false))
    speechService.onError((message) => {
      if (message !== 'no-speech' && message !== 'aborted') {
        setSpeechError('Mikrofon belum bisa menangkap suara dengan jelas.')
      }
    })
    speechService.onResult(async (transcript, confidence) => {
      addTranscript(transcript, confidence)
      await handleSpeechTranscript(transcript, confidence)
    })

    startSession()

    return () => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current)
      }
      if (processTimerRef.current) {
        clearTimeout(processTimerRef.current)
      }
      speechService.stop()
      stopCamera()
      ttsService.stop()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current)
    }

    const runPhase = async () => {
      if (phase === PHASES.OPENING) {
        const message = logicEngine.getPhaseMessage('opening', childName, 0, sessionType)
        setMascotMessage(message)
        setLastSpokenText(message)
        await ttsService.speak(message)
        phaseTimeoutRef.current = setTimeout(() => setPhase(PHASES.WARMUP), 900)
        return
      }

      if (phase === PHASES.WARMUP) {
        await startCamera()
        startDetection()
        const message = logicEngine.getPhaseMessage('warmup', childName, 0, sessionType)
        setMascotMessage(message)
        setLastSpokenText(message)
        await ttsService.speak(message)
        phaseTimeoutRef.current = setTimeout(() => setPhase(PHASES.TRAINING), 3200)
        return
      }

      if (phase === PHASES.TRAINING) {
        clearFeedback()
        await speakTrainingIntro()
        if (sessionType === 'guess' && !targetEmotion) {
          await queueNextTarget()
        }
        if (sessionType === 'story') {
          await promptStoryMode()
        }
        return
      }

      if (phase === PHASES.REVIEW) {
        navigate('/review')
        return
      }

      if (phase === PHASES.CLOSING) {
        speechService.stop()
        const message = logicEngine.getPhaseMessage('closing', childName, score, sessionType)
        setMascotMessage(message)
        setLastSpokenText(message)
        await ttsService.speak(message)
        phaseTimeoutRef.current = setTimeout(() => {
          finalizeSessionReview()
        }, 1200)
      }
    }

    runPhase()
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== PHASES.TRAINING || !currentEmotion || !faceDetected) return
    if (currentEmotion === lastProcessedEmotion.current) return

    lastProcessedEmotion.current = currentEmotion

    if (processTimerRef.current) {
      clearTimeout(processTimerRef.current)
    }

    processTimerRef.current = setTimeout(() => {
      processEmotion(currentEmotion, currentConfidence)
    }, 850)
  }, [currentEmotion, currentConfidence, phase, faceDetected]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    const onKeyDown = (event) => {
      if (phase === PHASES.REVIEW || isLoading) return

      if (event.key.toLowerCase() === 'f') {
        event.preventDefault()
        void toggleFullscreen()
      }

      if (event.key.toLowerCase() === 'r' && phase !== PHASES.OPENING && phase !== PHASES.CLOSING) {
        event.preventDefault()
        void handleRepeat()
      }

      if (event.key.toLowerCase() === 'p' && (phase === PHASES.TRAINING || phase === PHASES.WARMUP || phase === PHASES.PAUSED)) {
        event.preventDefault()
        if (phase === PHASES.PAUSED) {
          void handleResume()
        } else {
          handlePause()
        }
      }

      if (event.key.toLowerCase() === 'e' && (phase === PHASES.TRAINING || phase === PHASES.WARMUP || phase === PHASES.PAUSED)) {
        event.preventDefault()
        handleEnd()
      }
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [phase, isLoading, lastSpokenText]) // eslint-disable-line react-hooks/exhaustive-deps

  const speakAndStore = async (text) => {
    setLastSpokenText(text)
    setMascotMessage(text)
    await ttsService.speak(text)
  }

  const speakTrainingIntro = async () => {
    const message = logicEngine.getPhaseMessage('training', childName, 0, sessionType)
    if (!message) return
    await speakAndStore(message)
  }

  const queueNextTarget = async () => {
    const nextTarget = logicEngine.getNextTarget(targetHistoryRef.current, difficulty)
    targetHistoryRef.current = [...targetHistoryRef.current, nextTarget].slice(-4)
    setTargetEmotion(nextTarget)
    const instruction = logicEngine.getInstruction(nextTarget)
    setFeedback(instruction)
    await speakAndStore(instruction.text)
  }

  const promptStoryMode = async () => {
    const prompt = logicEngine.getStoryPrompt()
    setFeedback(prompt)
    await speakAndStore(prompt.text)
    if (speechService.isAvailable) {
      speechService.start()
    } else {
      setSpeechError('Browser ini belum mendukung speech recognition Bahasa Indonesia.')
    }
  }

  const finishExercise = async (result) => {
    addScore(result.points || 10)
    incrementStreak()
    completeExercise()
    const adaptiveChange = recordExerciseOutcome(true)

    const nextStreak = streak + 1
    const streakMessage = logicEngine.getStreakMessage(nextStreak)
    const adaptiveMessage =
      adaptiveChange === 'up'
        ? 'Level latihan naik sedikit karena kamu lagi hebat.'
        : adaptiveChange === 'down'
          ? 'Level latihan diturunkan supaya lebih nyaman.'
          : null

    setShowCelebration({
      message: adaptiveMessage ? `${result.text} ${adaptiveMessage}` : result.text,
      emoji: rewardPreference === 'stars' ? '⭐' : '🎉',
      streakMessage,
    })

    await speakAndStore(adaptiveMessage ? `${result.text} ${adaptiveMessage}` : result.text)

    if (completedExercises + 1 >= totalExercises) {
      phaseTimeoutRef.current = setTimeout(() => {
        setShowCelebration(null)
        endSession()
      }, 2400)
      return
    }

    phaseTimeoutRef.current = setTimeout(async () => {
      setShowCelebration(null)
      if (sessionType === 'guess') {
        await queueNextTarget()
      }
      if (sessionType === 'story') {
        await promptStoryMode()
      }
    }, 2200)
  }

  const processEmotion = async (emotion, confidence) => {
    if (sessionType === 'mirror') {
      const result = logicEngine.processMirrorMode(emotion, confidence)
      if (!result) return
      setFeedback(result)
      await speakAndStore(result.text)
      return
    }

    if (sessionType === 'guess' && targetEmotion) {
      if (!logicEngine.canRespond()) return
      const result = logicEngine.checkEmotionMatch(emotion, targetEmotion, confidence)
      setFeedback(result)

      if (result.match) {
        await finishExercise(result)
      } else {
        recordExerciseOutcome(false)
        resetStreak()
        await speakAndStore(result.text)
      }
    }
  }

  const handleSpeechTranscript = async (transcript, confidence) => {
    if (latestPhaseRef.current !== PHASES.TRAINING || latestSessionTypeRef.current !== 'story') return

    const result = logicEngine.checkStoryAnswer(
      transcript,
      latestEmotionRef.current,
      latestConfidenceRef.current,
    )
    setFeedback({
      ...result,
      text: `${result.text} Aku dengar: "${transcript}".`,
    })

    if (result.match) {
      await finishExercise(result)
      return
    }

    recordExerciseOutcome(false)
    resetStreak()
    await speakAndStore(result.text)
    phaseTimeoutRef.current = setTimeout(() => {
      speechService.start()
    }, confidence > 0 ? 900 : 1300)
  }

  const handlePause = () => {
    speechService.stop()
    setPhase(PHASES.PAUSED)
    setMascotMessage('Istirahat dulu ya. Kalau sudah siap, kita lanjut lagi.')
  }

  const handleResume = async () => {
    setPhase(PHASES.TRAINING)
  }

  const handleRepeat = async () => {
    if (!lastSpokenText) return
    setFeedback({
      text: lastSpokenText,
      emoji: '🔁',
      type: 'instruction',
    })
    await ttsService.speak(lastSpokenText)
  }

  const handleEnd = () => {
    speechService.stop()
    endSession()
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.()
      return
    }

    await document.exitFullscreen?.()
  }

  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0
  const difficultyInfo = DIFFICULTY_LEVELS.find((level) => level.id === difficulty)

  if (!childName) return null

  return (
    <div className="session-page page-enter">
      <header className="session-header">
        <div className="session-header-left">
          <div className="session-child-name">
            <span>👤</span> {childName}
          </div>
          {PHASE_LABELS[phase] && (
            <div className="session-phase-badge">
              <span>{PHASE_LABELS[phase].icon}</span>
              <span>{PHASE_LABELS[phase].label}</span>
            </div>
          )}
        </div>

        <div className="session-header-right">
          <div className="session-score">
            <span>⭐</span> {score}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm session-shortcut-btn"
            onClick={() => void toggleFullscreen()}
            aria-label={isFullscreen ? 'Keluar dari mode fullscreen' : 'Masuk ke mode fullscreen'}
          >
            {isFullscreen ? '🗗 Keluar Fullscreen' : '🗖 Fullscreen'}
          </button>
          {streak >= 2 && <div className="session-streak">🔥 {streak}x</div>}
        </div>
      </header>

      <section className="session-top-panel">
        <div className="session-meta-card">
          <strong>{SESSION_DESCRIPTIONS[sessionType]}</strong>
          <span>{difficultyInfo?.name} • {totalExercises} target latihan</span>
        </div>

        <div className="session-meta-card">
          <strong>Model & input</strong>
          <span>{isCustomModelLoaded ? 'Custom TFJS aktif' : 'Fallback face-api aktif'} • {isMicrophoneReady ? 'Mikrofon siap' : 'Mikrofon belum siap'}</span>
        </div>

        <div className="session-meta-card">
          <strong>Akses cepat</strong>
          <span>`F` fullscreen • `R` ulangi • `P` istirahat • `E` akhiri</span>
        </div>
      </section>

      {phase === PHASES.TRAINING && (
        <div className="session-progress">
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">{completedExercises} / {totalExercises}</span>
        </div>
      )}

      <main className="session-main">
        {isLoading && (
          <div className="session-loading flex-col-center gap-lg">
            <Mascot message="Sedang mempersiapkan model emosi dan kamera..." mood="thinking" />
            <div className="loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        {error && (
          <div className="session-error flex-col-center gap-lg">
            <div className="emoji-display">😥</div>
            <p className="text-body" style={{ color: 'var(--color-accent-red)' }}>{error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Coba Lagi
            </button>
          </div>
        )}

        {phase === PHASES.OPENING && !isLoading && (
          <div className="session-phase-content flex-col-center gap-xl">
            <Mascot message={mascotMessage} mood="happy" size="large" />
          </div>
        )}

        {phase === PHASES.CLOSING && !isLoading && (
          <div className="session-phase-content flex-col-center gap-xl">
            <Mascot message={mascotMessage} mood="happy" size="large" />
            <div className="status-indicator active">Menutup sesi dengan aman</div>
          </div>
        )}

        {phase === PHASES.PAUSED && (
          <div className="session-phase-content flex-col-center gap-xl">
            <Mascot message={mascotMessage} mood="encouraging" size="large" />
            <button className="btn btn-primary btn-lg" onClick={handleResume}>
              Lanjut Main
            </button>
          </div>
        )}

        {(phase === PHASES.WARMUP || phase === PHASES.TRAINING) && !isLoading && !error && (
          <div className="session-interaction">
            <div className="camera-section">
              <div className="camera-container">
                <video ref={videoRef} playsInline muted />
                <canvas ref={canvasRef} className="camera-canvas" />

                <div className={`camera-status ${faceDetected ? 'detected' : ''}`}>
                  <div className="camera-status-dot" />
                  <span>{faceDetected ? 'Wajah terdeteksi' : 'Mencari wajah...'}</span>
                </div>

                {isSpeaking && (
                  <div className="speaking-indicator">
                    <span className="speaking-icon">🔊</span>
                    <div className="speaking-waves">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}

                {isListening && (
                  <div className="listening-indicator pulse-ring">
                    <span>🎙️ Mendengarkan</span>
                  </div>
                )}
              </div>
            </div>

            <div className="interaction-panel">
              {phase === PHASES.TRAINING && sessionType === 'guess' && targetEmotion && (
                <div className="target-emotion">
                  <span className="target-label">Tunjukkan emosi ini</span>
                  <div className="target-emoji-container">
                    <span className="target-emoji" key={targetEmotion}>
                      {EMOTION_LABELS[targetEmotion]?.emoji}
                    </span>
                    <span className="target-name">{EMOTION_LABELS[targetEmotion]?.label}</span>
                  </div>
                </div>
              )}

              {faceDetected && currentEmotion && phase === PHASES.TRAINING && (
                <EmotionDisplay emotion={currentEmotion} confidence={currentConfidence} size="medium" />
              )}

              {feedback && phase === PHASES.TRAINING && (
                <FeedbackBubble text={feedback.text} emoji={feedback.emoji} type={feedback.type} visible={!!feedback} />
              )}

              <div className="session-helper-card">
                <h3>{sessionType === 'story' ? 'Latihan suara' : 'Pendamping sesi'}</h3>
                <p>{mascotMessage || 'Auralis akan memberi instruksi singkat dan konsisten.'}</p>
                {sessionType === 'story' && (
                  <div className="speech-status-block">
                    <span className={`status-indicator ${speechService.isAvailable ? 'active' : 'inactive'}`}>
                      {speechService.isAvailable ? 'Mikrofon siap' : 'Speech belum didukung browser'}
                    </span>
                    <span className={`status-indicator ${customModelMode === 'custom-tfjs' ? 'active' : 'inactive'}`}>
                      {customModelMode === 'custom-tfjs' ? 'Model custom aktif' : 'Masih pakai model default'}
                    </span>
                    {lastHeardText && <span className="text-caption">Terdengar: "{lastHeardText}"</span>}
                    {speechError && <span className="speech-error">{speechError}</span>}
                  </div>
                )}
              </div>

              {phase === PHASES.WARMUP && (
                <div className="warmup-message flex-col-center gap-md">
                  <Mascot message={mascotMessage} mood="encouraging" size="small" />
                  {faceDetected && <div className="status-indicator active">Wajahmu terdeteksi. Bagus!</div>}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {(phase === PHASES.TRAINING || phase === PHASES.WARMUP || phase === PHASES.PAUSED) && (
        <footer className="session-footer">
          <button className="btn btn-ghost btn-sm" onClick={handleRepeat}>
            🔁 Ulangi
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handlePause}>
            ⏸️ Istirahat
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleEnd}>
            ⏹️ Akhiri Sesi
          </button>
        </footer>
      )}

      {showCelebration && (
        <CelebrationOverlay
          message={showCelebration.message}
          emoji={showCelebration.emoji}
          streakMessage={showCelebration.streakMessage}
          onDone={() => setShowCelebration(null)}
        />
      )}
    </div>
  )
}
