import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Search, Filter, ShieldAlert, ShieldCheck, AlertTriangle, UserX } from 'lucide-react'

export default function SecurityLogs({ events }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEvents = events.filter(e => 
    (e.message || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getEventStyle = (type) => {
    switch(type) {
      case 'danger': return { icon: ShieldAlert, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' }
      case 'warning': return { icon: UserX, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' }
      case 'success': return { icon: ShieldCheck, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' }
      default: return { icon: AlertTriangle, color: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10' }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex-1 min-w-[280px] flex flex-col h-full"
    >
      <div className="card-header flex items-center justify-between border-b border-slate-800/60 p-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#14B8A6]" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Recent Security Events</h3>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-md py-1 pl-8 pr-3 text-[10px] text-slate-200 focus:outline-none focus:border-[#14B8A6]/50 w-40"
            />
          </div>
          <button className="bg-slate-900 border border-slate-800 rounded-md p-1 hover:bg-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[300px]">
        {filteredEvents.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-10">
            No events found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="sticky top-0 bg-[#0B1220]/90 backdrop-blur border-b border-slate-800/60 z-10">
              <tr>
                <th className="py-2.5 px-4 font-bold text-slate-500 uppercase tracking-wider">Severity</th>
                <th className="py-2.5 px-4 font-bold text-slate-500 uppercase tracking-wider">Time</th>
                <th className="py-2.5 px-4 font-bold text-slate-500 uppercase tracking-wider">Event Details</th>
                <th className="py-2.5 px-4 font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Employee</th>
                <th className="py-2.5 px-4 font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filteredEvents.slice(0, 15).map((event) => {
                  const style = getEventStyle(event.type)
                  const Icon = style.icon
                  // Mock employee logic for UI requirement
                  const employee = event.type === 'danger' ? 'Unknown' : 'Authorized'
                  const status = event.type === 'danger' ? 'LOCKED' : event.type === 'warning' ? 'ALERT' : 'SECURE'

                  return (
                    <motion.tr 
                      key={event.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-b border-slate-800/30 last:border-0 hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${style.bg} ${style.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[10px] whitespace-nowrap">{event.timestamp}</td>
                      <td className="py-3 px-4 text-slate-200 font-medium">{event.message}</td>
                      <td className="py-3 px-4 text-slate-400 hidden md:table-cell">{employee}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${style.color} ${style.bg}`}>
                          {status}
                        </span>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  )
}
