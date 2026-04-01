import logicEngine from './logicEngine'

describe('logicEngine', () => {
  it('maps Indonesian speech keywords to expected emotions', () => {
    expect(logicEngine.parseSpeechEmotion('aku sedang senang sekali')).toBe('happy')
    expect(logicEngine.parseSpeechEmotion('hari ini aku bingung')).toBe('confused')
    expect(logicEngine.parseSpeechEmotion('aku merasa biasa')).toBe('neutral')
  })

  it('returns a success result when story speech matches detected emotion', () => {
    const result = logicEngine.checkStoryAnswer('aku sedih', 'sad', 0.84)

    expect(result.match).toBe(true)
    expect(result.type).toBe('success')
    expect(result.points).toBeGreaterThan(0)
  })

  it('does not repeat the immediately previous target emotion', () => {
    const next = logicEngine.getNextTarget(['happy'], 2)
    expect(['sad', 'neutral']).toContain(next)
  })
})
