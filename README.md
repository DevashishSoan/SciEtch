# 🧬 SciEtch: Neural Research OS

> **From Abstract to Publication-Ready Schematic in 60 Seconds.**

SciEtch is a high-fidelity, AI-native research platform designed for the world's most innovative laboratories. It bridges the gap between complex scientific literature and visual communication by automatically synthesizing text abstracts into structured, professional-grade diagrams.

![SciEtch UI Preview](https://via.placeholder.com/1200x600/05070a/53E6D4?text=SciEtch+Research+Platform)

---

## 🚀 Core Features

- **🧠 Neural Synthesis Engine**: Paste any scientific abstract, and our simulated NLP pipeline extracts methodology primitives, causal links, and experimental variables.
- **📐 Optimal Topology Builder**: A robust, React-based canvas engine that auto-arranges complex biological, chemical, and computational nodes into logical hierarchies.
- **⚡ "Neural Dark" Interface**: A cinematic, glassmorphic UI built with strict design tokens (Carbon Black, Neon Mint, Royal Purple) for an immersive research experience.
- **☁️ Real-Time Cloud Sync**: Integrated Google Sheets Webhook support for real-time persistence of your research layout data.
- **📥 Publication-Grade Export**: Multi-format rendering engine supporting 300 DPI PNGs, Print-Ready PDFs, and Scalable SVGs for seamless journal submission.

## 🛠️ Technology Stack

SciEtch is built on a modern, high-performance web architecture:

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **State Management**: Zustand (with Temporal for Undo/Redo)
- **Styling**: Vanilla CSS with custom "Neural Aurora" design tokens
- **Animations**: Framer Motion
- **Export Engine**: html2canvas + jsPDF

## 💻 Local Installation

To run the SciEtch platform locally on your machine:

1. **Clone the repository**
   ```bash
   git clone https://github.com/DevashishSoan/SciEtch.git
   cd SciEtch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the Neural Engine (Development Server)**
   ```bash
   npm run dev
   ```

4. **Access the Interface**
   Open your browser and navigate to `http://localhost:5173`

## 🧪 The "Zero-Code" Cloud Bridge (Google Sheets)
SciEtch supports saving your schematics directly to a Google Sheet. To enable this:
1. Create a new Google Sheet.
2. Go to `Extensions > Apps Script` and paste the provided receiver script.
3. Deploy as a Web App (Access: Anyone).
4. Click the `⚙️` icon in the SciEtch TopBar and paste your Webhook URL.

---

**Built for Scientists, by Scientists.**
*Designed and Engineered by Devashish Soan*
