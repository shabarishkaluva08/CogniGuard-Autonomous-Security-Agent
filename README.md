# 🛡️ CogniGuard AI

> **Intelligent Autonomous Workstation Security Agent**

CogniGuard AI is an AI-powered workstation security system that continuously monitors computer workstations using computer vision and artificial intelligence. It automatically verifies user identity, detects unauthorized access, locks the workstation, captures security evidence, sends email alerts, and provides real-time monitoring through an enterprise dashboard.

---

## 🚀 Features

- 👤 Real-time Face Detection
- ✅ Authorized User Verification
- 🧠 AI-powered Decision Engine
- 🛡️ Liveness Detection
- 🚫 Unauthorized User Detection
- 🔒 Automatic Windows Workstation Lock
- ⏱️ Auto Lock after 5 seconds of user absence
- 📸 Intruder Snapshot Capture
- 📧 Email Security Alerts
- 📊 Enterprise Security Dashboard
- 📝 Security Event Logging
- ⚡ Real-time WebSocket Communication

---

# 🏗️ System Architecture

```
Camera

↓

Face Detection

↓

Face Recognition

↓

Liveness Detection

↓

AI Decision Engine

↓

Security Actions

├── Lock Workstation
├── Capture Snapshot
├── Email Alert
└── Security Log

↓

Enterprise Dashboard
```

---

# 🖥️ Technology Stack

## Frontend

- React
- Tailwind CSS
- shadcn/ui
- Framer Motion

## Backend

- Node.js
- Express.js
- WebSocket

## Database

- MySQL

## AI

- Google Gemini

## Computer Vision

- @vladmandic/face-api
- Afferens Vision API

## Notifications

- Nodemailer (Gmail SMTP)

---

# 🔄 Workflow

1. Camera continuously monitors the workstation.
2. Face detection identifies whether a person is present.
3. Face recognition verifies the user's identity.
4. Liveness detection prevents spoofing attacks.
5. AI analyzes the situation.
6. If the user is authorized:
   - Continue monitoring.
7. If an unauthorized person is detected:
   - Capture snapshot
   - Lock workstation
   - Log security event
   - Send email alert
8. If no person is detected for 5 seconds:
   - Automatically lock the workstation.

---

# 📂 Project Structure

```
CogniGuard-AI

├── frontend/
│   ├── src/
│   ├── public/
│   └── components/
│
├── backend/
│   ├── src/
│   ├── routes/
│   ├── services/
│   ├── websocket/
│   └── database/
│
├── screenshots/
│
├── docs/
│
└── README.md
```

---

# 🎯 Problem Statement

Traditional workstation security depends on passwords and inactivity timers. These methods cannot determine whether the authorized employee is physically present, leaving confidential information vulnerable to unauthorized access.

CogniGuard AI addresses this challenge through continuous AI-powered identity verification and autonomous workstation protection.

---

# 💡 Key Highlights

- Autonomous AI Security Agent
- Continuous Identity Verification
- Real-time Decision Making
- Intelligent Workstation Protection
- Enterprise Dashboard
- Explainable AI Decisions
- Security Audit Logs

---

# 📈 Future Scope

- Windows Service Deployment
- Multi-user Support
- Cloud Synchronization
- Enterprise Fleet Management
- Mobile Notifications
- SSO Integration
- Compliance Reporting

---

# 📷 Screenshots

- Dashboard

- <img width="1917" height="860" alt="image" src="https://github.com/user-attachments/assets/122600f8-3715-4904-880f-155f4bee943e" />

- Live Monitoring

- <img width="1917" height="870" alt="image" src="https://github.com/user-attachments/assets/0f8bbd42-8198-43e8-a69c-12d1d89b7409" />

- Face Verification
- <img width="1917" height="870" alt="image" src="https://github.com/user-attachments/assets/d9cb1bd0-b47d-4bfc-92e6-7339d773828d" />

- Intruder Detection

  <img width="1910" height="810" alt="image" src="https://github.com/user-attachments/assets/37722ec4-f02b-48af-9e11-ec8c974a07b7" />


---

# 👨‍💻 Team

**Team Shabari**

shabarish kaluva 

AscAIthon 2026

BVRIT

Ram lekkala

---

# 📜 License

This project was developed for educational and hackathon purposes.
