import { EMOTION_LABELS } from '../store/useSessionStore'

const PRAISE_MESSAGES = {
  happy: [
    'Waaah, kamu terlihat senang sekali!',
    'Senyummu manis sekali. Bagus!',
    'Kamu sedang bahagia ya. Hebat!',
  ],
  sad: [
    'Tidak apa-apa merasa sedih. Kamu hebat sudah menunjukkannya.',
    'Kamu bisa mengenali rasa sedih. Pintar!',
    'Terima kasih sudah jujur dengan perasaanmu.',
  ],
  neutral: [
    'Wajahmu tenang sekali. Bagus!',
    'Kamu terlihat santai dan nyaman.',
    'Ekspresi biasa juga penting untuk dikenali.',
  ],
  confused: [
    'Sepertinya masih bingung ya. Kita coba pelan-pelan.',
    'Coba lihat ke kamera lagi ya.',
    'Tidak apa-apa kalau belum jelas. Kita ulangi.',
  ],
  angry: [
    'Kamu bisa menunjukkan rasa kesal. Pintar!',
    'Kalau marah, kita tetap belajar mengenalinya ya.',
    'Bagus, kamu tahu wajah marah seperti apa.',
  ],
}

const GUESS_INSTRUCTIONS = {
  happy: [
    'Ayo tunjukkan wajah senang.',
    'Coba senyum yang lebar ya.',
  ],
  sad: [
    'Coba tunjukkan wajah sedih.',
    'Sekarang buat wajah sedih ya.',
  ],
  neutral: [
    'Coba buat wajah biasa saja.',
    'Tunjukkan wajah tenangmu.',
  ],
  confused: [
    'Sekarang coba wajah bingung.',
    'Boleh coba ekspresi seperti sedang berpikir.',
  ],
}

const STORY_PROMPTS = [
  'Sekarang ceritakan, kamu sedang merasa apa?',
  'Boleh bilang: senang, sedih, biasa, atau bingung.',
  'Ayo sebutkan perasaanmu dengan pelan ya.',
]

const ENCOURAGEMENT = [
  'Kamu hebat. Ayo lanjut!',
  'Bagus sekali. Terus semangat!',
  'Pintar! Kamu bisa!',
  'Luar biasa. Lanjut ya!',
]

const STREAK_MESSAGES = {
  3: 'Tiga kali berturut-turut. Super!',
  5: 'Lima kali berturut-turut. Luar biasa!',
  7: 'Tujuh kali. Kamu juara!',
}

const PHASE_MESSAGES = {
  opening: (name) => [
    `Halo ${name}! Hari ini kita latihan emosi bersama ya.`,
    `Hai ${name}! Senang bertemu kamu hari ini.`,
  ],
  warmup: (name) => [
    `${name}, lihat ke kamera dulu ya.`,
    `Ayo pemanasan dulu. Wajahmu akan aku lihat sebentar ya.`,
  ],
  training: (name, score, sessionType) => {
    if (sessionType === 'story') {
      return [`${name}, kita akan latihan bilang perasaanmu ya.`]
    }

    return [
      'Sekarang kita mulai latihan ya.',
      'Ayo kita main tebak emosi.',
    ]
  },
  review: (name, score) => [
    `Hebat ${name}! Kamu dapat ${score} poin hari ini.`,
  ],
  closing: (name) => [
    `Sampai jumpa ${name}. Kamu hebat hari ini.`,
  ],
}

const STORY_KEYWORDS = {
  happy: ['senang', 'bahagia', 'gembira', 'ceria'],
  sad: ['sedih', 'kecewa', 'menangis'],
  neutral: ['biasa', 'tenang', 'netral', 'oke'],
  confused: ['bingung', 'ragu', 'tidak tahu', 'nggak tahu'],
}

class LogicEngine {
  constructor() {
    this.lastResponseTime = 0
    this.responseDelay = 2500
  }

  _random(items) {
    return items[Math.floor(Math.random() * items.length)]
  }

