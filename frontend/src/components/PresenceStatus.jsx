import { motion } from 'framer-motion'
import { Server, Camera, Eye, UserCheck, Shield, BrainCircuit, Lock, Activity } from 'lucide-react'

export default function PresenceStatus({ presenceStatus, presenceConfidence, securityState, hardwareStatus }) {
  const isCameraActive = hardwareStatus?.camera === 'Connected'
  const isRecognitionActive = hardwareStatus?.afferens === 'Connected'
  const isFaceDetected = presenceStatus === 'Present' || presenceStatus === 'Unknown'
  const isVerified = presenceStatus === 'Present' && (securityState === 'AUTHORIZED_USER_VERIFIED' || securityState === 'NORMAL')
  const isMonitoring = ['NORMAL', 'MONITORING', 'WARNING'].includes(securityState)
  const isLocked = ['LOCKED', 'INTRUDER_DETECTED'].includes(securityState)

  const metrics = [
    { label: 'Camera Link', active: isCameraActive, icon: Camera },
    { label: 'Recognition', active: isRecognitionActive, icon: BrainCircuit },
    { label: 'Face Detected', active: isFaceDetected, icon: Eye },
    { label: 'Identity Verified', active: isVerified, icon: UserCheck },
    { label: 'Live Monitoring', active: isMonitoring, icon: Activity },
    { label: 'Workstation Locked', active: isLocked, icon: Lock, alertType: true } // Red if true
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex flex-col p-4 gap-4"
    >
      <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
        <Server className="w-4 h-4 text-[#14B8A6]" />
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">System Metrics</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metrics.map((metric, i) => {
          const color = metric.active 
            ? metric.alertType ? 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30' : 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30'
            : 'text-slate-500 bg-slate-900/50 border-slate-800'
          
          return (
            <div key={i} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-colors ${color}`}>
              <metric.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                {metric.label}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
