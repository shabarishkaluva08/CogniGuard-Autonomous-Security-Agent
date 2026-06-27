import { motion, AnimatePresence } from 'framer-motion'
import { Database } from 'lucide-react'

export default function WorkingMemory({ workingMemory }) {
  const entries = Object.entries(workingMemory)

  const getValueColor = (key, value) => {
    if (key === 'presenceStatus') return value === 'Present' ? 'text-emerald-400' : 'text-rose-400'
    if (key === 'securityState') {
      const map = {
        NORMAL: 'text-emerald-400',
        MONITORING: 'text-[#00d4aa]',
        WARNING: 'text-amber-500',
        LOCKED: 'text-rose-400',
        AUTHORIZED_USER_VERIFIED: 'text-indigo-400',
        INTRUDER_DETECTED: 'text-red-500 font-bold',
      }
      return map[value] || 'text-slate-100'
    }
    if (key === 'bufferConsistency') {
      return value === 'CONSISTENT' ? 'text-emerald-400' : value === 'PARTIAL' ? 'text-amber-400' : 'text-rose-400'
    }
    return 'text-slate-200'
  }

  const keyLabels = {
    currentFrame: 'Current Frame',
    presenceStatus: 'Presence Status',
    confidence: 'Confidence Score',
    securityState: 'Security State',
    riskScore: 'Environmental Risk',
    selectedTool: 'Active Tool',
    bufferConsistency: 'Buffer Consistency',
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      whileHover={{ y: -1, transition: { duration: 0.2 } }}
      className="glass-card flex flex-col gap-4"
    >
      <div className="card-header flex items-center gap-2 border-b border-slate-800/60 pb-3">
        <Database className="w-4 h-4 text-[#00d4aa]" />
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agent Working Memory</h3>
      </div>

      <div className="flex flex-col">
        {entries.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-4">
            Initializing memory state...
          </div>
        ) : (
          entries.map(([key, value]) => (
            <div 
              className="flex justify-between items-center py-3 border-b border-slate-900/60 last:border-b-0" 
              key={key}
            >
              <span className="text-xs font-medium text-slate-500">{keyLabels[key] || key}</span>
              
              {/* Animated value switch */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={value}
                  initial={{ opacity: 0, x: 5, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -5, filter: 'blur(2px)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className={`text-xs font-bold font-mono tracking-tight ${getValueColor(key, value)}`}
                >
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </motion.span>
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}