  canRespond() {
    return Date.now() - this.lastResponseTime > this.responseDelay
  }

  markResponded() {
    this.lastResponseTime = Date.now()
  }

  getPraise(emotion) {
    this.markResponded()
    const messages = PRAISE_MESSAGES[emotion] || PRAISE_MESSAGES.neutral
    return {
      text: this._random(messages),
      emoji: EMOTION_LABELS[emotion]?.emoji || '😊',
      type: 'praise',
    }
  }

  getInstruction(targetEmotion) {
    const messages = GUESS_INSTRUCTIONS[targetEmotion] || GUESS_INSTRUCTIONS.happy
    return {
      text: this._random(messages),
      emoji: EMOTION_LABELS[targetEmotion]?.emoji || '🎯',
      type: 'instruction',
    }
  }

  getStoryPrompt() {
    return {
      text: this._random(STORY_PROMPTS),
      emoji: '🎙️',
      type: 'instruction',
    }
  }

  checkEmotionMatch(detected, target, confidence) {
    this.markResponded()

    if (confidence < 0.6) {
      return {
        match: false,
        text: 'Coba lebih jelas ya. Lihat ke kamera sebentar.',
        emoji: '🤔',
        type: 'retry',
      }
    }

    if (detected === target) {
      return {
        match: true,
        text: this._random(ENCOURAGEMENT),
        emoji: '🎉',
        type: 'success',
        points: 10 + Math.floor(confidence * 10),
      }
    }

    return {
      match: false,
      text: `Hmm, itu terlihat ${EMOTION_LABELS[detected]?.label || 'berbeda'}. Coba lagi ya.`,
      emoji: '💪',
      type: 'retry',
    }
  }

  parseSpeechEmotion(transcript = '') {
    const normalized = transcript.toLowerCase()

    for (const [emotion, keywords] of Object.entries(STORY_KEYWORDS)) {
      if (keywords.some((keyword) => normalized.includes(keyword))) {
        return emotion
      }
    }

    return null
  }

  checkStoryAnswer(transcript, detectedEmotion, confidence) {
    this.markResponded()

    const spokenEmotion = this.parseSpeechEmotion(transcript)
    if (!spokenEmotion) {
      return {
        match: false,
        text: 'Aku belum dengar nama emosinya. Coba bilang lagi ya.',
        emoji: '🎙️',
        type: 'retry',
      }
    }

    if (confidence >= 0.6 && spokenEmotion === detectedEmotion) {
      return {
        match: true,
        text: `Bagus, kamu bilang ${EMOTION_LABELS[spokenEmotion]?.label?.toLowerCase()}.`,
        emoji: '🌟',
        type: 'success',
        points: 12 + Math.floor(confidence * 8),
      }
    }

    return {
      match: false,
      text: `Aku dengar ${EMOTION_LABELS[spokenEmotion]?.label?.toLowerCase()}, tapi wajahmu belum terlalu jelas. Kita coba lagi ya.`,
      emoji: '🤝',
      type: 'retry',
    }
  }

  getStreakMessage(streak) {
    return STREAK_MESSAGES[streak] || null
  }

  getPhaseMessage(phase, name, score = 0, sessionType = 'guess') {
    const messages = PHASE_MESSAGES[phase]
    if (!messages) return null
    const pool = typeof messages === 'function' ? messages(name, score, sessionType) : messages
    return this._random(pool)
  }

  getNextTarget(history = [], difficulty = 1) {
    const emotions =
      difficulty >= 3 ? ['happy', 'sad', 'neutral', 'confused'] :
      difficulty >= 2 ? ['happy', 'sad', 'neutral'] :
      ['happy', 'sad']

    const previous = history.at(-1)
    const available = emotions.filter((emotion) => emotion !== previous)
    return this._random(available.length > 0 ? available : emotions)
  }

  processMirrorMode(emotion, confidence) {
    if (!this.canRespond()) return null
    if (confidence < 0.45) return null

    return this.getPraise(emotion)
  }
}

const logicEngine = new LogicEngine()
export default logicEngine
