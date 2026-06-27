const { analyzeFrame } = require('../api/afferens');
const db = require('../db');

const PIPELINE_STEPS = ['observe', 'buffer', 'reason', 'plan', 'decide', 'execute', 'verify'];

class AntiGravityAgent {
  constructor() {
    this.observationBuffer = [];
    this.bufferSize = 5;
    this.securityState = 'NORMAL';
    this.absenceDuration = 0;
    this.unknownVisitorCount = 0;
    
    // Auto-lock feature
    this.lockTimer = null;
    this.isWorkstationLocked = false;
    
    // Default configs (would be loaded from DB in production lifecycle)
    this.absenceTimeout = 10;
    this.confidenceThreshold = 90;
    this.riskThreshold = 75;
    
    // Identity Verification
    this.similarityThreshold = 45; // ~0.55 distance
  }

  async loadConfiguration() {
    try {
      const config = await db.getConfiguration();
      if (config.absence_timeout) this.absenceTimeout = parseInt(config.absence_timeout);
      if (config.confidence_threshold) this.confidenceThreshold = parseInt(config.confidence_threshold);
      if (config.observation_buffer_size) this.bufferSize = parseInt(config.observation_buffer_size);
      if (config.risk_threshold) this.riskThreshold = parseInt(config.risk_threshold);
    } catch (e) {
      console.error('Could not load configuration from DB', e);
    }
  }

