# AI Assistant Dashboard

A robust, single-page React frontend for an AI assistant. This application demonstrates real-world UI patterns including streaming AI text, concurrent animation handling, accessibility features, and clean component isolation.

## 🚀 Quick Start (Under 2 Minutes)

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the dev server:**
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

> **Optional: Real AI API (Bonus)**  
> By default, the app uses a seamless local simulation for the AI streaming so it works immediately offline. To use the real streaming API, copy `.env.example` to `.env` and add a free [OpenRouter API key](https://openrouter.ai/).

---

## ✨ Features Implemented

* **Must Have** ✅
  * Two fully functional, responsive panels (Chat and Pending Approvals).
  * Streaming AI simulation parsing token-by-token.
  * Rapid-click safe fade/slide animations for approving/rejecting items.
* **Should Have** ✅
  * Fully typed with TypeScript (Zero uses of `any`).
  * Accessible: ARIA live regions for screen-reader announcements, proper focus-visible rings, keyboard navigability.
  * Chat auto-scrolls naturally as tokens stream in.
* **Bonuses** ✅
  * Connects to a real live OpenRouter API with graceful fallback to simulation.
  * Employs `localStorage` to perfectly persist pending approvals across reloads.
  * Built-in `/approve <action>` chat slash command to dynamically add items to the approval queue.

---

## 🛠 Tech Stack & Decisions

* **Vite + React + TypeScript:** Scaffolded from scratch for speed and strong typing.
* **CSS Modules:** Used over styled-components or Tailwind to demonstrate raw CSS competency. Design tokens are stored natively in `index.css` via CSS variables.
* **No State Libraries:** A combination of native `useState`, `useRef`, and `useEffect` was sufficient. Redux/Zustand would be over-engineering for a two-panel data flow.

---

## 🤖 How I used AI

I used Google's DeepMind AI Assistant as a collaborative pair-programmer throughout this build. 
* **What I asked for:** I had it scaffold the boilerplate Vite structure, draft the core CSS layout grid, and assist in scaffolding the custom hook structures.
* **Direct acceptance:** I accepted its generation of basic design tokens (matching the mockup hex codes) and basic interface typings.
* **Modification:** I heavily modified its approach to concurrent animations and state tracking, specifically enforcing the `AbortController` implementation for network management.

---

## 📝 Code Review Questions

### Q1 — Streaming cleanup
**What happens if the user closes the tab or navigates away while a response is still streaming?**
We manage the streaming request using an `AbortController` stored via `useRef` inside the `useChat` custom hook. In the `useEffect` cleanup return, we execute `abortControllerRef.current?.abort()`. For our real network fetch to OpenRouter, passing this specific signal forcefully terminates the native network connection and halts SSE events, fully preventing bandwidth waste and memory leaks. In our fallback simulation, the async generator loop explicitly checks `signal.aborted` and exits early before executing further `setTimeout` operations.

### Q2 — Concurrent actions
**A user approves item A and immediately approves item B before A's exit animation finishes. What does your code do?**
Each `ApprovalItem` independently manages its own transition status. The `useApprovals` hook tracks an `exitingIds` dataset (`Set<string>`). When a user clicks "Approve", the specific ID is added to the Set, triggering the CSS `.exiting` transition on that node uniquely while firing an isolated `setTimeout`. Rapid clicks on multiple items stack independent timeouts natively, causing them to safely step through concurrent layout transitions without data collision or layout glitching.

### Q3 — Your worst trade-off
**What is the weakest part of your implementation — the thing you'd fix first if you had two more hours?**
The weakest part is inside `src/utils/streamAi.ts`, specifically how the SSE (Server-Sent Events) chunks are parsed over the `while (true)` loop. Even though I utilized an accumulating buffer string piece (`buffer = lines.pop() ?? ''`) to catch incomplete chunks from network partitions, rolling a custom stream text decoder logic manually is error-prone. With two more hours, I'd bring in a dedicated library like `@microsoft/fetch-event-source` which natively handles enterprise edge-cases like connection retries, 50x handling, and complex JSON delta splices.

### Q4 — One thing the AI got wrong
**Describe one specific thing your AI tool suggested or generated that you had to change.**
During the styling of the Approvals panel, the AI initially suggested a simplistic `display: flex; flex-direction: column` wrapping a scrollable list, relying solely on CSS transitions on height properties. However, it forgot fundamental CSS Flexbox calculations. Because default Flexbox parameters apply `flex-shrink: 1` to children, when I dynamically added additional queue items, the individual elements squished together inside the flex container overlaying each other, completely ignoring standard bounds sizing. I manually had to correct `src/components/ApprovalsPanel/ApprovalItem.module.css` to assign `flex-shrink: 0;` forcing the layout list to strictly obey intrinsic height declarations and properly activate scrollbars.
