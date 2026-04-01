class SpeechService {
  constructor() {
    this.recognition = null
    this.isAvailable = false
    this.isListening = false
    this.onResultCallback = null
    this.onStartCallback = null
    this.onEndCallback = null
    this.onErrorCallback = null
    this._init()
  }

  _init() {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      return
    }

    this.recognition = new SpeechRecognition()
    this.recognition.lang = 'id-ID'
    this.recognition.continuous = false
    this.recognition.interimResults = false
    this.recognition.maxAlternatives = 3

    this.recognition.onresult = (event) => {
      const result = event.results[0][0]
      const transcript = result.transcript.toLowerCase().trim()
      const confidence = result.confidence || 0
      if (this.onResultCallback) {
        this.onResultCallback(transcript, confidence)
      }
    }

    this.recognition.onstart = () => {
      this.isListening = true
      if (this.onStartCallback) this.onStartCallback()
    }

    this.recognition.onend = () => {
      this.isListening = false
      if (this.onEndCallback) this.onEndCallback()
    }

    this.recognition.onerror = (event) => {
      this.isListening = false
      if (this.onErrorCallback) this.onErrorCallback(event.error)
      if (this.onEndCallback) this.onEndCallback()
    }

    this.isAvailable = true
  }

  start() {
    if (!this.isAvailable || this.isListening || !this.recognition) return false

    try {
      this.recognition.start()
      return true
    } catch {
      return false
    }
  }

  stop() {
    if (!this.isAvailable || !this.isListening || !this.recognition) return

    try {
      this.recognition.stop()
    } catch {
      // Ignore browser-specific stop errors.
    }
  }

  onResult(callback) {
    this.onResultCallback = callback
  }

  onStart(callback) {
    this.onStartCallback = callback
  }

  onEnd(callback) {
    this.onEndCallback = callback
  }

  onError(callback) {
    this.onErrorCallback = callback
  }
}

const speechService = new SpeechService()
export default speechService
