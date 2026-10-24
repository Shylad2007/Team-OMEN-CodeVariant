# R3VIVE

> **Rethink. Repair. Reimagine.**

An interactive circular decision-intelligence platform that guides people through practical, sustainable pathways for damaged or underutilized goods using the tactile **Canvas Action Protocol**.

[![Live Demo](https://img.shields.io/badge/Live_Demo-r3vive.vercel.app-FFE600?style=for-the-badge&logo=vercel&logoColor=black)](https://r3vive-psbjfvrqy-psohanda007-2224.vercel.app/)
[![React](https://img.shields.io/badge/React_19-TypeScript-2A5BFF?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.11-10B25A?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-AI_Guidance-orange?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

🔗 **Live Application:** [https://r3vive-psbjfvrqy-psohanda007-2224.vercel.app/](https://r3vive-psbjfvrqy-psohanda007-2224.vercel.app/)

---

## The Problem

When possessions malfunction or show signs of wear, most people face an unfair choice: decipher cryptic repair manuals, gamble on expensive contractor quotes, or send the item straight to a landfill. Without clear, accessible guidance on whether a product is safely repairable, economically viable to restore, or suitable for secondary use, valuable materials are discarded prematurely. R3VIVE replaces this guesswork with an intuitive, guided experience that clarifies lifecycle trade-offs before an item is thrown away.

---

## What We Built

R3VIVE is an end-to-end circular decision-support engine. Users step through a structured diagnostic intake, evaluate economic break-evens, and explore outcomes arranged radially around their item.

Instead of traditional passive forms and generic submit buttons, R3VIVE introduces the **Canvas Action Protocol**—a tactile, accessible interaction model where actions are physically represented as draggable **Tokens & Execution Capsules** and resolved inside interactive **Action Zones**. Every workflow transition—from pinning pathways to archiving action plans—is intentional, visual, and backed by full keyboard accessibility (`Space` to grab, `Tab` to cycle zones, `Enter` to drop, `Esc` to cancel).

---

## The 5 Circular Pathways

Every assessed item is evaluated against five interconnected circular strategies:

```
          ┌─────────────┐
          │   REPAIR    │ ── Restore functionality via modular fixes & parts swaps
          └─────────────┘
                 │
┌─────────────┐  ┼  ┌─────────────┐
│   RECYCLE   │──┼──│    REUSE    │ ── Transfer intact goods to peers, charities, or secondary roles
└─────────────┘  │  └─────────────┘
                 │
          ┌─────────────┐
          │  REPURPOSE  │ ── Upcycle raw materials & carcasses into new functional items
          └─────────────┘
                 │
          ┌─────────────┐
          │   REPLACE   │ ── Upgrade to certified energy-efficient or refurbished models
          └─────────────┘
```

---

## Core Features

- **Interactive Canvas Action Protocol**: Replace standard button clicks with tactile card-and-zone manipulation. Drag execution capsules, decision tokens, and diagnostic badges into responsive drop targets with real-time drop validation and audio-haptic feedback.
- **Radial Circular Decision Matrix**: Explore a collision-free circular graph powered by React Flow. The assessed product sits at the nucleus, surrounded by five color-coded outcome sectors and category-tailored sub-branches that highlight active recommendations dynamically.
- **Dual-Engine Decision Intelligence**: A mathematical multi-criteria engine weighs safety constraints, repair economics, defect severity, and user urgency. Critical hazards (e.g., swollen lithium cells) automatically gate hazardous repair pathways and prioritize certified recycling.
- **Contextual Gemini AI Workshop Guidance**: When generative AI is connected, Google Gemini provides item-specific workshop tips, safety cautions, and carbon insights. If offline or quota-limited, the system falls back seamlessly to verified deterministic rules.
- **Repair vs. Replace Economic Comparator**: Side-by-side financial analysis factoring in quoted repair costs, replacement retail pricing, estimated lifespan extension, and carbon emissions diverted from manufacture.
- **Smart Action Plans & Persistent Vault**: Step-by-step execution roadmaps with interactive progress tracking, ink-efficient print worksheets, and multi-item cloud sync via Supabase.

---

## Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS (Neo-Brutalist design system), React Router v7, Lucide Icons |
| **Interaction & Graph** | `@xyflow/react` (React Flow), Canvas Action Protocol (HTML5 Drag & Drop + Pointer Events + Keyboard A11y) |
| **Backend API** | FastAPI, Python 3.11+, Uvicorn, Pydantic v2, HTTPX |
| **AI Intelligence** | Google Gemini 2.5/3.6 via official `google-genai` SDK, LRU response cache, deterministic rule fallbacks |
| **Data & Auth** | Supabase (PostgreSQL, Row-Level Security policies, JWT token authentication) |
| **Deployment** | Vercel (Frontend SPA with direct route rewrites), Render (FastAPI Web Service) |

---

## Future Scope

1. **Hyper-Local Repair & Intake Integration**: Connect action plan checklists directly to nearby independent repair cafes, tool libraries, and certified municipal e-waste drop-offs.
2. **Computer Vision Defect Intake**: Allow users to snap photos of damaged components for automated wear-and-tear classification and component identification.
3. **Verified Parts Marketplace**: Link specific repair steps to open-source hardware schematics, 3D-printable replacement brackets, and certified spare parts suppliers.
4. **Aggregated Community Circularity Metrics**: Public dashboard tracking total kilograms of e-waste diverted, repair hours logged, and lifecycle CO₂ emissions saved across all users.

---

## Team & Credits

Built with pride for **CodeVariant — Build 01** by **Team OMEN**.

*Every product deserves a second thought before a second life.*
