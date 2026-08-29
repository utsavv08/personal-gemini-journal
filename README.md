# Personal Gemini Journal: Enterprise-Secure AI Journaling App

> Built for the **Google AI Studio Ideathon Challenge: Build a Secure "Personal Gemini Journal"**

This application was engineered with a security-first posture, adhering to the enterprise-grade **"Security Constitution"** configured in Google AI Studio.

---

## 🛡️ Architecture & Security Compliance

### 1. User Authentication (Firebase Auth)
- Full user identity management using Firebase Authentication.
- Supports Email/Password and Google Sign-in.
- User session is restored automatically and tokens are cryptographically refreshed.

### 2. Multi-turn AI Interaction (Gemini 1.5/2.0 API)
- Real-time conversational AI drawer powered by `@google/generative-ai`.
- Employs conversational context memory (`history`) for deep multi-turn brainstorming and self-reflection.
- Quick reflection prompts and 1-click takeaway insertion into journal entries.

### 3. Isolated Data Storage (Zero Cross-User Leakage)
- Every user's journals and summaries are saved strictly under the isolated partition:
  `/users/{userId}/journals/{journalId}`
- Enforced by production Firestore Security Rules (`firestore.rules`):
  ```javascript
  match /users/{userId}/journals/{journalId} {
    allow read, delete: if request.auth != null && request.auth.uid == userId;
    allow create, update: if request.auth != null && request.auth.uid == userId;
  }
  ```

### 4. Secure Key Management (Zero Client-Side Key Exposure)
- **Zero API Key Leakage**: The Gemini API key is **never bundled into frontend JavaScript**.
- Frontend communicates with a protected Node.js backend proxy (`http://localhost:3001`).
- Backend retrieves the API key via Google Cloud Secret Manager (`projects/541567487928/secrets/GEMINI_API_KEY/versions/latest`) or secure server environment variables.
- All backend endpoints verify the caller's Firebase ID token (`Bearer <token>`) before servicing AI requests.

---

## ✨ Phase 3 Original Feature Enhancements (Beyond Base Spec)

### 1. Zero-Trust Client-Side Privacy Shield
- Proactively scans journal draft text in real-time for sensitive PII (emails, phone numbers, credit card patterns, API keys, and credentials).
- Displays a visual security badge with 1-click **"Redact PII"** button to scrub sensitive personal data before sending prompts to the LLM or saving to the cloud.

### 2. Cognitive Clarity & Mood Analytics Engine
- Gemini analyzes journal reflections to compute:
  - **Emotional State & Mood Score** (1-10 visual wellness meter).
  - **Cognitive Distortion Detector** (e.g., Catastrophizing, All-or-Nothing thinking, Balanced Perspective).
  - **Compassionate Cognitive Reframe** providing an alternative healthy outlook.
  - **Recommended 2-Minute Micro-Habit** tailored to the entry.
  - **Identified Positive Anchor** (implicit or explicit gratitude).

---

## 🚀 Running Locally

### Backend:
```bash
cd server
npm install
npm start
```
Runs on `http://localhost:3001`.

### Frontend:
```bash
cd client
npm install
npm run dev
```
Runs on `http://localhost:5173`.
