import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Loader2, GitCommit } from 'lucide-react'

export default function DecisionPipeline({ pipelineSteps, activeStep, pipelineStepStatus, securityState }) {
  const isIdle = securityState === 'Idle' || securityState === 'NO_USER_REGISTERED'

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex flex-col h-full overflow-hidden"
    >
      <div className="card-header flex items-center justify-between p-4 border-b border-slate-800/40 bg-[#0B1220]/50">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Decision Pipeline</h3>
        {!isIdle && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#14B8A6]/10 rounded border border-[#14B8A6]/20 text-[#14B8A6] text-[9px] font-bold">
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-ping" />
            PROCESSING
          </span>
        )}
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center relative">
        <div className="absolute left-[39px] top-8 bottom-8 w-px bg-slate-800" />
        
        <div className="flex flex-col gap-6 relative">
          {pipelineSteps.map((step, index) => {
            const status = isIdle ? 'waiting' : (pipelineStepStatus[step.id] || 'waiting')
            const isCompleted = status === 'completed'
            const isRunning = status === 'running'
            const isFuture = status === 'waiting' && !isRunning

            let iconColor = 'text-slate-600'
            let textColor = 'text-slate-500'
            let bgClass = 'bg-[#0B1220]'
            
            if (isCompleted) {
              iconColor = 'text-[#22C55E]'
              textColor = 'text-slate-300'
            } else if (isRunning) {
              iconColor = 'text-[#14B8A6]'
              textColor = 'text-[#14B8A6]'
              bgClass = 'bg-[#14B8A6]/10 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
            }

            return (
              <div key={step.id} className={`flex items-center gap-4 transition-opacity duration-300 ${isFuture ? 'opacity-40' : 'opacity-100'}`}>
                <div className="relative z-10 w-8 h-8 flex items-center justify-center shrink-0">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-[#22C55E]/20 flex items-center justify-center border border-[#22C55E]/30">
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                    </div>
                  ) : isRunning ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-[#14B8A6]/50 ${bgClass}`}>
                      <div className="w-3 h-3 bg-[#14B8A6] rounded-full animate-ping" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-700 bg-[#0B1220]" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className={`text-sm font-bold ${textColor} transition-colors duration-300`}>
                    {step.label}
                  </h4>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
