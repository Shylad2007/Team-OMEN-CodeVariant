# R3VIVE — Circular Decision Intelligence Platform

> **Rethink. Repair. Reimagine.**

R3VIVE is an intelligent, open circular economy platform designed to eliminate premature waste and guide consumers, technicians, and organizations toward the most viable, sustainable lifecycle pathways for durable goods.

---

## 1. The Problem We Aim to Solve

Every year, millions of tons of repairable consumer electronics, domestic appliances, furniture, and workshop tools are discarded into landfills or downcycled into scrap. This linear "take-make-waste" consumption model persists because consumers and technicians face:

- **Diagnostic Information Asymmetry**: Users lack clear, accessible guidance on whether a malfunctioning item can be practically repaired.
- **Obscure Economic Trade-offs**: Repair quotes are frequently weighed against the retail price of new units without transparent insight into total cost of ownership or component replacement viability.
- **Overlooked Intermediate Strategies**: Valuable circular alternatives—such as secondary domestic reuse, upcycling/repurposing, or component harvesting—are rarely presented as structured options.
- **Fragmented Recycling Logistics**: When an item truly reaches the end of its mechanical life, safe disposal and certified closed-loop recycling routes are confusing and opaque.

---

## 2. Our Proposed Solution

R3VIVE replaces guesswork with a **structured, explainable Circular Decision Engine**. By evaluating an item's condition, fault characteristics, age, economic ratios, and user priorities, R3VIVE synthesizes grounded recommendations across the **Five Circular Outcomes**:

```
           [ REPAIR ]
                │
  [ RECYCLE ] ──┼── [ REUSE ]
        │       │       │
    [ REPLACE ] ┴ [ REPURPOSE ]
```

1. **Repair**: Component-level modular swaps, fastener fixes, and specialist bench overhauls to restore factory functionality.
2. **Reuse**: Repositioning functional hardware into secondary domestic roles or transferring to peers and community charities.
3. **Repurpose**: Upcycling sound structural carcasses, timber, or electro-mechanical sub-assemblies into creative functional assets.
4. **Replace**: Targeted eco-upgrades (e.g., BEE 5-star inverter models) or certified refurbished swaps when legacy operation is severely inefficient.
5. **Recycle**: Safe hazardous cell deposition (preventing battery fires) and certified closed-loop smelting to recover 95%+ of pure metallurgy.

---

## 3. Core Features

### Implemented & Foundational
- **Responsive Retro-Terminal Design System**: Consistent high-contrast retro aesthetic featuring tactile borders, monospace metrics, and responsive viewport layouts.
- **Diagnostic Simulator**: Interactive homepage simulator demonstrating real-time circular pathway routing across various item categories and fault conditions.
- **Break-Even & Cost Comparator**: Financial model illustrating repair-to-replacement ratios, payback periods, and embodied carbon avoided.
- **Interactive Outcomes Explorer**: Comprehensive breakdown of all five circular sectors with category-specific criteria and impact potential.

### In Active Development (Subsequent Milestones)
- **Guided 5-Stage Item Assessment**: Deep intake workflow covering item identity, physical defect grading, circumstances, and adaptive diagnostic questions.
- **Radial React Flow Decision Matrix**: Circular interactive tree visualizing the assessed product at the center surrounded by 5 radial outcome sectors and sub-branches.
- **Personalised Decision Intelligence**: Grounded multi-criteria scoring (Safety, Technical Feasibility, Economic Viability, Circular Impact, Priority Match) with honest missing-data handling.
- **Gemini AI Workshop Guidance**: Contextual workshop precautions and technical tips powered by Gemini 3.8 Flash with deterministic fallback.
- **Smart Action Plan & Workshop Checklist**: Step-by-step roadmap with interactive progress tracking, print-ready ink-efficient worksheets, and Supabase cloud sync.
- **Authenticated Cloud Persistence**: Secure user accounts, Row Level Security (RLS) enforcement, and personal circular decision dashboard.

---

