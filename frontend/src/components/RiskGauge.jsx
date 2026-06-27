import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function RiskGauge({ riskScore, securityState }) {
  const score = riskScore !== null ? riskScore : 0
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    setAnimatedScore(score)
  }, [score])

  // Determine Level
  let level = 'SECURE'
  let color = '#22C55E'
  let colorClass = 'text-[#22C55E]'
  
  if (score > 75) {
    level = 'CRITICAL'
    color = '#EF4444'
    colorClass = 'text-[#EF4444]'
  } else if (score > 50) {
    level = 'WARNING'
    color = '#F59E0B'
    colorClass = 'text-[#F59E0B]'
  } else if (score > 25) {
    level = 'ELEVATED'
    color = '#14B8A6'
    colorClass = 'text-[#14B8A6]'
  }

  // SVG Gauge Calculations
  const radius = 60
  const circumference = Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex flex-col items-center justify-center p-6 text-center h-full"
    >
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#14B8A6]" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Risk Level</h3>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center w-full max-w-[200px] aspect-[2/1] overflow-hidden">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 140 70">
          <path
            d="M 10 70 A 60 60 0 0 1 130 70"
            fill="none"
            stroke="#1E293B"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <motion.path
            d="M 10 70 A 60 60 0 0 1 130 70"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        
        <div className="absolute bottom-0 flex flex-col items-center w-full">
          <span className={`text-3xl font-black tracking-tighter ${colorClass}`}>
            {score}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${colorClass}`}>
            {level}
          </span>
        </div>
      </div>
      
      <div className="w-full flex justify-between mt-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
        <span>0</span>
        <span>100</span>
      </div>
    </motion.div>
  )
}
