import { useState, useEffect, useCallback, useRef } from 'react'
// FORCE CACHE INVALIDATION: 1

const PIPELINE_STEPS = [
  { id: 'observe', label: 'Observe', icon: '👁️', description: 'Scanning physical space via webcam' },
  { id: 'buffer', label: 'Buffer', icon: '📦', description: 'Buffering frames for consistency check' },
  { id: 'reason', label: 'Reason', icon: '🧠', description: 'Evaluating presence & security risk' },
  { id: 'plan', label: 'Plan', icon: '📋', description: 'Formulating safety response strategy' },
  { id: 'decide', label: 'Decide', icon: '⚡', description: 'Selecting optimal security tool' },
  { id: 'execute', label: 'Execute', icon: '🔧', description: 'Executing selected system tool' },
  { id: 'verify', label: 'Verify', icon: '✅', description: 'Verifying tool execution response' },
]

function generateTimestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function useAntiGravityAgent() {
  const [demoMode, setDemoMode] = useState(false)
  const [hardwareStatus, setHardwareStatus] = useState({
    camera: 'Disconnected',
    afferens: 'Waiting',
    agent: 'Waiting',
    backend: 'Disconnected',
    ws: 'Disconnected'
  })
  
  const [hasEnrolledUser, setHasEnrolledUser] = useState(null) // null = loading, false = no, true = yes

  // Agent State values
  const [securityState, setSecurityState] = useState('Idle')
  const [presenceStatus, setPresenceStatus] = useState('Unknown')
  const [presenceConfidence, setPresenceConfidence] = useState(null)
  const [riskScore, setRiskScore] = useState(null)
  const [absenceDuration, setAbsenceDuration] = useState(0)
  const [unknownVisitorCount, setUnknownVisitorCount] = useState(0)
  const [lastDecision, setLastDecision] = useState('Waiting for Perception')
  const [lastReason, setLastReason] = useState('System is idle. Camera stream required.')
  const [selectedTool, setSelectedTool] = useState('update_dashboard()')
  const [reasoning, setReasoning] = useState('Awaiting webcam perception logs...')
  
  const [pipelineActiveStep, setPipelineActiveStep] = useState(0)
  const [pipelineStepStatus, setPipelineStepStatus] = useState({
    observe: 'waiting', buffer: 'waiting', reason: 'waiting', plan: 'waiting', decide: 'waiting', execute: 'waiting', verify: 'waiting'
  })
  
  const [events, setEvents] = useState([])
  const [notifications, setNotifications] = useState([])
  const [workingMemory, setWorkingMemory] = useState({})

  const [isThinking, setIsThinking] = useState(false)
  const [currentThinkingPhase, setCurrentThinkingPhase] = useState('Waiting for camera...')
  
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const wsRef = useRef(null)
  const analysisIntervalRef = useRef(null)

  const triggerToast = useCallback((event) => {
    setNotifications(prev => [event, ...prev].slice(0, 10))
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setHardwareStatus(prev => ({ ...prev, camera: 'Connected' }))
      connectBackend()
    } catch (err) {
      console.warn('Camera access error:', err)
      alert(`Could not access real webcam: ${err.message}. Starting simulated camera stream for demo purposes.`)
      
      // Fallback: Create a simulated media stream so the hackathon demo can still run!
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 480
      const ctx = canvas.getContext('2d')
      
      let hue = 0
      setInterval(() => {
        ctx.fillStyle = `hsl(${hue}, 50%, 20%)`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'white'
        ctx.font = '30px Arial'
        ctx.fillText('Simulated Camera Stream', 150, 240)
        hue = (hue + 1) % 360
      }, 100)

      const stream = canvas.captureStream(30)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setHardwareStatus(prev => ({ ...prev, camera: 'Connected (Simulated)' }))
      connectBackend()
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (wsRef.current) {
      wsRef.current.close()
    }
    if (analysisIntervalRef.current && analysisIntervalRef.current.stop) {
      analysisIntervalRef.current.stop()
    } else if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current)
    }

    setHardwareStatus({
      camera: 'Disconnected', afferens: 'Waiting', agent: 'Waiting', backend: 'Disconnected', ws: 'Disconnected'
    })
    
    setSecurityState('Idle')
    setPresenceStatus('Unknown')
    setPresenceConfidence(null)
    setRiskScore(null)
    setAbsenceDuration(0)
    setUnknownVisitorCount(0)
    setLastDecision('Waiting for Perception')
    setLastReason('System is idle. Camera stream required.')
    setSelectedTool('update_dashboard()')
    setReasoning('Awaiting webcam perception logs...')
    setCurrentThinkingPhase('Waiting for camera...')
    setWorkingMemory({})
    setIsThinking(false)
  }

  const connectBackend = () => {
    const ws = new WebSocket('ws://localhost:3001/ws/agent')
    wsRef.current = ws

    ws.onopen = () => {
      setHardwareStatus(prev => ({ ...prev, ws: 'Active', backend: 'Online', agent: 'Running', afferens: 'Connected' }))
      startStreaming()
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'PIPELINE_UPDATE') {
        const { step, status } = data.payload
        const stepIdx = PIPELINE_STEPS.findIndex(s => s.id === step)
        if (stepIdx !== -1) {
          setIsThinking(true)
          setPipelineActiveStep(stepIdx)
          setPipelineStepStatus(prev => ({ ...prev, [step]: status }))
          setCurrentThinkingPhase(PIPELINE_STEPS[stepIdx].description)
        }
      } else if (data.type === 'STATE_UPDATE') {
        setIsThinking(false)
        const payload = data.payload
        
        if (securityState !== payload.securityState && ['WARNING', 'LOCKED', 'INTRUDER_DETECTED'].includes(payload.securityState)) {
           const typeMap = { WARNING: 'warning', LOCKED: 'danger', INTRUDER_DETECTED: 'danger' }
           const newEvent = { type: typeMap[payload.securityState], message: payload.reasoning, timestamp: generateTimestamp(), id: Date.now() }
           setEvents(prev => [newEvent, ...prev].slice(0, 50))
           triggerToast(newEvent)
        } else if (securityState !== payload.securityState && payload.securityState === 'NORMAL') {
           const newEvent = { type: 'success', message: payload.reasoning, timestamp: generateTimestamp(), id: Date.now() }
           setEvents(prev => [newEvent, ...prev].slice(0, 50))
           triggerToast(newEvent)
        }

        setSecurityState(payload.securityState)
        setPresenceStatus(payload.presenceStatus)
        setPresenceConfidence(payload.confidence)
        setRiskScore(payload.riskScore)
        setAbsenceDuration(payload.absenceDuration)
        setUnknownVisitorCount(payload.unknownVisitorCount)
        setLastDecision(payload.lastDecision)
        setReasoning(payload.reasoning)
        setLastReason(payload.reasoning)
        setSelectedTool(payload.selectedTool)
        setWorkingMemory(payload.workingMemory)
      }
    }

    ws.onclose = () => {
      setHardwareStatus(prev => ({ ...prev, ws: 'Reconnecting', backend: 'Offline', agent: 'Stopped' }))
      if (analysisIntervalRef.current && analysisIntervalRef.current.stop) {
        analysisIntervalRef.current.stop()
      } else if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current)
      }
      // Attempt reconnect if camera is still active
      if (streamRef.current) {
        setTimeout(connectBackend, 3000)
      }
    }
  }

  const startStreaming = async () => {
    const faceapi = window.faceapi;
    if (!faceapi) {
      console.error("face-api not found globally. Please check index.html script tag.");
      return;
    }

    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);
    } catch (e) {
      console.error("Failed to load face-api models for live feed:", e);
    }

    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 120
    const ctx = canvas.getContext('2d')

    let lastDescriptorTime = 0;
    let lastDescriptor = null;
    let isStreamingActive = true;
    
    // Liveness Tracking Variables
    let livenessPassed = false;
    let prevNoseX = null;
    let movementAccumulator = 0;

    analysisIntervalRef.current = {
      stop: () => { isStreamingActive = false; }
    };

    const loop = async () => {
      if (!isStreamingActive || !videoRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      const videoEl = videoRef.current;
      if (videoEl.paused || videoEl.ended) {
        setTimeout(loop, 100);
        return;
      }

      const startTime = Date.now();
      let hasFace = false;
      let shouldExtractDescriptor = (startTime - lastDescriptorTime) > 400; // 400ms throttle

      try {
        let detection;
        if (shouldExtractDescriptor) {
           detection = await faceapi.detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
                                    .withFaceLandmarks()
                                    .withFaceDescriptor();
           if (detection) {
             lastDescriptor = Array.from(detection.descriptor);
             lastDescriptorTime = startTime;
           } else {
             lastDescriptor = null;
           }
        } else {
           detection = await faceapi.detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
                                    .withFaceLandmarks();
        }
        
        hasFace = !!detection;
        
        if (hasFace && detection.landmarks) {
           const nosePos = detection.landmarks.getNose()[0];
           if (prevNoseX !== null) {
              const diff = Math.abs(nosePos.x - prevNoseX);
              movementAccumulator += diff;
           }
           prevNoseX = nosePos.x;
           
           if (movementAccumulator > 15) { // Threshold for slight head movement
              livenessPassed = true;
           }
        } else {
           livenessPassed = false;
           prevNoseX = null;
           movementAccumulator = 0;
        }

      } catch (e) {
        // ignore occasional canvas errors
      }
      
      const detectionTime = Date.now() - startTime;

      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      const frameData = canvas.toDataURL('image/jpeg', 0.5);

      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'PERCEPTION_PAYLOAD',
          payload: { 
             frame: frameData, 
             hasFace,
             descriptor: lastDescriptor,
             livenessPassed,
             metrics: { detectionTime }
          }
        }));
      }

      setTimeout(loop, 100); 
    };
    
    loop();
  }

  useEffect(() => {
    checkProfileStatus()
    return () => {
      stopCamera()
    }
  }, [])

  const checkProfileStatus = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/profile')
      if (res.ok) {
        const data = await res.json()
        setHasEnrolledUser(!!data.profile)
      } else {
        setHasEnrolledUser(false)
      }
    } catch (err) {
      setHasEnrolledUser(false)
    }
  }

  return {
    demoMode,
    setDemoMode,
    hardwareStatus,
    startCamera,
    stopCamera,
    videoRef,
    
    securityState,
    presenceStatus,
    presenceConfidence,
    riskScore,
    absenceDuration,
    unknownVisitorCount,
    lastDecision,
    lastReason,
    selectedTool,
    reasoning,
    pipelineActiveStep,
    pipelineStepStatus,
    events,
    notifications,
    workingMemory,
    isThinking,
    currentThinkingPhase,
    PIPELINE_STEPS,
    hasEnrolledUser,
    checkProfileStatus
  }
}
