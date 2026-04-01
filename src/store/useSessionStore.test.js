import useSessionStore, { PHASES } from './useSessionStore'

describe('useSessionStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useSessionStore.setState({
      childName: '',
      sessionType: null,
      difficulty: 1,
      rewardPreference: 'confetti',
      phase: PHASES.SETUP,
      isSessionActive: false,
      sessionStartTime: null,
      currentEmotion: null,
      currentConfidence: 0,
      emotionHistory: [],
      score: 0,
      completedExercises: 0,
      totalExercises: 4,
      streak: 0,
      consecutiveSuccesses: 0,
      consecutiveFailures: 0,
      targetEmotion: null,
      feedback: null,
      lastSpokenText: '',
      lastHeardText: '',
      transcriptHistory: [],
      isSpeaking: false,
      isListening: false,
      isCameraReady: false,
      isMicrophoneReady: false,
      isModelLoaded: false,
      isCustomModelLoaded: false,
      customModelMode: 'face-api',
      sessionHistory: [],
    })
  })

  it('starts a session in opening phase', () => {
    useSessionStore.getState().setDifficulty(2)
    useSessionStore.getState().startSession()
    const state = useSessionStore.getState()

    expect(state.phase).toBe(PHASES.OPENING)
    expect(state.isSessionActive).toBe(true)
    expect(state.totalExercises).toBe(5)
  })

  it('ends with closing phase first and finalizes into review with local history', () => {
    const store = useSessionStore.getState()
    store.setChildName('Alya')
    store.setSessionType('guess')
    store.startSession()
    store.addScore(20)
    store.completeExercise()
    store.endSession()

    expect(useSessionStore.getState().phase).toBe(PHASES.CLOSING)

    useSessionStore.getState().finalizeSessionReview()
    const state = useSessionStore.getState()

    expect(state.phase).toBe(PHASES.REVIEW)
    expect(state.sessionHistory).toHaveLength(1)
    expect(state.sessionHistory[0].childName).toBe('Alya')
  })

  it('maps low-confidence detections to confused', () => {
    useSessionStore.getState().setCurrentEmotion('happy', 0.42)
    const state = useSessionStore.getState()

    expect(state.currentEmotion).toBe('confused')
    expect(state.emotionHistory.at(-1)?.emotion).toBe('confused')
  })

  it('raises difficulty after repeated success streaks', () => {
    const store = useSessionStore.getState()
    store.setDifficulty(1)

    expect(store.recordExerciseOutcome(true)).toBeNull()
    expect(useSessionStore.getState().recordExerciseOutcome(true)).toBeNull()
    expect(useSessionStore.getState().recordExerciseOutcome(true)).toBe('up')
    expect(useSessionStore.getState().difficulty).toBe(2)
  })

  it('lowers difficulty after repeated failures', () => {
    const store = useSessionStore.getState()
    store.setDifficulty(3)

    expect(store.recordExerciseOutcome(false)).toBeNull()
    expect(useSessionStore.getState().recordExerciseOutcome(false)).toBe('down')
    expect(useSessionStore.getState().difficulty).toBe(2)
  })
})
