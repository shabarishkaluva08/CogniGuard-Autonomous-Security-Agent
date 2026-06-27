import { motion } from 'framer-motion'
import { LayoutDashboard, Video, Cpu, Calendar, Bell, Users, FileText, Settings, Server, Shield } from 'lucide-react'

export default function Sidebar({ securityState }) {
  const isProtected = ['NORMAL', 'MONITORING', 'WARNING'].includes(securityState)

  return (
    <aside className="w-[260px] bg-[#0B1220] border-r border-slate-800/40 flex flex-col h-full shrink-0">
      <div className="flex items-center gap-3 p-6 border-b border-slate-800/40">
        <div className="w-9 h-9 rounded-xl bg-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#14B8A6]/20">
          <Shield className="w-5 h-5 text-[#0B1220] stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-none">CogniGuard AI</h1>
          <span className="text-[9px] text-slate-500 font-medium tracking-wide">Workstation Security</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <NavItem icon={LayoutDashboard} label="Dashboard" active />
        <NavItem icon={Video} label="Live Monitor" />
        <NavItem icon={Cpu} label="AI Analysis" />
        <NavItem icon={Calendar} label="Events" />
        <NavItem icon={Bell} label="Alerts" badge="3" />
        <NavItem icon={Users} label="Employees" />
        <NavItem icon={FileText} label="Reports" />
        <div className="pt-6 mt-6 border-t border-slate-800/40 space-y-2">
          <NavItem icon={Settings} label="Settings" />
          <NavItem icon={Server} label="System" />
        </div>
      </nav>

      <div className="p-4 m-4 rounded-xl border border-slate-800/50 bg-[#131C2E] flex flex-col items-center justify-center py-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#14B8A6]/5 to-transparent pointer-events-none" />
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isProtected ? 'bg-[#22C55E]/10' : 'bg-[#EF4444]/10'}`}>
          <Shield className={`w-6 h-6 ${isProtected ? 'text-[#22C55E]' : 'text-[#EF4444]'}`} />
        </div>
        <h4 className="text-sm font-bold text-slate-200">System {isProtected ? 'Protected' : 'Alert'}</h4>
        <p className="text-[10px] text-slate-500 text-center mt-1">All security systems<br/>operational</p>
      </div>
    </aside>
  )
}

function NavItem({ icon: Icon, label, active, badge }) {
  return (
    <button className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${active ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-l-4 border-[#14B8A6]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-4 border-transparent'}`}>
      <div className="flex items-center gap-4">
        <Icon className="w-5 h-5" />
        {label}
      </div>
      {badge && (
        <span className="bg-[#EF4444] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
          {badge}
        </span>
      )}
    </button>
  )
}
