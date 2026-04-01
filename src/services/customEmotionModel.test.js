import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tensorflow/tfjs', () => ({
  loadLayersModel: vi.fn(),
  loadGraphModel: vi.fn(),
  browser: {
    fromPixels: vi.fn(),
  },
}))

import * as tf from '@tensorflow/tfjs'
import {
  CUSTOM_MODEL_URL,
  getCustomEmotionModelStatus,
  loadCustomEmotionModel,
  normalizeScores,
  resetForTests,
} from './customEmotionModel'

describe('customEmotionModel', () => {
  beforeEach(() => {
    resetForTests()
    vi.clearAllMocks()
  })

  it('normalizes output values into probabilities', () => {
    expect(normalizeScores([2, 2, 4, 2])).toEqual([0.2, 0.2, 0.4, 0.2])
  })

  it('falls back cleanly when custom model file is missing', async () => {
    tf.loadLayersModel.mockRejectedValueOnce(new Error('missing model'))
    tf.loadGraphModel.mockRejectedValueOnce(new Error('missing graph model'))

    const model = await loadCustomEmotionModel()
    const status = getCustomEmotionModelStatus()

    expect(model).toBeNull()
    expect(tf.loadLayersModel).toHaveBeenCalledWith(CUSTOM_MODEL_URL)
    expect(tf.loadGraphModel).toHaveBeenCalledWith(CUSTOM_MODEL_URL)
    expect(status.loaded).toBe(false)
    expect(status.mode).toBe('face-api')
  })
})
