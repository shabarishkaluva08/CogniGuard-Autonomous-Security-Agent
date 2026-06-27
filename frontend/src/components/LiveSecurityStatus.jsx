import { motion } from 'framer-motion'
import { Shield, ShieldAlert, UserX, Clock, Activity, Lock } from 'lucide-react'

export default function LiveSecurityStatus({ securityState, hasEnrolledUser, presenceConfidence }) {
  
  // State configurations
  const config = {
    NORMAL: { color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/30', label: 'Secure', icon: Shield, message: 'Workstation is secure. Authorized user present.' },
    MONITORING: { color: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10', border: 'border-[#14B8A6]/30', label: 'Monitoring', icon: Activity, message: 'Verifying user identity and liveness.' },
    WARNING: { color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30', label: 'No User Present', icon: UserX, message: 'Absence detected. Preparing to lock.' },
    LOCKED: { color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30', label: 'Locked', icon: Lock, message: 'Workstation secured due to absence.' },
    AUTHORIZED_USER_VERIFIED: { color: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10', border: 'border-[#14B8A6]/30', label: 'Secure', icon: Shield, message: 'User verified. Restoring access.' },
    INTRUDER_DETECTED: { color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/30', label: 'Unauthorized Person', icon: ShieldAlert, message: 'Intruder detected. Workstation locked immediately.' },
    Idle: { color: 'text-slate-400', bg: 'bg-slate-800/40', border: 'border-slate-700/50', label: 'Idle', icon: Shield, message: 'System waiting for camera feed.' }
  }

  const current = config[securityState] || config.Idle
  const Icon = current.icon

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex flex-col h-full relative overflow-hidden p-6 border-slate-700/40 shadow-lg"
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${current.bg.replace('/10', '')}`} />
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Live Security Status</h2>
          <div className="flex items-center gap-3 mt-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${current.bg} border ${current.border}`}>
              <Icon className={`w-6 h-6 ${current.color}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-black tracking-tight ${current.color}`}>{current.label}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0B1220] rounded-xl p-4 border border-slate-800/60 mb-6">
        <p className="text-sm text-slate-300 font-medium">{current.message}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/40">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Current User</span>
          <span className="text-sm font-bold text-slate-200 truncate block">
            {securityState === 'INTRUDER_DETECTED' ? 'Unknown' : hasEnrolledUser ? 'Authorized Employee' : 'Not Enrolled'}
          </span>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/40">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Confidence</span>
          <span className="text-sm font-bold text-slate-200">
            {presenceConfidence !== null ? `${presenceConfidence}%` : 'N/A'}
          </span>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/40">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Liveness</span>
          <span className="text-sm font-bold text-[#22C55E]">Verified</span>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/40">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Workstation</span>
          <span className={`text-sm font-bold ${['LOCKED', 'INTRUDER_DETECTED'].includes(securityState) ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
            {['LOCKED', 'INTRUDER_DETECTED'].includes(securityState) ? 'Locked' : 'Active'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
