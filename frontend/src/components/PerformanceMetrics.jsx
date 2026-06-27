import { Activity, Clock, Zap } from 'lucide-react'

export default function PerformanceMetrics({ presenceConfidence, absenceDuration }) {
  // Mock performance data for visual completeness, in a full app these would be tracked in state
  const metrics = [
    { label: 'Detection Latency', value: '142ms', icon: <Zap className="w-3 h-3" /> },
    { label: 'Reasoning Time', value: '89ms', icon: <Clock className="w-3 h-3" /> },
    { label: 'API Response Time', value: '201ms', icon: <Activity className="w-3 h-3" /> },
    { label: 'Avg Confidence', value: `${presenceConfidence || 92}%`, icon: <Activity className="w-3 h-3" /> },
    { label: 'False Positives', value: '0', icon: <Activity className="w-3 h-3" /> },
  ]

  return (
    <div className="glass-card p-6 border-l-4 border-l-purple-500">
      <h2 className="text-purple-400 text-sm font-semibold tracking-wider uppercase mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4" /> Performance Metrics
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-[#131b26] p-3 rounded border border-white/5 flex flex-col justify-between">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              {m.icon} {m.label}
            </div>
            <div className="text-lg font-mono text-gray-200">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
