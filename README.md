# AI Assistant Dashboard

## Overview
A robust, highly performant single-page React application functioning as the frontend for an AI assistant. This application demonstrates real-world UI patterns, including decoupled streaming AI text generation, concurrent animation handling, accessibility compliance, and clean component-driven architecture. 

The application is split into two primary interfaces: an interactive Assistant Chat panel and a state-persistent Pending Approvals management panel.

## Features Implemented

### Core Functionality
* **Dual Panel Layout:** Fully responsive chat and approval panels optimized for varying screen sizes.
* **Streaming AI Architecture:** Implements a decoupled Producer/Consumer buffer system to process Server-Sent Events (SSE). This guarantees a smooth 60fps typewriter effect mapped seamlessly to the React DOM, completely immune to network chunking or latency spikes.
* **Concurrent Event Handling:** Engineers rapid-click safety for approving/rejecting items. Each DOM node maintains independent timer and transition states, allowing users to interact with multiple items simultaneously without data collision or layout shifts.

### Technical & UX Enhancements
* **Strict Type Safety:** Fully typed leveraging TypeScript interfaces with zero fallback to `any`.
* **Accessibility (a11y) Compliant:** Utilizes ARIA live regions (`aria-live="polite"`) for screen-reader announcements, proper DOM roles, and clear focus-visible outlines for keyboard navigability.
* **Data Persistence:** Rehydrates the Pending Approvals state gracefully using `localStorage` synchronization.
* **In-Chat Commands:** Built-in `/approve <action>` chat slash command to dynamically bridge actions from the Chat panel directly into the Approvals queue.

## Getting Started

### Local Installation
1. Install project dependencies:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Navigate to `http://localhost:5173` in your browser.

### Real AI API Integration (Optional)
By default, the application runs a local offline simulation for instantaneous testing. To interface with real live models:
1. Duplicate `.env.example` and rename it to `.env`.
2. Add a valid OpenRouter API key.
3. Restart the development server. The application will automatically detect the key and seamlessly route requests to OpenRouter's live LLM infrastructure, maintaining the same smooth visual streaming effect.

## Technical Architecture

### Component & Data Flow Diagram
```mermaid
graph LR
    %% Define vibrant color classes
    classDef root fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff,rx:8px,ry:8px;
    classDef hooks fill:#10b981,stroke:#064e3b,stroke-width:2px,color:#fff,rx:8px,ry:8px;
    classDef ui fill:#3b82f6,stroke:#1e3a8a,stroke-width:2px,color:#fff,rx:8px,ry:8px;
    classDef external fill:#f59e0b,stroke:#78350f,stroke-width:2px,color:#fff,rx:16px,ry:16px;
    classDef db fill:#8b5cf6,stroke:#4c1d95,stroke-width:2px,color:#fff;

    Root[App.tsx]:::root

    subgraph Hooks & State
        UC[useChat.ts]:::hooks
        UA[useApprovals.ts]:::hooks
        LS[(localStorage)]:::db
    end

    subgraph External Services
        API[streamAi.ts]:::external
        OR([OpenRouter API]):::external
    end

    subgraph UI Panels
        Dash[Dashboard.tsx]:::ui
        CP[ChatPanel.tsx]:::ui
        AP[ApprovalsPanel.tsx]:::ui
        MB[MessageBubble.tsx]:::ui
        AI[ApprovalItem.tsx]:::ui
    end

    Root --> UA
    Root --> UC
    Root --> Dash

    Dash --> CP
    Dash --> AP

    UC --> API
    API <--> OR
    CP --> MB
    
    UA <--> LS
    AP --> AI

    UC -. "/approve command" .-> UA
```

* **Framework:** React + TypeScript scaffolded via Vite for optimized hot-module replacement and rapid bundling.
* **Styling:** CSS Modules with raw CSS variables. This choice explicitly bypasses utility classes (like Tailwind) to demonstrate strong fundamental CSS competency and scope isolation.
* **State Management:** Utilizes localized native React hooks (`useState`, `useRef`, `useEffect`). Global state containers (e.g., Redux) were intentionally avoided to prevent over-engineering a primarily two-panel data flow.

## How I Used AI

I used Claude (via Antigravity) to architect the dashboard's task flow and generate the project structure step-by-step. This allowed me to follow the build process closely and perform manual testing at every stage. When I encountered issues during testing, I used the AI to help troubleshoot and rectify those specific errors. As a final quality check, I verified with the AI that my implementation met every specific requirement listed in the assignment file.

---

## Code Review Questions

### Q1 — Streaming cleanup
**What happens if the user closes the tab or navigates away while a response is still streaming?**
We handle this using an `AbortController`. When the component that handles the chat gets unmounted (which happens when we close the tab or navigate away), the controller sends a cancel signal that stops the streaming. This means the app does not keep trying to stream text into something that no longer exists, which would cause errors like Memory leaks, React state update warnings.

### Q2 — Concurrent actions
**A user approves item A and immediately approves item B before A's exit animation finishes. What does your code do?**
When you click "Approve", the app adds that specific item's ID to a list of `exitingIds`. This triggers the CSS slide-out animation just for that item and starts to delete it from the data. Because every item gets its own independent timer and animation state, clicking multiple items quickly is completely safe. They will all animate and disappear gracefully side-by-side without glitching or crashing into each other.

### Q3 — Your worst trade-off
**What is the weakest part of your implementation — the thing you'd fix first if you had two more hours?**
The weakest part is how I managed the state (the data) across the app. To save time and keep things simple, I just used standard React `useState` and customized hooks to pass data down to the panels. This is perfectly fine for a small two-panel dashboard, but if we decided to add more panels or complex features later, passing props around like this would get messy. With two more hours, I would introduce a lightweight state management tool like Zustand or Redux to make the data easier to share across the whole app.

### Q4 — One thing the AI got wrong
**Describe one specific thing your AI tool suggested or generated that you had to change.**
When the AI first generated the Pending Approvals panel, it did not include any scrolling. So when I tested the app by adding several approval items, the new ones just stacked on top of each other and went off the screen — there was no way to scroll down to see them all. I noticed this during testing and asked the AI to fix it. It added the right overflow and scroll styles to the panel container, which solved the problem. The fix was straightforward once I spotted the issue, but it was something I had to catch myself by actually using the app.
