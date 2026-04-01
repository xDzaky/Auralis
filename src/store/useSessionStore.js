import { create } from 'zustand'

const HISTORY_STORAGE_KEY = 'auralis-session-history'

export const PHASES = {
  SETUP: 'setup',
  OPENING: 'opening',
  WARMUP: 'warmup',
  TRAINING: 'training',
  REVIEW: 'review',
  CLOSING: 'closing',
  PAUSED: 'paused',
}

export const EMOTION_LABELS = {
  happy: { emoji: '😊', label: 'Senang', color: 'var(--color-happy)' },
  sad: { emoji: '😢', label: 'Sedih', color: 'var(--color-sad)' },
  neutral: { emoji: '😐', label: 'Biasa', color: 'var(--color-neutral)' },
  confused: { emoji: '🤔', label: 'Bingung', color: 'var(--color-confused)' },
  angry: { emoji: '😠', label: 'Marah', color: 'var(--color-angry)' },
}

export const DIFFICULTY_LEVELS = [
  { id: 1, name: 'Mudah', description: '2 emosi utama, cocok untuk pemanasan.', exercises: 4 },
  { id: 2, name: 'Sedang', description: '3 emosi, latihan mulai lebih bervariasi.', exercises: 5 },
  { id: 3, name: 'Fokus', description: '4 emosi utama termasuk bingung.', exercises: 6 },
]

export const REWARD_OPTIONS = [
  { id: 'stars', label: 'Bintang', icon: '⭐' },
  { id: 'confetti', label: 'Konfeti', icon: '🎉' },
  { id: 'music', label: 'Suara Ceria', icon: '🔔' },
]

export const SESSION_TYPES = [
  { id: 'mirror', name: 'Cermin Emosi', icon: '🪞', description: 'Kenali emosi wajahmu sendiri' },
  { id: 'guess', name: 'Tebak Emosi', icon: '🎯', description: 'Tunjukkan emosi yang diminta' },
  { id: 'story', name: 'Cerita Emosi', icon: '📖', description: 'Sebutkan apa yang kamu rasakan' },
]

function readHistory() {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeHistory(history) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
}

function mapEmotion(emotion, confidence) {
  if (confidence < 0.6) return 'confused'

  switch (emotion) {
    case 'happy':
      return 'happy'
    case 'sad':
    case 'fearful':
      return 'sad'
    case 'angry':
    case 'disgusted':
      return 'angry'
    case 'surprised':
      return 'confused'
    case 'neutral':
    default:
      return confidence < 0.68 ? 'confused' : 'neutral'
  }
}

const getTotalExercises = (difficulty) =>
  DIFFICULTY_LEVELS.find((level) => level.id === difficulty)?.exercises ?? 5

const createSummary = (state) => {
  const emotionCounts = {}
  state.emotionHistory.forEach(({ emotion }) => {
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
  })

  const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  const durationMs = state.sessionStartTime ? Date.now() - state.sessionStartTime : 0

  return {
    id: `${Date.now()}`,
    childName: state.childName,
    sessionType: state.sessionType,
    difficulty: state.difficulty,
    rewardPreference: state.rewardPreference,
    score: state.score,
    streak: state.streak,
    completedExercises: state.completedExercises,
    totalExercises: state.totalExercises,
    dominantEmotion,
    emotionCounts,
    transcriptCount: state.transcriptHistory.length,
    durationMs,
    createdAt: new Date().toISOString(),
  }
}

