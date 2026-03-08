# 🚀 Notion Career Sync: AI-Powered Job Tracker

An intelligent Chrome Extension and local MCP server that automatically extracts job postings from any website and syncs them directly to a Notion Database using the Model Context Protocol (MCP) and Groq.

## 💡 The Inspiration

Applying for software engineering roles often means juggling dozens of tabs, manually copying and pasting company names, salaries, and tech stacks into a spreadsheet. This project automates that entire workflow. With a single click, an AI agent reads the job description, structures the data, and uses the Notion MCP to perfectly categorize it in your personal workspace.

## 🏗️ Architecture

```
Job Listing Page (any site)
        ↓  Chrome Extension extracts raw DOM text
Background Service Worker
        ↓  sends { text, url } to local server
Express Server  (localhost:3000)
        ↓  Groq / Llama 3.3 70B parses messy text → clean JSON
AI Extraction  →  { company, role, location, salary, techStack }
        ↓  @modelcontextprotocol/sdk via StdioClientTransport
Notion MCP Server  →  new row in your Notion Database ✅
```

1. **Frontend (Chrome Extension):** Built with React, TypeScript, and Tailwind CSS. Captures the raw DOM text of the active job posting.
2. **Backend (Node.js/Express):** A local server that receives the text payload.
3. **AI Extraction (Groq/Llama 3.3):** Parses messy web text into clean JSON (`company`, `role`, `location`, `salary`, `techStack`).
4. **Integration (Notion MCP):** Uses `@modelcontextprotocol/sdk` via `StdioClientTransport` to create a new row in a Notion Database.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Extension | React, TypeScript, Vite, Tailwind CSS |
| Server | Node.js, Express, nodemon |
| AI Provider | Groq (Llama 3.3 70B) — free tier |
| Integration | Notion MCP (`@modelcontextprotocol/sdk`) |

## 🚀 Getting Started

### 1. Notion Setup

1. Create a Notion Database with these properties:

   | Property | Type |
   |---|---|
   | Company | Title |
   | Role | Text |
   | Location | Text |
   | Salary | Text |
   | Tech Stack | Multi-select |
   | Status | Select (`Applied`) |
   | URL | URL |

2. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations), create an **Internal Integration**, and copy the token.
3. Open your database → `...` → **Connections** → add your integration.
4. Copy the **Database ID** from the URL: `notion.so/workspace/{DATABASE_ID}?v=...`

### 2. Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
GROQ_API_KEY=your_groq_api_key        # free at console.groq.com/keys
NOTION_API_TOKEN=secret_...           # your integration token
NOTION_DATABASE_ID=your_database_id
```

Start the server:

```bash
npm start
```

You should see: `Server running on http://localhost:3000`

### 3. Extension Setup

```bash
# In the root directory
npm install
npm run build
```

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select the `dist/` folder
4. Pin the extension, navigate to any job board, and click **Extract Job Details**!

## 📸 Demo

1. Open a job listing on LinkedIn, GeeksforGeeks, Internshala, etc.
2. Click the extension icon → **Extract Job Details**
3. Watch the AI parse the page and save it to Notion in seconds

## 📄 License

MIT
