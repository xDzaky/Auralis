// Custom hook for face-api.js emotion detection
import { useEffect, useRef, useCallback, useState } from 'react'
import * as faceapi from 'face-api.js'
import useSessionStore from '../store/useSessionStore'
import {
  getCustomEmotionModelStatus,
  loadCustomEmotionModel,
  predictCustomEmotion,
} from '../services/customEmotionModel'

export default function useEmotion() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const streamRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [faceDetected, setFaceDetected] = useState(false)
  
  const {
    setCurrentEmotion,
    setCameraReady,
    setMicrophoneReady,
    setModelLoaded,
    setCustomModelState,
    isModelLoaded,
  } = useSessionStore()

  // Load face-api models
  const loadModels = useCallback(async () => {
    try {
      setIsLoading(true)
      const MODEL_URL = '/models'
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ])
      await loadCustomEmotionModel()
      const customStatus = getCustomEmotionModelStatus()
      setModelLoaded(true)
      setCustomModelState({
        loaded: customStatus.loaded,
        mode: customStatus.mode,
      })
      setIsLoading(false)
    } catch (err) {
      console.error('Error loading face-api models:', err)
      setError('Gagal memuat model. Coba refresh halaman.')
      setIsLoading(false)
    }
  }, [setCustomModelState, setModelLoaded])

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
        setMicrophoneReady(stream.getAudioTracks().length > 0)
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Tidak bisa mengakses kamera atau mikrofon. Pastikan izinnya sudah diberikan.')
    }
  }, [setCameraReady, setMicrophoneReady])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    setCameraReady(false)
    setMicrophoneReady(false)
  }, [setCameraReady, setMicrophoneReady])

  // Detect emotions continuously
  const startDetection = useCallback(() => {
    if (!videoRef.current || !isModelLoaded) return

    const detect = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        animFrameRef.current = requestAnimationFrame(detect)
        return
      }

      try {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5,
          }))
          .withFaceLandmarks()
          .withFaceExpressions()

        if (detections) {
          setFaceDetected(true)
          const customPrediction = await predictCustomEmotion(videoRef.current, detections)
          const expressions = detections.expressions
          const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1])
          const [defaultEmotion, defaultConfidence] = sorted[0]
          const topEmotion = customPrediction?.emotion || defaultEmotion
          const topConfidence = customPrediction?.confidence || defaultConfidence
          
          setCurrentEmotion(topEmotion, topConfidence)

          // Draw face detection on canvas
          if (canvasRef.current && videoRef.current) {
            const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true)
            const resized = faceapi.resizeResults(detections, dims)
            
            const ctx = canvasRef.current.getContext('2d')
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
            
            // Draw face outline with glow
            faceapi.draw.drawDetections(canvasRef.current, resized)
          }
        } else {
          setFaceDetected(false)
        }
      } catch (err) {
        // Silent fail on individual frames
      }

      // Run detection every ~300ms for performance
      setTimeout(() => {
        animFrameRef.current = requestAnimationFrame(detect)
      }, 250)
    }

    animFrameRef.current = requestAnimationFrame(detect)
  }, [isModelLoaded, setCurrentEmotion])

  // Initialize
  useEffect(() => {
    loadModels()
    return () => {
      stopCamera()
    }
  }, [loadModels, stopCamera])

  return {
    videoRef,
    canvasRef,
    isLoading,
    error,
    faceDetected,
    startCamera,
    stopCamera,
    startDetection,
  }
}
