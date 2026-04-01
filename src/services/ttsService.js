class TTSService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null
    this.voice = null
    this.rate = 0.85
    this.pitch = 1.08
    this.volume = 1
    this.onStartCallback = null
    this.onEndCallback = null
    this._initVoice()
  }

  _initVoice() {
    if (!this.synth) return

    const loadVoices = () => {
      const voices = this.synth.getVoices()
      this.voice =
        voices.find((voice) => voice.lang.startsWith('id')) ||
        voices.find((voice) => voice.lang.startsWith('ms')) ||
        voices.find((voice) => voice.lang.startsWith('en') && /female|zira|samantha/i.test(voice.name)) ||
        voices[0] ||
        null
    }

    loadVoices()
    if (typeof this.synth.onvoiceschanged !== 'undefined') {
      this.synth.onvoiceschanged = loadVoices
    }
  }

  speak(text, options = {}) {
    return new Promise((resolve) => {
      if (!this.synth || !text) {
        resolve()
        return
      }

      this.synth.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = this.voice
      utterance.rate = options.rate || this.rate
      utterance.pitch = options.pitch || this.pitch
      utterance.volume = options.volume || this.volume
      utterance.lang = 'id-ID'

      utterance.onstart = () => {
        if (this.onStartCallback) this.onStartCallback()
      }

      utterance.onend = () => {
        if (this.onEndCallback) this.onEndCallback()
        resolve()
      }

      utterance.onerror = () => {
        if (this.onEndCallback) this.onEndCallback()
        resolve()
      }

      this.synth.speak(utterance)
    })
  }

  stop() {
    if (!this.synth) return
    this.synth.cancel()
  }

  isSpeaking() {
    return this.synth?.speaking || false
  }

  onStart(callback) {
    this.onStartCallback = callback
  }

  onEnd(callback) {
    this.onEndCallback = callback
  }
}

const ttsService = new TTSService()
export default ttsService
