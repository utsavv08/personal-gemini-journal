# Personal Gemini Journal: Enterprise-Secure AI Journaling App

> Built for the **Google AI Studio Ideathon Challenge: Build a Secure "Personal Gemini Journal"**

🌐 **Live Deployed Application (Google Cloud Run):**  
👉 **[https://personal-gemini-journal-541567487928.europe-west1.run.app/](https://personal-gemini-journal-541567487928.europe-west1.run.app/)**

Public Code Repository: [https://github.com/utsavv08/personal-gemini-journal](https://github.com/utsavv08/personal-gemini-journal)

---

## 🛡️ Architecture & Security Compliance

This application was engineered with a security-first posture, strictly adhering to the enterprise-grade **"Security Constitution"** configured in Google AI Studio and the OWASP Top 10 for LLM Applications:

### 1. User Identity & Authentication (Firebase Auth)
- Secure user identity management leveraging Firebase Authentication.
- Federated Identity via Google Sign-In and email/password authentication.
- Cryptographic Firebase ID Token verification (`Bearer <token>`) performed at every backend boundary before servicing AI requests.

### 2. Multi-Turn AI Interaction (Gemini 3.6 Flash API)
- Real-time conversational AI drawer powered by `@google/generative-ai`.
- Employs conversational context memory (`history`) for deep multi-turn brainstorming and self-reflection.
- Automated 3-point bullet summarization and evocative title generation.
- **Resilient Fallback Ladder**: Primary `gemini-3.6-flash` with automatic fallback to `gemini-3.1-flash-lite`, `gemini-flash-latest`, and `gemini-3.7-flash` across transient 429/503/500 API responses.

### 3. Isolated Data Storage (Zero Cross-User Leakage)
- Every user's reflections, summaries, and chat takeaways are partitioned strictly under:
  `/users/{userId}/journals/{journalId}` and `/users/{userId}/interactions/{interactionId}`
- Enforced at the infrastructure level by production Firestore Security Rules.

### 4. Secret Management & Zero-Hardcoding Hygiene
- **Zero Client-Side Key Exposure**: The Gemini API key is **never bundled into frontend JavaScript**.
- Frontend communicates with a protected Cloud Run Node.js backend proxy.
- Backend dynamically resolves the API key from Google Cloud Secret Manager (`projects/541567487928/secrets/GEMINI_API_KEY/versions/latest`) or secure server environment variables.

---

## 🔒 Cloud Firestore Security Rules

Deploy the following owner-bound rules in `firestore.rules` to eliminate cross-user data leakage:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Zero-Trust Default: Deny any unauthenticated or broad root access
    match /{document=**} {
      allow read, write: if false;
    }

    // Isolated user journal partition: Zero Cross-User Leakage
    match /users/{userId}/journals/{journalId} {
      allow read, delete: if request.auth != null && request.auth.uid == userId;
      allow create, update: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.data.userId == userId;
    }

    // Isolated user interactions partition
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🔑 Google Cloud Secret Manager Setup

To store the Gemini API key securely in Google Cloud Secret Manager and grant access to the Cloud Run runtime service account:

```bash
# 1. Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# 2. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant the Cloud Run service account access to read the secret
# Replace 541567487928 with your GCP Project Number:
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:541567487928-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🚀 Google Cloud Run Deployment

Deploy the container to Cloud Run using the `gcloud` CLI:

```bash
# Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Deploy service from repository root
gcloud run deploy personal-gemini-journal \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated
```

### 🏷️ Mandatory Challenge Verification Label

Apply the official campaign resource label to register the Cloud Run service for automated challenge evaluation:

```bash
gcloud run services update personal-gemini-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=europe-west1
```

---

## ✨ Phase 3 Original Feature Enhancements

### 1. Zero-Trust Client-Side Privacy Shield
- Real-time client-side regex auditing that intercepts sensitive PII (emails, phone numbers, API keys, credentials) directly in the editor buffer.
- Features a 1-click **"Redact PII"** action that scrubs private data before prompts are sent to Gemini or stored in Firestore.

### 2. Cognitive Clarity & Mood Analytics Engine
- Analyzes personal reflections to compute:
  - **Emotional State & Mood Score** (1-10 visual wellness meter).
  - **Cognitive Distortion Detector** (e.g., Catastrophizing, All-or-Nothing thinking, Balanced Perspective).
  - **Compassionate Cognitive Reframe** offering an evidence-based healthier perspective.
  - **Recommended 2-Minute Micro-Habit** tailored to the entry.
  - **Positive Gratitude Anchor** highlighting progress.

---

## 🧪 Comprehensive Verification Walkthrough

| Test Case | Flow / Action | Expected Result |
| :--- | :--- | :--- |
| **TC-01: Authentication** | Click "Continue with Google" or Email login. | User session established; ID token refreshed; entries fetched for authenticated user ID. |
| **TC-02: User Partition Isolation** | Create new reflection and click "Save to Cloud". | Document is written strictly to `/users/{userId}/journals/{journalId}`. Unauthorized users receive Firestore permission denied. |
| **TC-03: Multi-turn Co-Pilot Chat** | Open Gemini drawer, submit prompt, then send follow-up. | Multi-turn chat memory retains context; AI responds warmly and insightfully. |
| **TC-04: Takeaway Insertion** | Click "Add takeaway to notes" below any chat response. | AI reflection snippet is automatically appended into current editor text buffer. |
| **TC-05: AI Summarization** | Click "Summarize Entry" with text written. | Gemini returns structured JSON title, 3 summary bullets, insights, and action items. Automatically auto-saves to Firestore. |
| **TC-06: Cognitive & Mood Insights**| Click "Analyze Thoughts with Gemini". | Displays interactive mood score meter (1-10), cognitive pattern detection, reframe, and micro-habit. |
| **TC-07: Privacy Shield Redaction** | Type `contact: dev@example.com, tel: 555-0199`. | Shield badge highlights yellow PII detection; clicking "Redact PII" instantly scrubs the data to `[EMAIL REDACTED]` and `[PHONE REDACTED]`. |
| **TC-08: Zero Crash Resilience** | Test during transient API errors or quota depletion. | Fallback ladder catches error, returns formatted response without throwing 500/503 or crashing Node process. |

---

## 💻 Local Development Setup

```bash
# 1. Backend Proxy Setup
cd server
npm install
npm start
# Runs on http://localhost:3001

# 2. Frontend Development Server
cd ../client
npm install
npm run dev
# Runs on http://localhost:5173
```
