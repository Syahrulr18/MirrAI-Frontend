# MirrAI Frontend

MirrAI is a Web and Artificial Intelligence (AI) powered public speaking coach that runs directly in your web browser. The application helps users practice their public speaking skills in real time by analyzing eye contact, body posture, hand gestures, speaking pace, and filler words.

---

## Key Features

- Real-Time AI Detection: Uses Google MediaPipe (Face, Pose, and Hand Landmarker) to detect gestures, body posture, and eye contact directly through your webcam without server latency.
- Real-Time Speech Recognition: Measures speaking pace (WPM) and detects filler words (such as "um", "uh", "like") live during practice sessions.
- Interactive Teleprompter: Helps users read speech scripts with customizable auto-scroll speeds.
- Evaluation & Replay (Scorecard): Displays detailed performance scores alongside a video replay of the practice session.
- Progress & Analytics Charts: Visualizes long-term performance trends and a monthly practice consistency heatmap calendar.
- Interactive Learning Modules: Provides 12 public speaking topics available in both English and Indonesian.
- AI Script Writer & Consultant: An AI assistant to help draft, review, and refine speech scripts.
- Multi-Language & Dark Mode Support: Full support for English and Indonesian languages, plus a dark mode UI option.

---

## Tech Stack

- Framework & Language: React 19, TypeScript, Vite
- Styling & UI: TailwindCSS (Neubrutalism Visual Style), Framer Motion, Lucide React
- AI & Computer Vision: Google MediaPipe Tasks Vision (`@mediapipe/tasks-vision`)
- State Management & Data Fetching: Zustand, TanStack React Query (v5), Axios
- Form & Validation: React Hook Form, Zod
- Internationalization: i18next, react-i18next
- Data Visualization: Recharts

---

## Directory Structure

```text
MirrAI-frontend/
├── public/
│   └── locales/           # English & Indonesian i18n translation files
├── src/
│   ├── app/               # Application providers (Auth, Theme, Routing)
│   ├── components/        # Reusable UI components (Button, Card, Modal, Chatbot)
│   ├── hooks/             # Custom hooks for MediaPipe AI (Face, Pose, Hand)
│   ├── lib/               # API configuration, i18n, scoring logic, log suppressors
│   ├── pages/             # Main application pages (Dashboard, Practice, Scorecard, etc.)
│   └── store/             # Global state (Auth Store, Session Store)
├── index.html             # HTML entry point
└── vite.config.ts         # Vite configuration
```

---

## Local Development Setup

### Prerequisites

- Node.js (Version 18 or higher)
- npm or bun

### Setup Steps

1. Navigate to the frontend directory:
   ```bash
   cd MirrAI-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser at `http://localhost:5173`.

---

## Key Commands

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds the production bundle.
- `npm run preview`: Previews the production build locally.
