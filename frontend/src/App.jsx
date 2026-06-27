import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import TopHeader from './components/TopHeader'
import WebcamFeed from './components/WebcamFeed'
import PresenceStatus from './components/PresenceStatus'
import RiskGauge from './components/RiskGauge'
import DecisionPipeline from './components/DecisionPipeline'
import LiveSecurityStatus from './components/LiveSecurityStatus'
import StatisticsCards from './components/StatisticsCards'
import EventTimeline from './components/EventTimeline'
import SecurityLogs from './components/SecurityLogs'
import WorkingMemory from './components/WorkingMemory'
import ReasoningPanel from './components/ReasoningPanel'
import NotificationsFeed from './components/NotificationsFeed'
import SystemHealthMonitor from './components/SystemHealthMonitor'
import PerformanceMetrics from './components/PerformanceMetrics'
import ProfileModal from './components/ProfileModal'
import { useAntiGravityAgent } from './hooks/useAntiGravityAgent'

export default function App() {
  const {
    hardwareStatus,
    startCamera,
    stopCamera,
    videoRef,

    securityState,
    presenceStatus,
    presenceConfidence,
    riskScore,
    absenceDuration,
    lastDecision,
    lastReason,
    selectedTool,
    reasoning,
    pipelineActiveStep,
    pipelineStepStatus,
    events,
    notifications,
    workingMemory,
    PIPELINE_STEPS,
    hasEnrolledUser,
    checkProfileStatus
  } = useAntiGravityAgent()

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  useEffect(() => {
    if (hasEnrolledUser === false) {
      setIsProfileModalOpen(true)
    }
  }, [hasEnrolledUser])

  const isIntruder = securityState === 'INTRUDER_DETECTED'

  return (
    <div className="flex h-screen bg-[#0B1220] text-slate-100 overflow-hidden font-sans selection:bg-[#14B8A6]/30 selection:text-[#14B8A6]">
      
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        onEnrollSuccess={() => { checkProfileStatus(); setIsProfileModalOpen(false); }}
        requireEnrollment={hasEnrolledUser === false}
      />
      
      <AnimatePresence>
        {isIntruder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-600 pointer-events-none z-[100] border-[4px] border-red-500/40"
            style={{
              boxShadow: 'inset 0 0 100px rgba(239, 68, 68, 0.4)'
            }}
          />
        )}
      </AnimatePresence>

      <Sidebar securityState={securityState} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#14B8A6]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#3B82F6]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <TopHeader 
          hardwareStatus={hardwareStatus} 
          onOpenProfile={() => setIsProfileModalOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1920px] mx-auto">
            
            {/* COLUMN 1: Camera & Presence (40% width approx = span 5) */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              <WebcamFeed 
                securityState={securityState} 
                videoRef={videoRef}
                startCamera={startCamera}
                stopCamera={stopCamera}
                cameraStatus={hardwareStatus.camera}
              />
              <PresenceStatus
                presenceStatus={presenceStatus}
                presenceConfidence={presenceConfidence}
                securityState={securityState}
                hardwareStatus={hardwareStatus}
              />
            </div>
            
            {/* COLUMN 2: Pipeline & Gauge (span 3) */}
            <div className="xl:col-span-3 flex flex-col gap-6">
              <DecisionPipeline
                pipelineSteps={PIPELINE_STEPS}
                activeStep={pipelineActiveStep}
                pipelineStepStatus={pipelineStepStatus}
                securityState={securityState}
              />
              <RiskGauge riskScore={riskScore} securityState={securityState} />
            </div>
            
            {/* COLUMN 3: Status, Stats, Events (span 4) */}
            <div className="xl:col-span-4 flex flex-col gap-6 h-full">
              <LiveSecurityStatus 
                securityState={securityState}
                hasEnrolledUser={hasEnrolledUser}
                presenceConfidence={presenceConfidence}
              />
              <StatisticsCards events={events} absenceDuration={absenceDuration} />
              <SecurityLogs events={events} />
            </div>
            
            {/* Timeline spanning columns 1 & 2 */}
            <div className="xl:col-span-8">
              <EventTimeline events={events} />
            </div>

            {/* Existing supplementary components pushed to bottom */}
            <div className="xl:col-span-12 grid grid-cols-1 xl:grid-cols-3 gap-6 mt-4 pt-6 border-t border-slate-800/40">
              <WorkingMemory workingMemory={workingMemory} />
              <ReasoningPanel
                reasoning={reasoning}
                lastDecision={lastDecision}
                lastReason={lastReason}
                selectedTool={selectedTool}
                securityState={securityState}
                presenceConfidence={presenceConfidence}
                riskScore={riskScore}
              />
              <div className="flex flex-col gap-6">
                <PerformanceMetrics presenceConfidence={presenceConfidence} absenceDuration={absenceDuration} />
                <SystemHealthMonitor hardwareStatus={hardwareStatus} />
                <NotificationsFeed notifications={notifications} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
