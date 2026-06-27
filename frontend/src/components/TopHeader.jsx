import { useState, useEffect } from 'react'
import { Clock, Bell, User, CheckCircle2 } from 'lucide-react'

export default function TopHeader({ hardwareStatus, onOpenProfile }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour12: true,
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

  const isAgentActive = hardwareStatus.agent === 'Running' || hardwareStatus.agent === 'Connected'
  const isCameraActive = hardwareStatus.camera === 'Connected'

  return (
    <header className="h-[70px] bg-[#0B1220] border-b border-slate-800/40 flex items-center justify-between px-6 shrink-0 z-50">
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Agent Status</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${isAgentActive ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
            {isAgentActive && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
            {isAgentActive ? 'ACTIVE' : 'OFFLINE'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 border-l border-slate-800/60 pl-6">
          <CheckCircle2 className="w-4 h-4 text-slate-500" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Camera</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isCameraActive ? 'bg-[#14B8A6]/10 text-[#14B8A6]' : 'bg-slate-800/50 text-slate-400'}`}>
            {isCameraActive ? 'CONNECTED' : 'WAITING'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right flex flex-col">
          <span className="text-sm font-bold text-slate-200 tabular-nums">{formattedTime}</span>
          <span className="text-[10px] text-slate-500 font-medium">{formattedDate}</span>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-800/60 pl-6">
          <button className="relative w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors bg-[#131C2E] rounded-full border border-slate-800/40">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-[#131C2E]" />
          </button>
          
          <button onClick={onOpenProfile} className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center text-sm font-bold shadow-sm shadow-emerald-500/10 hover:bg-emerald-500/30 transition-colors">
            AD
          </button>
        </div>
      </div>
    </header>
  )
}
