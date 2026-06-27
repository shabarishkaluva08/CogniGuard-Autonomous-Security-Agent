import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit, PlayCircle, Hammer, Info } from 'lucide-react'

// Monospace terminal text typing animation with blinking cursor
function TerminalTypewriter({ text }) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    let index = 0
    let timer
    
    setDisplayText('')

    const type = () => {
      if (index < text.length) {
        setDisplayText((prev) => prev + text.charAt(index))
        index++
        timer = setTimeout(type, 15)
      }
    }

    type()
    return () => clearTimeout(timer)
  }, [text])

  return (
    <span className="font-mono text-[11px] leading-relaxed text-[#00d4aa]">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'steps(2)' }}
        className="inline-block w-1.5 h-3 bg-[#00d4aa] align-middle ml-1 shadow-[0_0_4px_rgba(0,212,170,0.6)]"
      />
    </span>
  )
}

export default function ReasoningPanel({ reasoning, lastDecision, lastReason, selectedTool, securityState, presenceConfidence, riskScore }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      whileHover={{ y: -1, transition: { duration: 0.2 } }}
      className="glass-card flex flex-col gap-4"
    >
      <div className="card-header flex items-center gap-2 border-b border-slate-800/60 pb-3">
        <BrainCircuit className="w-4 h-4 text-[var(--accent-cyan)]" />
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Explainable AI Reasoning</h3>
      </div>

      {/* Decision Summary */}
      <div className="flex flex-col gap-3">
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-900/60">
          <div className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mb-1.5 flex items-center gap-1">
            <PlayCircle className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            Last Decided Action
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={lastDecision}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="text-xs font-bold text-slate-100"
            >
              {lastDecision}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-900/60">
          <div className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mb-1.5 flex items-center gap-1">
            <Hammer className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            Selected System Tool
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-cyan-950/40 border border-[#00d4aa]/30 text-[#00d4aa] rounded text-[10px] font-bold font-mono">
            🔧 {selectedTool}
          </span>
        </div>

        {/* Structured Decision Record Table */}
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-900/60">
          <div className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mb-1.5 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            Structured Decision Record
          </div>
          <table className="w-full text-[11px]">
            <tbody>
              <tr className="border-b border-slate-900/40">
                <td className="py-2 text-slate-500 font-semibold">Security State</td>
                <td className="py-2 text-right text-slate-300 font-bold font-mono">{securityState}</td>
              </tr>
              <tr className="border-b border-slate-900/40">
                <td className="py-2 text-slate-500 font-semibold">Perception Confidence</td>
                <td className="py-2 text-right text-slate-300 font-bold font-mono">
                  {presenceConfidence !== null ? `${presenceConfidence}%` : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500 font-semibold">Environmental Risk</td>
                <td className="py-2 text-right text-slate-300 font-bold font-mono">
                  {riskScore !== null ? `${riskScore} / 100` : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Monospace Terminal Box with Blinking Cursor */}
        <div className="flex flex-col gap-1.5 mt-1">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
            AI Explanatory Reasoning
          </span>
          <div className="min-h-[80px] p-3 rounded-lg bg-black border border-slate-900/80 shadow-inner flex items-start gap-1">
            <TerminalTypewriter text={reasoning} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
