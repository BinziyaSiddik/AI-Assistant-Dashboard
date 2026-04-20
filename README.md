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
