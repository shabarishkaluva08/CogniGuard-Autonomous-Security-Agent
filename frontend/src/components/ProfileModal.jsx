import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, CheckCircle, Shield, User, Image as ImageIcon, Trash2, ArrowRight } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, onEnrollSuccess, requireEnrollment }) {
  const [activeTab, setActiveTab] = useState('webcam'); // 'webcam' or 'upload'
  const [step, setStep] = useState(1); // 1: Info & Setup, 2: Face Enrollment, 3: Processing, 4: Success
  const [formData, setFormData] = useState({ fullName: '', employeeId: '', email: '' });
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  
  // Images
  const [capturedImages, setCapturedImages] = useState([]);
  const MAX_IMAGES = 8; // Increased slightly for the 4-column grid layout nicely
  
  // Webcam state
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [captureInstruction, setCaptureInstruction] = useState('Look Forward');

  const INSTRUCTIONS = ['Look Forward', 'Turn Left', 'Turn Right', 'Look Up', 'Look Down', 'Smile', 'Neutral', 'Look Forward'];



  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      if (!requireEnrollment) {
        setStep(1);
        setCapturedImages([]);
        setFormData({ fullName: '', employeeId: '', email: '' });
        setEnrollError('');
      }
    } else if (!modelsLoaded) {
      const loadModels = async () => {
        const faceapi = window.faceapi;
        if (!faceapi) {
           setEnrollError("face-api not found globally. Check console.");
           return;
        }
        try {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models')
          ]);
          setModelsLoaded(true);
        } catch (e) {
          setEnrollError("Failed to load ML models: " + e.message);
        }
      };
      loadModels();
    }
  }, [isOpen, requireEnrollment, modelsLoaded]);


  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setActiveTab('webcam');
    } catch (err) {
      console.error('Failed to access webcam:', err);
      alert('Could not access webcam for enrollment. Please use file upload.');
      setActiveTab('upload');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleCapture = () => {
    if (!videoRef.current || capturedImages.length >= MAX_IMAGES) return;
    
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
       setEnrollError("Camera not ready yet. Please wait a moment.");
       return;
    }
    setEnrollError('');
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    setCapturedImages(prev => [...prev, dataUrl]);
    
    if (capturedImages.length + 1 < MAX_IMAGES) {
      setCaptureInstruction(INSTRUCTIONS[capturedImages.length + 1]);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setCapturedImages(prev => {
            if (prev.length < MAX_IMAGES) return [...prev, event.target.result];
            return prev;
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
    if (activeTab === 'webcam') {
      setCaptureInstruction(INSTRUCTIONS[Math.max(0, capturedImages.length - 1)]);
    }
  };

  const saveProfile = async () => {
    if (!modelsLoaded) {
      alert("ML Models are still loading, please wait a moment.");
      return;
    }
    setStep(3); // Processing
    setEnrollError('');
    stopCamera();

    try {
      const faceapi = window.faceapi;
      const descriptors = [];
      let totalConfidence = 0;

      // Extract Face Descriptors
      for (const base64 of capturedImages) {
        const img = new Image();
        img.src = base64;
        await new Promise(resolve => { img.onload = resolve; });
        
        const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
                                       .withFaceLandmarks()
                                       .withFaceDescriptor();
        
        if (detection) {
          descriptors.push(detection.descriptor);
          totalConfidence += detection.detection.score;
        }
      }

      if (descriptors.length === 0) {
        throw new Error("No faces detected in any of the provided images. Enrollment quality is insufficient. Please capture clearer images.");
      }

      // Average Descriptors
      const masterDescriptor = new Float32Array(128);
      for (let i = 0; i < 128; i++) {
        let sum = 0;
        for (const desc of descriptors) {
          sum += desc[i];
        }
        masterDescriptor[i] = sum / descriptors.length;
      }

      const qualityScore = (descriptors.length / capturedImages.length) * 100;
      const avgConfidence = totalConfidence / descriptors.length;

      const payload = {
        fullName: formData.fullName,
        employeeId: formData.employeeId,
        email: formData.email,
        profilePicture: capturedImages[0] || null,
        faces: capturedImages,
        descriptor: Array.from(masterDescriptor),
        metadata: {
          qualityScore,
          imagesUsed: descriptors.length,
          avgConfidence
        }
      };

      const res = await fetch('http://localhost:3001/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save profile on the server.');

      setStep(4); // Success
      setTimeout(() => {
        onEnrollSuccess();
        onClose();
        setStep(1);
        setCapturedImages([]);
        setEnrollError('');
      }, 2500);
    } catch (err) {
      console.error(err);
      setEnrollError(err.message || 'Error saving profile');
      setStep(2); // Back to Face Enrollment
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-[1300px] h-[800px] max-h-[90vh] bg-[#0F172A] border border-slate-700/50 rounded-2xl shadow-2xl shadow-slate-950/50 flex flex-col relative overflow-hidden"
      >
        
        {/* Content Area - 2 Columns */}
        <div className="flex flex-1 overflow-hidden h-full">
          
          {/* LEFT COLUMN (35%) */}
          <div className="w-[400px] flex-shrink-0 bg-[#0F172A] p-8 border-r border-slate-800/80 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-8">
              
              {/* Header */}
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#06B6D4]/10 flex items-center justify-center border border-[#06B6D4]/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] mb-6">
                  <Shield className="w-7 h-7 text-[#06B6D4]" />
                </div>
                <h1 className="text-[42px] leading-[1.1] font-bold text-slate-100 tracking-tight">
                  Identity Verification
                </h1>
                <p className="text-[16px] text-slate-400 leading-relaxed mt-2">
                  Establish your secure biometric profile to authorize workstation access.
                </p>
              </div>

              {requireEnrollment && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-400 text-[15px] flex items-start gap-3">
                  <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>No authorized user is registered. Complete enrollment before monitoring begins.</p>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-6 pt-4 relative">
                <div className="space-y-2">
                  <label className="block text-[15px] font-semibold text-slate-300">Full Name *</label>
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    placeholder="E.g. Jane Doe" 
                    className="w-full h-[52px] bg-[#111827] border border-slate-700 rounded-xl px-4 text-[16px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]/50 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[15px] font-semibold text-slate-300">Employee ID</label>
                  <input 
                    type="text" 
                    value={formData.employeeId}
                    onChange={e => setFormData({...formData, employeeId: e.target.value})}
                    placeholder="E.g. EMP-12345 (Optional)" 
                    className="w-full h-[52px] bg-[#111827] border border-slate-700 rounded-xl px-4 text-[16px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (65%) */}
          <div className="flex-1 bg-[#0B1120] relative flex flex-col p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              
              {/* STEP 1 & 2: Face Enrollment UI */}
              {(step === 1 || step === 2) && (
                <motion.div 
                  key="enrollment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full w-full max-w-4xl mx-auto"
                >
                  <div className="mb-6">
                    <h2 className="text-[28px] font-bold text-slate-100">Face References</h2>
                    <p className="text-[16px] text-slate-400 mt-1">Provide multiple angles for higher accuracy.</p>
                  </div>

                  {enrollError && (
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 text-[15px] flex items-start gap-3 mb-6">
                      <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p>{enrollError}</p>
                    </div>
                  )}

                  {/* Enrollment Methods (Cards) */}
                  <div className="flex gap-6 mb-8">
                    <button 
                      onClick={() => startCamera()}
                      className={`flex-1 h-[140px] rounded-2xl p-6 border flex items-center gap-5 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-[#06B6D4]/5 ${
                        activeTab === 'webcam' 
                          ? 'bg-[#111827] border-[#06B6D4]/50 ring-1 ring-[#06B6D4]/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]' 
                          : 'bg-[#111827]/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                        activeTab === 'webcam' ? 'bg-[#06B6D4]/10 text-[#06B6D4]' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                      }`}>
                        <Camera className="w-7 h-7" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className={`text-lg font-bold ${activeTab === 'webcam' ? 'text-slate-100' : 'text-slate-300'}`}>Capture with Camera</h3>
                        <p className="text-[15px] text-slate-500 mt-0.5">Use your webcam to scan</p>
                      </div>
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                        activeTab === 'webcam' ? 'border-[#06B6D4] text-[#06B6D4]' : 'border-transparent text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1'
                      }`}>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>

                    <button 
                      onClick={() => { setActiveTab('upload'); stopCamera(); }}
                      className={`flex-1 h-[140px] rounded-2xl p-6 border flex items-center gap-5 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/50 ${
                        activeTab === 'upload' 
                          ? 'bg-[#111827] border-slate-600 ring-1 ring-slate-500/20 shadow-[0_0_30px_rgba(100,116,139,0.1)]' 
                          : 'bg-[#111827]/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                        activeTab === 'upload' ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                      }`}>
                        <Upload className="w-7 h-7" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className={`text-lg font-bold ${activeTab === 'upload' ? 'text-slate-100' : 'text-slate-300'}`}>Import from Album</h3>
                        <p className="text-[15px] text-slate-500 mt-0.5">Upload local image files</p>
                      </div>
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                        activeTab === 'upload' ? 'border-slate-500 text-slate-400' : 'border-transparent text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1'
                      }`}>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  </div>

                  {/* Active Capture / Upload Area */}
                  <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 flex flex-col h-[320px]">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[16px] font-bold text-slate-300">
                        {activeTab === 'webcam' ? 'Live Camera Feed' : 'Uploaded Images'}
                      </h3>
                      <span className="text-[15px] font-bold text-[#06B6D4] bg-[#06B6D4]/10 px-3 py-1 rounded-full">
                        {capturedImages.length} / {MAX_IMAGES} Collected
                      </span>
                    </div>

                    {activeTab === 'webcam' && (
                      <div className="flex-1 flex gap-6">
                        {/* Camera Frame */}
                        <div className="w-[300px] h-full bg-[#0F172A] rounded-xl border border-slate-700 overflow-hidden relative flex-shrink-0 flex items-center justify-center group">
                          <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover transition-opacity ${cameraActive ? 'opacity-100' : 'opacity-0'}`} muted playsInline />
                          
                          {!cameraActive && (
                            <div className="flex flex-col items-center justify-center text-slate-500">
                              <Camera className="w-12 h-12 mb-3 opacity-50" />
                              <span className="text-[14px] font-medium text-slate-400">Camera Offline</span>
                            </div>
                          )}
                          
                          {cameraActive && capturedImages.length < MAX_IMAGES && (
                            <>
                              <div className="absolute inset-0 border-2 border-dashed border-[#06B6D4]/30 rounded-xl m-4 pointer-events-none transition-all"></div>
                              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700 shadow-lg text-[14px] font-bold text-white z-10 animate-pulse whitespace-nowrap">
                                {captureInstruction}
                              </div>
                            </>
                          )}
                          {cameraActive && capturedImages.length < MAX_IMAGES && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] z-20">
                              <button onClick={handleCapture} className="w-full bg-[#06B6D4] hover:bg-[#00ebd0] text-slate-950 font-black px-6 py-4 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] text-[16px] uppercase tracking-wider flex items-center justify-center gap-2 border border-[#06B6D4]/50">
                                <Camera className="w-5 h-5" /> Capture Now
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Webcam Captured Gallery */}
                        <div className="flex-1 overflow-y-auto pr-2">
                           {capturedImages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                              <Camera className="w-10 h-10 mb-3 opacity-50" />
                              <p className="text-[15px] font-medium">No images captured yet</p>
                            </div>
                           ) : (
                             <div className="grid grid-cols-3 gap-4 auto-rows-[100px]">
                               {capturedImages.map((img, i) => (
                                 <div key={i} className="bg-[#0F172A] rounded-xl border border-slate-700 overflow-hidden relative group">
                                    <img src={img} alt={`Ref ${i}`} className="w-full h-full object-cover" />
                                    <button onClick={() => removeImage(i)} className="absolute inset-0 bg-rose-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                      <Trash2 className="w-6 h-6 text-white" />
                                    </button>
                                 </div>
                               ))}
                             </div>
                           )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'upload' && (
                      <div className="flex-1 overflow-y-auto">
                        {capturedImages.length === 0 ? (
                          <label className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl bg-[#0F172A] hover:bg-slate-800/50 hover:border-slate-600 transition-all cursor-pointer">
                            <Upload className="w-12 h-12 mb-4 text-slate-400" />
                            <p className="text-[16px] font-bold text-slate-300">Click or drag images to upload</p>
                            <p className="text-[14px] mt-1">Supports JPG, PNG, WEBP</p>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={capturedImages.length >= MAX_IMAGES} />
                          </label>
                        ) : (
                          <div className="grid grid-cols-4 gap-4">
                            {capturedImages.map((img, i) => (
                              <div key={i} className="aspect-square bg-[#0F172A] rounded-xl border border-slate-700 overflow-hidden relative group">
                                <img src={img} alt={`Ref ${i}`} className="w-full h-full object-cover" />
                                <button onClick={() => removeImage(i)} className="absolute inset-0 bg-rose-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                  <Trash2 className="w-6 h-6 text-white" />
                                </button>
                              </div>
                            ))}
                            {capturedImages.length < MAX_IMAGES && (
                              <label className="aspect-square flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl bg-[#0F172A] hover:bg-slate-800/50 hover:border-slate-600 transition-all cursor-pointer group">
                                <Upload className="w-8 h-8 mb-2 group-hover:text-[#06B6D4] transition-colors" />
                                <span className="text-[13px] font-medium">Add More</span>
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
                              </label>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3 & 4: Processing & Success */}
              {(step === 3 || step === 4) && (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center space-y-8"
                >
                  {step === 3 ? (
                    <>
                      <div className="relative">
                        <div className="w-28 h-28 rounded-full border-4 border-slate-800 border-t-[#06B6D4] animate-spin shadow-[0_0_30px_rgba(6,182,212,0.2)]"></div>
                        <Shield className="w-12 h-12 text-[#06B6D4] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="text-center space-y-3">
                        <h3 className="text-3xl font-bold text-slate-100">Generating Profile...</h3>
                        <p className="text-[16px] text-slate-400">Extracting and securely storing facial embeddings</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
                        className="w-28 h-28 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                      >
                        <CheckCircle className="w-14 h-14 text-emerald-400" />
                      </motion.div>
                      <div className="text-center space-y-3">
                        <h3 className="text-3xl font-bold text-slate-100">Enrollment Complete</h3>
                        <p className="text-[16px] text-slate-400">Authorized user has been registered securely.</p>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

            {/* Bottom Actions & Step Indicator */}
            <div className="mt-auto pt-8 border-t border-slate-800/80 flex items-center justify-between">
              
              {/* Step Indicator */}
              <div className="flex items-center gap-4">
                {[
                  { num: 1, label: 'Information' },
                  { num: 2, label: 'Face Data' },
                  { num: 3, label: 'Processing' },
                  { num: 4, label: 'Complete' }
                ].map((s, i) => {
                  const isActive = step === s.num;
                  const isPast = step > s.num;
                  return (
                    <div key={s.num} className="flex items-center">
                      <div className={`flex items-center gap-3 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors ${
                          isActive ? 'bg-[#06B6D4] text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]' :
                          isPast ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}>
                          {isPast ? <CheckCircle className="w-4 h-4" /> : s.num}
                        </div>
                        <span className={`text-[14px] font-bold ${isActive ? 'text-slate-100' : 'text-slate-500'}`}>
                          {s.label}
                        </span>
                      </div>
                      {i < 3 && <div className={`w-8 h-[2px] mx-4 rounded-full ${isPast ? 'bg-emerald-500/30' : 'bg-slate-800'}`} />}
                    </div>
                  );
                })}
              </div>

              {/* Primary Action Button */}
              {step <= 2 && (
                <button 
                  disabled={!formData.fullName.trim() || (step === 2 && capturedImages.length === 0)}
                  onClick={() => step === 1 ? setStep(2) : saveProfile()}
                  className="w-[340px] h-[56px] bg-[#06B6D4] hover:bg-[#00ebd0] text-slate-950 text-[16px] font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {step === 1 ? 'Continue to Face Enrollment' : 'Save Profile'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
}