## 4. Technology Stack

### Frontend Architecture
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vite.dev/) (with HMR and fast compilation)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom retro brutalist theme extensions
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Graph Visualization**: [@xyflow/react](https://reactflow.dev/) (React Flow)

### Backend Architecture
- **Runtime**: [Python 3.11+](https://www.python.org/)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Async ASGI REST API)
- **Server**: [Uvicorn](https://www.uvicorn.org/) (High-performance ASGI server)
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/)
- **HTTP Client**: [HTTPX](https://www.python-httpx.org/)
- **Generative AI SDK**: [google-genai](https://pypi.org/project/google-genai/) (Gemini 3.8 Flash)

### Cloud Persistence & Security
- **Database**: [Supabase](https://supabase.com/) (Managed PostgreSQL)
- **Security**: PostgreSQL Row Level Security (RLS) policies enforcing strict user-ownership
- **Authentication**: Supabase Auth (JWT bearer token verification with offline HMAC fallback)

---

## 5. Repository Structure

```
R3VIVE/
├── .env.example              # Unified environment configuration reference
├── .gitignore                # Global git ignore rules (secrets, venvs, caches)
├── README.md                 # Root project documentation
├── backend/                  # FastAPI backend service
│   ├── .env.example          # Backend environment variables template
│   ├── requirements.txt      # Python dependencies
│   ├── supabase_schema.sql   # PostgreSQL database schema and RLS policies
│   ├── app/
│   │   ├── auth.py           # JWT token verification and Supabase Auth
│   │   ├── config.py         # App configuration and environment loaders
│   │   ├── main.py           # FastAPI entry point, CORS, and health routes
│   │   ├── routers/          # Route handlers (assessments, decision intelligence)
│   │   └── schemas/          # Pydantic validation models
│   └── tests/                # Automated backend test suite
└── frontend/                 # React + TypeScript client application
    ├── index.html            # HTML entry document
    ├── package.json          # Frontend dependencies and scripts
    ├── vite.config.ts        # Vite build and server configuration
    ├── tsconfig.json         # TypeScript configuration
    ├── public/               # Static assets, favicon, and SVG sprite definitions
    └── src/
        ├── main.tsx          # React application root
        ├── App.tsx           # Router and root component setup
        ├── index.css         # Global styles and Tailwind directives
        ├── components/       # Reusable UI components
        │   ├── home/         # Foundational homepage sections
        │   ├── auth/         # Authentication modal and form elements
        │   ├── assessment/   # Diagnostic intake and circular tree components
        │   └── dashboard/    # User decisions management views
        ├── context/          # React Context providers (AuthContext, AssessmentContext)
        ├── pages/            # Application views (Home, Assess, Dashboard, Auth)
        └── services/         # API client integration (FastAPI + Supabase)
```

---

## 6. Quick Start & Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0 or higher)
- [Python](https://www.python.org/) (v3.11 or higher)
- [Git](https://git-scm.com/)

---

### Step 1: Clone Repository & Environment Setup

```bash
# Clone the repository
git clone https://github.com/Shylad2007/Team-OMEN-CodeVariant.git
cd Team-OMEN-CodeVariant

# Configure environment files
cp .env.example frontend/.env
cp backend/.env.example backend/.env
```

Edit `frontend/.env` and `backend/.env` with your Supabase project URL and anon public key. (Optional: configure `GEMINI_API_KEY` in `backend/.env` for real-time generative guidance).

---

### Step 2: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend application will be live at `http://localhost:5173`.

---

### Step 3: Backend Setup (Optional for Full Stack)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API interactive Swagger documentation will be available at `http://127.0.0.1:8000/docs`.

---

## 7. Development & Verification

### Running Frontend Production Build
```bash
npm --prefix frontend run build
```

### Running Backend Unit Tests
```bash
cd backend
python -m unittest discover tests
```

---

## 8. License & Team

Developed with pride for **CodeVariant Build 01** by **Team OMEN**.

*Rethink. Repair. Reimagine.*