const useSessionStore = create((set, get) => ({
  childName: '',
  setChildName: (name) => set({ childName: name }),

  sessionType: null,
  setSessionType: (type) => set({ sessionType: type }),

  difficulty: 1,
  setDifficulty: (level) =>
    set({
      difficulty: level,
      totalExercises: getTotalExercises(level),
    }),

  rewardPreference: 'confetti',
  setRewardPreference: (rewardPreference) => set({ rewardPreference }),

  phase: PHASES.SETUP,
  setPhase: (phase) => set({ phase }),

  isSessionActive: false,
  sessionStartTime: null,

  currentEmotion: null,
  currentConfidence: 0,
  emotionHistory: [],
  setCurrentEmotion: (emotion, confidence) =>
    set((state) => {
      const mapped = mapEmotion(emotion, confidence)
      return {
        currentEmotion: mapped,
        currentConfidence: confidence,
        emotionHistory: [
          ...state.emotionHistory,
          {
            emotion: mapped,
            confidence,
            sourceEmotion: emotion,
            timestamp: Date.now(),
          },
        ],
      }
    }),

  score: 0,
  addScore: (points) => set((state) => ({ score: state.score + points })),

  completedExercises: 0,
  totalExercises: getTotalExercises(1),
  completeExercise: () =>
    set((state) => ({
      completedExercises: state.completedExercises + 1,
    })),

  streak: 0,
  consecutiveSuccesses: 0,
  consecutiveFailures: 0,
  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
  resetStreak: () => set({ streak: 0 }),
  recordExerciseOutcome: (success) => {
    let adjustment = null

    set((state) => {
      const nextSuccesses = success ? state.consecutiveSuccesses + 1 : 0
      const nextFailures = success ? 0 : state.consecutiveFailures + 1
      let nextDifficulty = state.difficulty

      if (success && nextSuccesses >= 3 && state.difficulty < 3) {
        nextDifficulty = state.difficulty + 1
        adjustment = 'up'
      }

      if (!success && nextFailures >= 2 && state.difficulty > 1) {
        nextDifficulty = state.difficulty - 1
        adjustment = 'down'
      }

      return {
        consecutiveSuccesses: adjustment === 'up' ? 0 : nextSuccesses,
        consecutiveFailures: adjustment === 'down' ? 0 : nextFailures,
        difficulty: nextDifficulty,
        totalExercises: getTotalExercises(nextDifficulty),
      }
    })

    return adjustment
  },

  targetEmotion: null,
  setTargetEmotion: (emotion) => set({ targetEmotion: emotion }),

  feedback: null,
  setFeedback: (feedback) => set({ feedback }),
  clearFeedback: () => set({ feedback: null }),

  lastSpokenText: '',
  setLastSpokenText: (text) => set({ lastSpokenText: text }),

  lastHeardText: '',
  setLastHeardText: (text) => set({ lastHeardText: text }),

  transcriptHistory: [],
  addTranscript: (transcript, confidence = 0) =>
    set((state) => ({
      lastHeardText: transcript,
      transcriptHistory: [
        ...state.transcriptHistory,
        {
          transcript,
          confidence,
          timestamp: Date.now(),
        },
      ],
    })),

  isSpeaking: false,
  setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),

  isListening: false,
  setIsListening: (listening) => set({ isListening: listening }),

  isCameraReady: false,
  setCameraReady: (ready) => set({ isCameraReady: ready }),

  isMicrophoneReady: false,
  setMicrophoneReady: (ready) => set({ isMicrophoneReady: ready }),

  isModelLoaded: false,
  setModelLoaded: (loaded) => set({ isModelLoaded: loaded }),

  isCustomModelLoaded: false,
  customModelMode: 'face-api',
  setCustomModelState: ({ loaded = false, mode = 'face-api' }) =>
    set({
      isCustomModelLoaded: loaded,
      customModelMode: mode,
    }),

  sessionHistory: readHistory(),
  addSessionHistory: (summary) =>
    set((state) => {
      const nextHistory = [summary, ...state.sessionHistory].slice(0, 10)
      writeHistory(nextHistory)
      return { sessionHistory: nextHistory }
    }),

  clearSessionHistory: () => {
    writeHistory([])
    set({ sessionHistory: [] })
  },

  startSession: () =>
    set((state) => ({
      isSessionActive: true,
      sessionStartTime: Date.now(),
      phase: PHASES.OPENING,
      score: 0,
      completedExercises: 0,
      streak: 0,
      consecutiveSuccesses: 0,
      consecutiveFailures: 0,
      emotionHistory: [],
      transcriptHistory: [],
      feedback: null,
      targetEmotion: null,
      currentEmotion: null,
      currentConfidence: 0,
      lastHeardText: '',
      totalExercises: getTotalExercises(state.difficulty),
    })),

  endSession: () => {
    set({
      isSessionActive: false,
      phase: PHASES.CLOSING,
    })
  },

  finalizeSessionReview: () => {
    const state = get()
    const summary = createSummary(state)
    get().addSessionHistory(summary)

    set({
      phase: PHASES.REVIEW,
    })
  },

  resetSession: () =>
    set((state) => ({
      phase: PHASES.SETUP,
      isSessionActive: false,
      sessionStartTime: null,
      sessionType: null,
      currentEmotion: null,
      currentConfidence: 0,
      emotionHistory: [],
      score: 0,
      completedExercises: 0,
      streak: 0,
      consecutiveSuccesses: 0,
      consecutiveFailures: 0,
      targetEmotion: null,
      feedback: null,
      lastSpokenText: '',
      lastHeardText: '',
      transcriptHistory: [],
      isListening: false,
      isSpeaking: false,
      isCameraReady: false,
      isMicrophoneReady: false,
      totalExercises: getTotalExercises(state.difficulty),
    })),

  getSessionDuration: () => {
    const state = get()
    if (!state.sessionStartTime) return 0
    return Math.floor((Date.now() - state.sessionStartTime) / 60000)
  },

  getDominantEmotion: () => {
    const state = get()
    if (state.emotionHistory.length === 0) return null

    const counts = {}
    state.emotionHistory.forEach(({ emotion }) => {
      counts[emotion] = (counts[emotion] || 0) + 1
    })

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  },
}))

export default useSessionStore
