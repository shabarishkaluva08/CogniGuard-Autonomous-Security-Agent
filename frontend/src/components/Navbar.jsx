import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Clock, ToggleLeft, ToggleRight, Camera, Cpu, PlayCircle, Database, HelpCircle, User } from 'lucide-react'

function StatusChip({ icon: Icon, label, status }) {
  const statusStyles = {
    Connected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Running: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Waiting: 'bg-slate-800/40 text-slate-400 border-slate-800/60',
    Disconnected: 'bg-slate-800/40 text-slate-400 border-slate-800/60',
    Error: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  }
  
  const currentStyle = statusStyles[status] || statusStyles.Disconnected

  return (
    <motion.div 
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all duration-300 cursor-default ${currentStyle}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </motion.div>
  )
}

export default function Navbar({ securityState, demoMode, setDemoMode, hardwareStatus, hasEnrolledUser, onOpenProfile }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  // Status badges
  const stateConfigs = {
    Idle: { icon: HelpCircle, label: 'Idle', color: 'text-slate-500 bg-slate-900 border-slate-800' },
    NORMAL: { icon: Shield, label: 'Normal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    MONITORING: { icon: Shield, label: 'Monitoring', color: 'text-[var(--accent-cyan)] bg-[var(--accent-cyan-dim)] border-[var(--accent-cyan-glow)]' },
    WARNING: { icon: Shield, label: 'Warning', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    LOCKED: { icon: Shield, label: 'Locked', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    AUTHORIZED_USER_VERIFIED: { icon: Shield, label: 'Verified', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
    INTRUDER_DETECTED: { icon: Shield, label: 'Intruder', color: 'text-red-400 bg-red-500/20 border-red-500/50 animate-pulse' },
  }

  const config = stateConfigs[securityState] || stateConfigs.Idle
  const IconComponent = config.icon

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="navbar flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-slate-900/70 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-50 gap-4"
    >
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00d4aa] flex items-center justify-center shadow-lg shadow-[#00d4aa]/20">
          <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-md font-bold text-slate-100 tracking-tight leading-none">CogniGuard AI</h1>
          <span className="text-[10px] text-slate-500 font-medium tracking-wide">Intelligent Workstation Security Agent</span>
        </div>
      </div>

      {/* Hardware Status Indicators as Chips */}
      <div className="flex flex-wrap items-center justify-center gap-3 bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-800/40">
        <StatusChip icon={Camera} label="CAM" status={hardwareStatus.camera} />
        <StatusChip icon={Cpu} label="VISION" status={hardwareStatus.afferens} />
        <StatusChip icon={PlayCircle} label="AGENT" status={hardwareStatus.agent} />
        <StatusChip icon={Database} label="LOG DB" status={hardwareStatus.firebase} />
      </div>

      <div className="flex items-center gap-6">
        {/* State Badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={securityState}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-wider uppercase ${config.color}`}
          >
            <motion.span 
              animate={['NORMAL', 'MONITORING'].includes(securityState) ? { scale: [1, 1.25, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1.5 h-1.5 rounded-full bg-current"
            />
            <IconComponent className="w-3.5 h-3.5" />
            {config.label}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-4">
          {/* Clock */}
          <div className="text-right border-r border-slate-800/80 pr-4 hidden sm:block">
            <div className="text-sm font-semibold text-slate-200 tabular-nums flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formattedTime}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{formattedDate}</div>
          </div>

          {/* Demo Mode Toggle */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              demoMode 
                ? 'bg-[#00d4aa]/15 border-[#00d4aa]/40 text-[#00d4aa] shadow-md shadow-[#00d4aa]/5' 
                : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            {demoMode ? (
              <>
                <ToggleRight className="w-4 h-4 text-[#00d4aa] fill-[#00d4aa]/20" />
                Demo ON
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4" />
                Demo OFF
              </>
            )}
          </button>

          {/* User Profile Button */}
          <button 
            onClick={onOpenProfile}
            className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-300 ${
              hasEnrolledUser 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
            title="Authorized User Profile"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
