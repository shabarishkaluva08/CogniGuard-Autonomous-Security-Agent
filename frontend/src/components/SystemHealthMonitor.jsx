import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SystemHealthMonitor({ hardwareStatus }) {
  const systems = [
    { name: 'Camera', status: hardwareStatus.camera },
    { name: 'Afferens API', status: hardwareStatus.afferens },
    { name: 'MySQL DB', status: 'Connected' }, // Hardcoded for now until backend sends status
    { name: 'AntiGravity Agent', status: hardwareStatus.agent },
    { name: 'Backend Server', status: hardwareStatus.backend },
    { name: 'WebSocket', status: hardwareStatus.ws }
  ]

  const getStatusIcon = (status) => {
    if (status === 'Connected' || status === 'Running' || status === 'Online' || status === 'Active') {
      return <CheckCircle2 className="w-4 h-4 text-[#00d4aa]" />
    } else if (status === 'Waiting' || status === 'Reconnecting') {
      return <Clock className="w-4 h-4 text-amber-400" />
    }
    return <XCircle className="w-4 h-4 text-red-500" />
  }

  return (
    <div className="glass-card p-6 border-l-4 border-l-[#00d4aa]">
      <h2 className="text-[#00d4aa] text-sm font-semibold tracking-wider uppercase mb-4">
        System Health Monitor
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {systems.map((sys, idx) => (
          <motion.div 
            key={sys.name} 
            className="flex items-center justify-between bg-[#131b26] p-2 rounded border border-white/5"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <span className="text-xs text-gray-400">{sys.name}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono">{sys.status}</span>
              {getStatusIcon(sys.status)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
