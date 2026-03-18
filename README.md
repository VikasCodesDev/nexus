# NEXUS — The Next-Gen Gaming OS 🎮🚀

![NEXUS Preview](./nexus_preview.png)

![Next.js](https://img.shields.io/badge/Next.js-14-00d9ff?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?style=for-the-badge)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animation-b000ff?style=for-the-badge)
![Groq AI](https://img.shields.io/badge/Groq-AI-ff8800?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Backend-00ff88?style=for-the-badge)
![Express](https://img.shields.io/badge/Express-API-ffffff?style=for-the-badge)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-ebbc33?style=for-the-badge)

NEXUS is a futuristic gaming operating system and dashboard designed for the modern gamer.  
Integrating real-time game data, AI-driven recommendations, and a centralized social hub, NEXUS provides a seamless, immersive environment inspired by high-end gaming interfaces.

🌐 Live Website: https://nexus-gamingos.vercel.app/

## ✨ Core Features

### 🕹️ Unified Game Library
- **Live Search**: Instant discovery using the RAWG API database.
- **Dynamic Catalog**: Real-time trending, top-rated, and multiplayer collections.
- **Smart Mapping**: Automated store detection (Steam, Epic, Rockstar) for every title.
- **Metacentric Intelligence**: Logic-based estimations for game size and localized pricing.

### 🧠 AI Copilot & Discovery
NEXUS functions as an intelligent gaming companion:

- 💬 **Copilot Chat** — Real-time tactical advice and system navigation help.
- 🎯 **Smart Recommendations** — Mood-based game picks powered by Groq LLM.
- 🔍 **Context Awareness** — AI that understands which module you are currently navigating.
- ⚙️ **Command Interface** — Futuristic AI command panel for instant interaction.

### 📰 News Pulse
- **Filtered Feed**: Strictly gaming-related news via News API.
- **Visual Richness**: Auto-filtering for articles with high-quality imagery.
- **Keyword Intelligence**: Post-fetch filtering to exclude noise (politics, finance) and focus on esports and releases.

### 🎨 Immersive Experience
- 👨‍🚀 **3D Astronaut Environment**: Fully interactive Three.js astronaut model.
- 🌌 **Glassmorphism UI**: Sleek, transparent panels with neon glow effects.
- 🧲 **Magnetic Interactions**: Responsive elements that react to user presence.
- ⚡ **Motion Transitions**: Fluid layout shifts powered by Framer Motion.
- 🖥️ **Centric OS Pill**: A single, elegant navigation bar (SystemBar).

### 🔐 System Architecture
- **Micro-service feel**: Decoupled Frontend (Next.js) and Backend (Express).
- **Real-time Engine**: Socket.io for instant presence and messaging.
- **Secure Persistence**: JWT-based authentication and MongoDB session management.

## 🚀 Tech Stack

### 🧩 Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Vanilla CSS + Tailwind
- **Animations**: Framer Motion
- **3D Graphics**: Three.js / React Three Fiber
- **State**: Zustand

### ⚙️ Backend
- Node.js + Express
- Groq AI LLM Integration
- RAWG & NewsAPI Integration
- Socket.io Real-time engine
- MongoDB Atlas Persistence
