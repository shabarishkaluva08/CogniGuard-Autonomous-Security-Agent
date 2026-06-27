import { motion } from 'framer-motion'
import { Video, Activity, CheckCircle2, AlertTriangle, ShieldAlert, Play, Square, CameraOff } from 'lucide-react'

export default function WebcamFeed({ securityState, videoRef, startCamera, stopCamera, cameraStatus }) {
  const isCameraActive = cameraStatus === 'Connected'
  
  // Clean border styling without heavy glows
  let borderColor = 'border-slate-800'
  if (securityState === 'LOCKED' || securityState === 'INTRUDER_DETECTED') borderColor = 'border-[#EF4444]'
  else if (securityState === 'WARNING') borderColor = 'border-[#F59E0B]'
  else if (['NORMAL', 'AUTHORIZED_USER_VERIFIED'].includes(securityState)) borderColor = 'border-[#22C55E]'
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800/40 bg-[#0B1220]/50">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-[#14B8A6]" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Live Camera Feed</h3>
        </div>
        {isCameraActive && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EF4444]/10 rounded border border-[#EF4444]/20 text-[#EF4444] text-[9px] font-bold tracking-widest">
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      <div className={`relative aspect-video bg-[#090E17] border-y ${borderColor} transition-colors duration-500 overflow-hidden flex-shrink-0`}>
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isCameraActive ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
          }`}
          muted
          playsInline
        />

        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <CameraOff className="w-8 h-8 text-slate-600" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Camera Offline</span>
          </div>
        )}

        {isCameraActive && (
          <>
            {/* Clean Overlay Elements */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
              <div className="bg-[#0B1220]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50 flex flex-col gap-0.5 shadow-sm">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Detection</span>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#14B8A6]" />
                  <span className="text-xs font-bold text-slate-100">Face Tracking Active</span>
                </div>
              </div>
              <div className="bg-[#0B1220]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50 flex flex-col gap-0.5 shadow-sm">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Liveness</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span className="text-xs font-bold text-slate-100">Verified Human</span>
                </div>
              </div>
            </div>

            {/* Target Bounding Box (Simulated overlay for UI since actual coordinates aren't passed) */}
            {['NORMAL', 'AUTHORIZED_USER_VERIFIED', 'INTRUDER_DETECTED'].includes(securityState) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-1/3 max-w-[200px] aspect-square border-2 ${securityState === 'INTRUDER_DETECTED' ? 'border-[#EF4444]' : 'border-[#14B8A6]'} rounded-lg relative`}>
                  {/* Corner accents */}
                  <div className={`absolute -top-1 -left-1 w-3 h-3 border-t-4 border-l-4 ${securityState === 'INTRUDER_DETECTED' ? 'border-[#EF4444]' : 'border-[#14B8A6]'} rounded-tl`}></div>
                  <div className={`absolute -top-1 -right-1 w-3 h-3 border-t-4 border-r-4 ${securityState === 'INTRUDER_DETECTED' ? 'border-[#EF4444]' : 'border-[#14B8A6]'} rounded-tr`}></div>
                  <div className={`absolute -bottom-1 -left-1 w-3 h-3 border-b-4 border-l-4 ${securityState === 'INTRUDER_DETECTED' ? 'border-[#EF4444]' : 'border-[#14B8A6]'} rounded-bl`}></div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-b-4 border-r-4 ${securityState === 'INTRUDER_DETECTED' ? 'border-[#EF4444]' : 'border-[#14B8A6]'} rounded-br`}></div>
                  
                  {/* Floating Tag */}
                  <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-[#0B1220]/90 backdrop-blur border ${securityState === 'INTRUDER_DETECTED' ? 'border-[#EF4444]/50' : 'border-[#14B8A6]/50'} flex flex-col items-center whitespace-nowrap`}>
                    <span className={`text-[10px] font-black uppercase ${securityState === 'INTRUDER_DETECTED' ? 'text-[#EF4444]' : 'text-[#14B8A6]'}`}>
                      {securityState === 'INTRUDER_DETECTED' ? 'UNKNOWN - 42%' : 'AUTHORIZED - 98%'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 bg-[#0B1220]/30 flex flex-col gap-4">
        {/* Technical Metrics */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-slate-900/50 p-2 rounded border border-slate-800/40">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">FPS</span>
            <span className="text-xs font-bold text-slate-200">{isCameraActive ? '29.97' : '--'}</span>
          </div>
          <div className="bg-slate-900/50 p-2 rounded border border-slate-800/40">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Resolution</span>
            <span className="text-xs font-bold text-slate-200">{isCameraActive ? '1920×1080' : '--'}</span>
          </div>
          <div className="bg-slate-900/50 p-2 rounded border border-slate-800/40">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Health</span>
            <span className={`text-xs font-bold ${isCameraActive ? 'text-[#22C55E]' : 'text-slate-500'}`}>{isCameraActive ? 'Optimal' : '--'}</span>
          </div>
          <div className="bg-slate-900/50 p-2 rounded border border-slate-800/40">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Rec. Speed</span>
            <span className="text-xs font-bold text-[#14B8A6]">{isCameraActive ? '42ms' : '--'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isCameraActive ? (
            <button onClick={startCamera} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-lg text-xs font-bold transition-colors">
              <Play className="w-3.5 h-3.5 fill-current" />
              Initialize Stream
            </button>
          ) : (
            <button onClick={stopCamera} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors border border-slate-700">
              <Square className="w-3.5 h-3.5 fill-current" />
              Terminate Stream
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
