import { motion } from 'framer-motion'
import { Clock, ShieldCheck, ShieldAlert, UserX, AlertTriangle, Lock } from 'lucide-react'

export default function EventTimeline({ events }) {
  // Get latest 5 events for horizontal timeline
  const recentEvents = [...events].slice(0, 5)

  const getEventConfig = (event) => {
    if (event.message?.includes('LOCKED')) return { icon: Lock, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]' }
    if (event.type === 'danger') return { icon: ShieldAlert, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]' }
    if (event.type === 'warning') return { icon: UserX, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]' }
    if (event.type === 'success') return { icon: ShieldCheck, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]' }
    return { icon: AlertTriangle, color: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10', border: 'border-[#14B8A6]' }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex flex-col p-6 w-full"
    >
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-4 h-4 text-[#14B8A6]" />
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Activity Timeline</h3>
      </div>

      {recentEvents.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-slate-500 text-sm">
          Awaiting security events...
        </div>
      ) : (
        <div className="relative flex items-center justify-between w-full mt-2 mb-4 px-4">
          <div className="absolute left-8 right-8 h-px bg-slate-800/80 top-1/2 -translate-y-1/2 z-0" />
          
          {recentEvents.reverse().map((event, i) => {
            const config = getEventConfig(event)
            const Icon = config.icon
            
            return (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 flex flex-col items-center gap-3 w-40 text-center"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg} border-2 ${config.border} shadow-lg bg-[#0B1220]`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{event.message}</h4>
                  <span className="text-[10px] font-semibold text-slate-500">{event.timestamp}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
