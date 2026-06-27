import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ShieldAlert, CheckCircle, Info, AlertTriangle } from 'lucide-react'

export default function NotificationsFeed({ notifications }) {
  const [activeToasts, setActiveToasts] = useState([])

  // Watch for new notifications and trigger toasts
  useEffect(() => {
    if (notifications.length > 0) {
      const newest = notifications[0]
      
      // Avoid duplicate toasts if already added
      setActiveToasts((prev) => {
        if (prev.some((t) => t.id === newest.id)) return prev
        
        // Add toast and set auto-removal
        const newToast = { ...newest, key: newest.id }
        setTimeout(() => {
          setActiveToasts((current) => current.filter((t) => t.id !== newToast.id))
        }, 4000)
        
        return [newToast, ...prev].slice(0, 3) // max 3 simultaneous toasts
      })
    }
  }, [notifications])

  const borderColors = {
    info: 'border-[#00d4aa]/40 bg-cyan-950/20 text-[#00d4aa]',
    success: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
    warning: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
    danger: 'border-rose-500/40 bg-rose-950/20 text-rose-400',
  }

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    danger: ShieldAlert,
  }

  return (
    <>
      {/* Toast Overlay Container in Top Right of Window */}
      <div className="fixed top-20 right-6 z-[100] flex flex-col gap-2 pointer-events-none w-80">
        <AnimatePresence>
          {activeToasts.map((toast) => {
            const Icon = icons[toast.type] || Info
            return (
              <motion.div
                key={toast.key}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.95 }}
                className={`pointer-events-auto flex gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl ${borderColors[toast.type] || 'border-slate-800 bg-slate-900 text-slate-200'}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-bold leading-tight">{toast.message}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1">{toast.timestamp}</div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Feed Panel Card in Bottom Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        whileHover={{ y: -1, transition: { duration: 0.2 } }}
        className="glass-card flex-1 min-w-[280px]"
      >
        <div className="card-header flex items-center gap-2 border-b border-slate-800/60 pb-3">
          <Bell className="w-4 h-4 text-[var(--accent-cyan)]" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Notifications</h3>
        </div>

        <div className="h-[180px] overflow-y-auto pr-1 flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {notifications.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-10">
                No notifications logged.
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => {
                const Icon = icons[n.type] || Info
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -10, y: 5 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 10, y: 5 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-xs leading-normal shadow-sm ${
                      n.type === 'danger'
                        ? 'bg-rose-500/[0.04] border-rose-500/35 text-rose-300 shadow-rose-500/5'
                        : n.type === 'warning'
                          ? 'bg-amber-500/[0.04] border-amber-500/35 text-amber-300 shadow-amber-500/5'
                          : n.type === 'success'
                            ? 'bg-emerald-500/[0.04] border-emerald-500/35 text-emerald-300 shadow-emerald-500/5'
                            : 'bg-cyan-950/20 border-[#00d4aa]/30 text-slate-200 shadow-[#00d4aa]/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{n.message}</div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">{n.timestamp}</div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}
