import { motion } from 'framer-motion'
import { Users, AlertTriangle, Lock, Clock } from 'lucide-react'

export default function StatisticsCards({ events, absenceDuration }) {
  // Mock derived stats based on events/state
  const locks = events.filter(e => e.type === 'danger' && e.message?.includes('LOCKED')).length
  const alerts = events.filter(e => e.type === 'danger' || e.type === 'warning').length
  
  const stats = [
    { label: "Today's Alerts", value: alerts.toString(), icon: AlertTriangle, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
    { label: "Workstation Locks", value: locks.toString(), icon: Lock, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' },
    { label: "Avg Accuracy", value: "98.4%", icon: Users, color: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10' },
    { label: "Current Session", value: `${Math.floor(absenceDuration / 60)}m ${absenceDuration % 60}s`, icon: Clock, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' }
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card p-4 flex flex-col gap-3"
        >
          <div className="flex justify-between items-start">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-200 tracking-tight">{stat.value}</h4>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
