const MODEL_URL = '/models/custom-emotion/model.json'
const INPUT_SIZE = 64
const LABELS = ['happy', 'sad', 'neutral', 'confused']

let cachedModel = null
let loadAttempted = false
let cachedTf = null

async function getTf() {
  if (!cachedTf) {
    cachedTf = await import('@tensorflow/tfjs')
  }

  return cachedTf
}

function getPredictionTensor(model, inputTensor) {
  if (typeof model.predict === 'function') {
    return model.predict(inputTensor)
  }

  if (typeof model.executeAsync === 'function') {
    return model.executeAsync(inputTensor)
  }

  if (typeof model.execute === 'function') {
    return model.execute(inputTensor)
  }

  throw new Error('Custom model does not expose predict/execute')
}

function normalizeScores(values) {
  if (!Array.isArray(values) || values.length === 0) return null

  const total = values.reduce((sum, value) => sum + value, 0)
  if (total <= 0) return null

  return values.map((value) => value / total)
}

async function loadModel() {
  if (cachedModel) return cachedModel
  if (loadAttempted) return null

  loadAttempted = true
  const tf = await getTf()

  try {
    cachedModel = await tf.loadLayersModel(MODEL_URL)
  } catch {
    try {
      cachedModel = await tf.loadGraphModel(MODEL_URL)
    } catch {
      cachedModel = null
    }
  }

  return cachedModel
}

function extractFaceCanvas(videoElement, detection) {
  if (!videoElement || !detection?.detection?.box) return null

  const box = detection.detection.box
  const canvas = document.createElement('canvas')
  canvas.width = INPUT_SIZE
  canvas.height = INPUT_SIZE

  const context = canvas.getContext('2d')
  if (!context) return null

  context.drawImage(
    videoElement,
    box.x,
    box.y,
    box.width,
    box.height,
    0,
    0,
    INPUT_SIZE,
    INPUT_SIZE,
  )

  return canvas
}

async function predict(videoElement, detection) {
  const model = await loadModel()
  if (!model) return null

  const faceCanvas = extractFaceCanvas(videoElement, detection)
  if (!faceCanvas) return null

  const tf = await getTf()
  const inputTensor = tf.browser.fromPixels(faceCanvas).toFloat().div(255).expandDims(0)

  try {
    const output = await getPredictionTensor(model, inputTensor)
    const tensor = Array.isArray(output) ? output[0] : output
    const values = Array.from(await tensor.data())
    const normalized = normalizeScores(values)
    tensor.dispose?.()
    if (Array.isArray(output)) {
      output.slice(1).forEach((item) => item?.dispose?.())
    }

    if (!normalized || normalized.length < LABELS.length) {
      return null
    }

    const scores = LABELS.reduce((acc, label, index) => {
      acc[label] = normalized[index] ?? 0
      return acc
    }, {})

    const topEntry = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
    if (!topEntry) return null

    const [emotion, confidence] = topEntry
    return {
      emotion,
      confidence,
      scores,
    }
  } catch {
    return null
  } finally {
    inputTensor.dispose()
  }
}

function getStatus() {
  return {
    attempted: loadAttempted,
    loaded: Boolean(cachedModel),
    mode: cachedModel ? 'custom-tfjs' : 'face-api',
    modelUrl: MODEL_URL,
  }
}

function resetForTests() {
  cachedModel = null
  loadAttempted = false
  cachedTf = null
}

export {
  INPUT_SIZE,
  LABELS as CUSTOM_MODEL_LABELS,
  MODEL_URL as CUSTOM_MODEL_URL,
  getStatus as getCustomEmotionModelStatus,
  loadModel as loadCustomEmotionModel,
  normalizeScores,
  predict as predictCustomEmotion,
  resetForTests,
}
