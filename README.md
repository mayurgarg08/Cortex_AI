# Cortex AI

A multi-agent AI assistant built on a microservices backend. One chat box sends each message to the right specialist agent: general chat, live web search, coding, PDF Q&A, PDF and PowerPoint generation, image generation, or image analysis.

**Live:** [mayur-cortexai.online](https://mayur-cortexai.online)

## Features

- **Agent routing with LangGraph.** A router node picks the agent for each message. Uploaded PDFs go to the RAG agent, uploaded images go to the vision analyzer, and everything else is classified by an LLM. Users can also pick an agent by hand.
- **Specialist agents**
  - `chat`: general conversation and explanations (Groq, `gpt-oss-120b`)
  - `search`: real-time web results through Tavily, summarized by the chat agent
  - `coding`: code generation and debugging, with the output shown in a Monaco editor artifact panel
  - `pdfRag`: ask questions about an uploaded PDF (Gemini embeddings and a Qdrant vector store)
  - `pdf` / `ppt`: generate downloadable PDF (PDFKit) and PowerPoint (PptxGenJS) files, stored on AWS S3
  - `vision`: turns a prompt into a detailed image prompt and generates the image
  - `imageAnalyzer`: describes and answers questions about uploaded images (Gemini)
- **Conversation memory.** The last 20 messages of each conversation are cached in Redis and backed by MongoDB.
- **Credits and billing.** Free, Starter (₹199) and Pro (₹499) plans. Payments go through Razorpay, and each agent call deducts credits.
- **Rate limiting.** Per-user, per-agent limits per minute, kept in Redis.
- **Auth.** Google sign-in through Firebase on the client, with server-side sessions stored in Redis and sent as an HTTP-only cookie.

## Architecture

```
frontend (React + Vite)
        │
        ▼
gateway :8000 ── session check (Redis) ──┐
   ├── /api/auth     → auth service    :8001  (Firebase Admin, users, credits)
   ├── /api/chat     → chat service    :8002  (conversations, messages)
   ├── /api/agent    → agent service   :8003  (LangGraph agents)
   └── /api/billing  → billing service :8004  (Razorpay orders & verification)

Shared: MongoDB · Redis · Qdrant · AWS S3
```

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite, Redux Toolkit, Tailwind CSS 4, Motion, Monaco Editor, react-markdown |
| Backend | Node.js, Express 5, express-http-proxy, Mongoose |
| AI | LangChain, LangGraph, Groq, Google Gemini, Tavily, Qdrant |
| Infra | Redis, MongoDB, AWS S3, Docker, AWS ECR/ECS, EC2, GitHub Actions |
| Payments / Auth | Razorpay, Firebase |

## Project structure

```
backend/
  gateway/            API gateway and auth middleware
  services/
    auth/             login, logout, plans, credits
    chat/             conversations and messages
    agent/            LangGraph graph, agents, S3/PDF/PPT utilities
    billing/          Razorpay orders and verification
  shared/redis/       shared Redis client
  docker-compose.yml  local Redis
frontend/             React client
.github/workflows/    CI/CD to AWS
```

## Getting started

### Prerequisites

- Node.js 20+
- Docker (for local Redis)
- MongoDB (local or Atlas)
- A Qdrant instance
- API keys: Groq, Google Gemini, Tavily, Firebase, Razorpay, AWS S3

### 1. Start Redis

```bash
cd backend
docker compose up -d
npm install          # installs the shared Redis client
```

### 2. Configure environment variables

Create a `.env` file in each service folder.

**`backend/gateway/.env`**
```env
PORT=8000
AUTH_SERVICE=http://localhost:8001
CHAT_SERVICE=http://localhost:8002
AGENT_SERVICE=http://localhost:8003
BILLING_SERVICE=http://localhost:8004
REDIS_URL=redis://localhost:6379
```

**`backend/services/auth/.env`** (and `chat` with its own `PORT`)
```env
PORT=8001
MONGODB_URI=your_mongodb_uri
REDIS_URL=redis://localhost:6379
```
The auth service also needs a Firebase Admin service account key saved as `backend/services/auth/serviceAccountKey.json`. Keep it out of git.

**`backend/services/agent/.env`**
```env
PORT=8003
MONGODB_URI=your_mongodb_uri
REDIS_URL=redis://localhost:6379
AUTH_SERVICE=http://localhost:8001
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
GOOGLE_API_KEY=your_gemini_key
TAVILY_API_KEY=your_tavily_key
QDRANT_URL=http://localhost:6333
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your_bucket
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```
`GROQ_API_KEY`, `GOOGLE_API_KEY` and `TAVILY_API_KEY` are not referenced in the code. The LangChain Groq, Google GenAI and Tavily integrations read them from the environment automatically.

**`backend/services/billing/.env`**
```env
PORT=8004
MONGODB_URI=your_mongodb_uri
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
AUTH_SERVICE=http://localhost:8001
```

**`frontend/.env`**
```env
VITE_SERVER_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_RAZORPAY_KEY_ID=your_key_id
```

### 3. Run the services

Run each in its own terminal:

```bash
cd backend/gateway && npm install && npm run dev
cd backend/services/auth && npm install && npm run dev
cd backend/services/chat && npm install && npm run dev
cd backend/services/agent && npm install && npm run dev
cd backend/services/billing && npm install && npm run dev
cd frontend && npm install && npm run dev
```

Open http://localhost:5173.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which:

1. Builds a Docker image for each backend service and pushes it to AWS ECR
2. Rolls out the new images with `aws ecs update-service`
3. Builds the frontend and uploads `dist/` to an EC2 server

## Author

**Mayur Garg** · [GitHub](https://github.com/mayurgarg08) · [LinkedIn](https://www.linkedin.com/in/mayur-garg-428a291b4/)