  calculateEuclideanDistance(desc1, desc2) {
    if (!desc1 || !desc2 || desc1.length !== desc2.length) return 1.0;
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
      sum += Math.pow(desc1[i] - desc2[i], 2);
    }
    return Math.sqrt(sum);
  }

  calculateRiskScore(state, confidence) {
    let base = 0;
    switch (state) {
      case 'NORMAL': base = 5; break;
      case 'MONITORING': base = 20; break;
      case 'WARNING': base = 50; break;
      case 'LOCKED': base = 75; break;
      case 'AUTHORIZED_USER_VERIFIED': base = 35; break;
      case 'INTRUDER_DETECTED': base = 95; break;
    }
    const confFactor = (100 - confidence) * 0.15;
    const absFactor = Math.min(this.absenceDuration * 0.5, 15);
    const visitorFactor = this.unknownVisitorCount * 5;
    return Math.min(100, Math.max(0, Math.round(base + confFactor + absFactor + visitorFactor)));
  }

  getToolForState(state) {
    switch (state) {
      case 'NORMAL': return 'update_dashboard()';
      case 'MONITORING': return 'update_dashboard()';
      case 'WARNING': return 'log_security_event()';
      case 'LOCKED': return 'secure_workstation()';
      case 'AUTHORIZED_USER_VERIFIED': return 'restore_workstation()';
      case 'INTRUDER_DETECTED': return 'capture_snapshot()';
      default: return 'update_dashboard()';
    }
  }

  lockWorkstation(db, eventType = 'USER_LEFT_WORKSTATION', reason = 'No face detected for 5 seconds') {
    if (this.isWorkstationLocked) return;
    this.isWorkstationLocked = true;
    
    const { exec } = require('child_process');
    exec('rundll32.exe user32.dll,LockWorkStation', (error) => {
      if (error) {
        console.error('Failed to lock workstation:', error);
      } else {
        db.logSecurityEvent(eventType, 100, null, reason).catch(console.error);
        console.log(`Workstation locked automatically. Reason: ${reason}`);
      }
    });
  }

  calculateEuclideanDistance(desc1, desc2) {
    if (!desc1 || !desc2 || desc1.length !== desc2.length) return 1.0;
    const sum = desc1.reduce((acc, val, i) => acc + Math.pow(val - desc2[i], 2), 0);
    return Math.sqrt(sum);
  }

  getReasoning(state, profileName, avgSimilarity, livenessRequired) {
    if (state === 'INTRUDER_DETECTED') {
      return `⚠️ ALERT: Unknown person detected! Identity verification failed (Similarity: ${Math.round(avgSimilarity)}%). Workstation Locked.`;
    }
    if (livenessRequired && ['WARNING', 'LOCKED'].includes(state)) {
      return 'Action required: Please move your head slightly to verify liveness and confirm identity.';
    }
    
    const templates = {
      NORMAL: `Authorized user (${profileName}) verified securely. Similarity score: ${Math.round(avgSimilarity)}%.`,
      MONITORING: 'User presence dropped. Evaluating buffer consistency...',
      WARNING: 'Multiple consecutive frames confirm user absence. Planning workstation lock.',
      LOCKED: 'Workstation secured. secure_workstation() executed successfully.',
      AUTHORIZED_USER_VERIFIED: `Identity verified (${profileName}). Similarity: ${Math.round(avgSimilarity)}%. Restoring workspace.`,
    };
    return templates[state] || 'Monitoring...';
  }

  async processPerception(perceptionPayload, emitUpdate) {
    const db = require('../db');
    const profile = await db.getUserProfile();

    if (!profile || !profile.fullName) {
      return {
        securityState: 'WARNING',
        presenceStatus: 'Unknown',
        confidence: 0,
        riskScore: 50,
        absenceDuration: 0,
        unknownVisitorCount: 0,
        lastDecision: 'prompt_enrollment()',
        reasoning: 'No Authorized User Registered. Please enroll a user profile.',
        selectedTool: 'prompt_enrollment()',
        workingMemory: {}
      };
    }

    // 1. Observe
    emitUpdate({ step: 'observe', status: 'running' });
    await analyzeFrame(perceptionPayload.frame); // Validate against vision API (simulated)
    
    const isPresent = perceptionPayload.hasFace;
    
    // Auto-lock feature logic
    if (isPresent) {
      if (this.lockTimer) {
        clearTimeout(this.lockTimer);
        this.lockTimer = null;
      }
      this.isWorkstationLocked = false;
    } else {
      if (!this.lockTimer && !this.isWorkstationLocked) {
        this.lockTimer = setTimeout(() => {
          this.lockWorkstation(db);
          this.lockTimer = null;
        }, 10000);
      }
    }

    let similarityScore = 0;
    
    if (isPresent && perceptionPayload.descriptor && profile.descriptor) {
       const profileDesc = typeof profile.descriptor === 'string' ? JSON.parse(profile.descriptor) : profile.descriptor;
       const liveDesc = typeof perceptionPayload.descriptor === 'string' ? JSON.parse(perceptionPayload.descriptor) : perceptionPayload.descriptor;
       const distance = this.calculateEuclideanDistance(liveDesc, profileDesc);
       
       // Map distance to a similarity percentage. 
       // distance 0.55 is the standard threshold for "same person". We map 0.55 distance to 75% similarity.
       // distance 0.0 -> 100%
       similarityScore = Math.max(0, Math.round(100 - ((distance / 0.55) * 25)));
       console.log(`[AntiGravityAgent] Euclidean Distance: ${distance.toFixed(4)}, Similarity Score: ${similarityScore}%`);
    }
    
    const isLive = perceptionPayload.livenessPassed || false;

    await new Promise(r => setTimeout(r, 50));
    emitUpdate({ step: 'observe', status: 'completed' });

    // 2. Buffer (Multi-Frame Verification)
    emitUpdate({ step: 'buffer', status: 'running' });
    this.observationBuffer.push({ isPresent, similarityScore });
    if (this.observationBuffer.length > this.bufferSize) {
      this.observationBuffer.shift();
    }
    
    const validScores = this.observationBuffer.filter(f => f.isPresent && f.similarityScore > 0).map(f => f.similarityScore);
    let avgSimilarity = 0;
    if (validScores.length > 0) {
       avgSimilarity = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    }
    
    const bufferConsistency = this.observationBuffer.every(v => v.isPresent === isPresent);
    
    // Similarity Threshold explicitly set to 75% as requested by user
    const isConsistentMatch = validScores.length > 0 && avgSimilarity >= 75;
    // Dynamic liveness requirement: if similarity is between 75% and 85%, or if unknown visitor was detected.
    const livenessRequired = isConsistentMatch && (avgSimilarity < 85 || this.unknownVisitorCount > 0);
    const livenessPassed = !livenessRequired || isLive;

    await new Promise(r => setTimeout(r, 50));
    emitUpdate({ step: 'buffer', status: 'completed' });

    // 3 & 4. Remember & Reason
    emitUpdate({ step: 'reason', status: 'running' });
    let nextState = this.securityState;

    if (bufferConsistency) {
      if (!isPresent) {
        if (this.securityState === 'NORMAL') nextState = 'MONITORING';
        else if (this.securityState === 'MONITORING') nextState = 'WARNING';
        else if (this.securityState === 'WARNING') nextState = 'LOCKED';
      } else {
        // Someone is present!
        if (isConsistentMatch) {
           if (livenessPassed) {
              this.unknownVisitorCount = 0; // reset
              if (this.securityState === 'LOCKED' || this.securityState === 'INTRUDER_DETECTED') {
                nextState = 'AUTHORIZED_USER_VERIFIED';
              } else if (this.securityState === 'AUTHORIZED_USER_VERIFIED') {
                nextState = 'NORMAL';
              } else {
                nextState = 'NORMAL';
              }
           } else {
              // Not live yet, wait for liveness
              if (this.securityState === 'NORMAL') nextState = 'WARNING';
           }
        } else if (validScores.length > 2) {
           // Enough frames processed and still not a match
           this.unknownVisitorCount++;
           nextState = 'INTRUDER_DETECTED';
        }
      }
    }
    await new Promise(r => setTimeout(r, 50));
    emitUpdate({ step: 'reason', status: 'completed' });

    // 5. Plan
    emitUpdate({ step: 'plan', status: 'running' });
    const conf = isPresent ? (isConsistentMatch ? avgSimilarity : 50) : 15; 
    if (!isPresent) this.absenceDuration += 2;
    else this.absenceDuration = 0;
    const risk = this.calculateRiskScore(nextState, conf);
    await new Promise(r => setTimeout(r, 50));
    emitUpdate({ step: 'plan', status: 'completed' });

    // 6. Decide
    emitUpdate({ step: 'decide', status: 'running' });
    const tool = this.getToolForState(nextState);
    const reasoning = this.getReasoning(nextState, profile.fullName, avgSimilarity, !livenessPassed && livenessRequired);
    await new Promise(r => setTimeout(r, 50));
    emitUpdate({ step: 'decide', status: 'completed' });

    // 7. Execute
    emitUpdate({ step: 'execute', status: 'running' });
    
    if (nextState === 'INTRUDER_DETECTED' && !this.isWorkstationLocked) {
      this.lockWorkstation(db, 'INTRUDER_DETECTED', 'Unknown face detected. Locking workstation immediately.');
    }
    
    if (this.securityState !== nextState && ['WARNING', 'LOCKED', 'INTRUDER_DETECTED'].includes(nextState)) {
      try {
        await db.logSecurityEvent(nextState, conf, null, reasoning);
      } catch (e) {
        console.error('DB Log Error:', e);
      }
    }
    this.securityState = nextState;
    await new Promise(r => setTimeout(r, 50));
    emitUpdate({ step: 'execute', status: 'completed' });

    // 8. Verify
    emitUpdate({ step: 'verify', status: 'running' });
    await db.updateAgentState('current_security_state', this.securityState).catch(console.error);
    await new Promise(r => setTimeout(r, 50));
    emitUpdate({ step: 'verify', status: 'completed' });
    
    let displayPresenceStatus = 'Absent';
    if (isPresent) {
       if (isConsistentMatch) {
          displayPresenceStatus = livenessPassed ? 'Authorized User' : 'Verifying...';
       } else if (validScores.length > 0) {
          displayPresenceStatus = 'Unknown Person';
       } else {
          displayPresenceStatus = 'Face Detected';
       }
    }

    // Final result
    return {
      securityState: this.securityState,
      presenceStatus: displayPresenceStatus,
      confidence: Math.round(conf),
      riskScore: risk,
      absenceDuration: this.absenceDuration,
      unknownVisitorCount: this.unknownVisitorCount,
      lastDecision: tool,
      reasoning: reasoning,
      selectedTool: tool,
      workingMemory: {
        currentFrame: 'latest',
        presenceStatus: displayPresenceStatus,
        similarityScore: avgSimilarity > 0 ? `${Math.round(avgSimilarity)}%` : 'N/A',
        livenessRequired: livenessRequired ? 'YES' : 'NO',
        livenessPassed: livenessPassed ? 'YES' : 'NO',
        securityState: this.securityState,
        riskScore: risk,
        selectedTool: tool,
        bufferConsistency: bufferConsistency ? 'CONSISTENT' : 'INCONSISTENT'
      }
    };
  }
}

module.exports = AntiGravityAgent;
