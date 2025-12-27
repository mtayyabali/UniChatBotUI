# UniChatBot

A modern university course & policy chatbot with streaming answers. The frontend is a React Router + Vite + Tailwind app, and the backend is a FastAPI + LangChain service deployed at `https://unichatbot.onrender.com`. Answers are grounded using Retrieval-Augmented Generation (RAG) over official university PDFs.

## Highlights (Interview-Ready)
- Real-time WebSocket streaming for conversational UX
- RAG over local PDFs with citations and source transparency
- Pluggable vector backends (Weaviate by default, Chroma optional)
- Clean architecture: UI services → API layer → typed models
- Upload and ingest flows to manage knowledge base
- TypeScript-first with strong typing across services & models
- Docker-ready and easy CI/CD targets

## Features
- Chat
  - Ask questions about grading, credits, attendance, exam retakes, policies, etc.
  - Streaming answers via WebSocket with a responsive “Thinking…” animation
  - Source citations (file and page) for traceability
- Upload PDFs
  - Upload one or more PDFs to the backend under `PDFS_DIR` (default `data/pdfs`)
  - Previews selected files before upload with remove (✕) support
- Ingest PDFs
  - Trigger indexing into the selected backend (Weaviate/Chroma)
  - Displays ingest metrics (documents_loaded, files_indexed, chunks_produced, chunks_indexed)
  - Shows loading state with a spinner and disables button while ingesting
- Configurable Backends
  - Default backend: Weaviate
  - Optional Chroma local persistence
- Modern UI/UX
  - Dark/light theme-aware logos
  - Minimalist layout with tight spacing and accessible components

## Technology Stack
- Frontend
  - React Router (SSR-ready template)
  - Vite (dev tooling + HMR)
  - TypeScript
  - Tailwind CSS
- Backend (external)
  - FastAPI + Python
  - LangChain for RAG orchestration
  - Embeddings: OpenAI / Ollama / Google Gemini (configurable)
  - Vector DB: Weaviate (default) or Chroma (optional)

## Architecture
- UI (this repo)
  - `app/routes/*` – Pages and route modules (Home, Chat)
  - `app/composables/homepage/*` – Homepage composition (hero, features, upload, ingest)
  - `app/api/*` – Thin API wrappers mapping to backend endpoints
  - `app/services/*` – UI-level service orchestration using API layer
  - `app/models/*` – TypeScript models (types for requests/responses)
  - `public/*` – Static assets (logos, favicon)
- Backend (remote service)
  - Endpoint base: `https://unichatbot.onrender.com`
  - See backend README for config details

### Data Flow (Chat)
1. User submits a question in the UI
2. UI opens WebSocket to `/ws/chat` and streams chunks
3. UI shows “Thinking…” animation while streaming
4. UI renders accumulated assistant response and source citations
5. Fallback to REST `/chat` on WS errors

### Data Flow (Upload + Ingest)
1. User selects PDFs in the upload widget (shows names, supports remove)
2. UI posts to `/upload-pdfs` using multipart form `files`
3. UI triggers `/ingest-pdfs` with backend selection and optional force reset
4. UI displays metrics and status on completion

## Environment Configuration
The frontend reads the backend base URL from a Vite env var.

- `.env`
  - `VITE_BACKEND_HTTP=https://unichatbot.onrender.com`

You can point to your own backend:

```
VITE_BACKEND_HTTP=https://your-backend.example.com
```

## Scripts
- Development
  - `npm run dev` – Start the dev server (Vite + HMR)
- Build
  - `npm run build` – Create production build
- Preview
  - `npm run preview` – Preview built app locally

## Getting Started
1. Install dependencies
   
   ```bash
   npm install
   ```

2. Configure environment
   
   ```bash
   echo "VITE_BACKEND_HTTP=https://unichatbot.onrender.com" > .env
   ```

3. Start development
   
   ```bash
   npm run dev
   ```

Open `http://localhost:5173` and start chatting.

## Usage
- Homepage
  - Shows the UniChatBot logo (dark/light aware), features, upload & ingest panels
  - Default backend: Weaviate (configurable from UI)
- Chat
  - Enter a question and press “Send”
  - Streaming shows “Thinking…” with a spinner; answers accumulate live
  - Sources appear under the message when available
- Upload PDFs
  - Select one or multiple PDFs, see their names, remove any before upload
  - Press “Upload” to send to backend `/upload-pdfs`
- Ingest PDFs
  - Choose backend (Weaviate/Chroma), optionally enable “Force reset”
  - Press “Ingest PDFs” to index; button disables and shows a loading circle until done

## API (Backend)
Base URL: `https://unichatbot.onrender.com`

- `GET /health`
  - Basic status and environment info
- `POST /chat`
  - Body: `{ question: string, backend?: "weaviate" | "chroma" }`
  - Response: `{ answer: string, sources: Array<{file?: string, page?: number}>, backend: string }`
- `GET /ws/chat` (WebSocket)
  - Client sends: `{ question: string, backend?: "weaviate" | "chroma" }`
  - Server sends: `{type:"sources", sources:[{file,page},...], backend, top_k}` then streamed text chunks, then `{type:"done"}`
- `POST /upload-pdfs`
  - Multipart form field: `files` (one or more PDFs)
  - Response: `{ saved: string[], skipped: string[], dest_dir: string }`
- `POST /ingest-pdfs`
  - Body: `{ force_reset: boolean, backend: "weaviate" | "chroma" }`
  - Response: Ingest metrics and status (documents_loaded, files_indexed, chunks_produced, chunks_indexed, backend, status, errors)

## Project Structure
```
├── app/
│   ├── api/                 # Backend calls (chat, ingest, upload)
│   ├── services/            # UI orchestration over APIs
│   ├── models/              # Shared types for requests/responses
│   ├── routes/              # Home + Chat pages
│   ├── composables/homepage # Homepage composition
│   ├── root.tsx             # App shell, meta, links
│   └── app.css              # Styles (Tailwind)
├── public/
│   ├── logo-light.svg
│   ├── logo-dark.svg
│   └── favicon.svg
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Deployment
### Docker
Build and run:

```bash
docker build -t unichatbot-ui .
# Run the container
docker run -p 3000:3000 unichatbot-ui
```

Deployable to common platforms:
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- DigitalOcean App Platform
- Fly.io
- Railway

### DIY / Node
The server output from `npm run build` is production-ready.

```
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Roadmap
- Conversations history and session persistence
- Authentication for admin-only ingest/upload
- Role-based sources filtering and PDF tagging
- Advanced UI polish (message markdown, code blocks, copy button)
- Monitoring & analytics (usage metrics, errors)

## Credits
- Backend: FastAPI + LangChain (external service)
- Frontend: React Router team template
- Icons/Logo: Custom modern SVGs (mortarboard + chat bubble)

---
Built with ❤️ by mtayyaabli
