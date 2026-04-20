/**
 * streamAi.ts
 *
 * Handles AI streaming by connecting to the real OpenRouter API (Bonus requirement).
 * If no API key is provided in .env, or if the network request fails, it gracefully
 * falls back to the local word-by-word simulation.
 *
 * Both paths fully support cancellation via AbortSignal to prevent memory leaks
 * and save bandwidth when the component unmounts.
 */

// ── Fallback Simulation ────────────────────────────────────────────────────

const RESPONSES: Record<string, string> = {
  help: 'I can help you draft messages, summarise documents, schedule meetings, search your files, and more. Just ask!',
  hello: 'Hello! How can I assist you today?',
  hi: 'Hi there! What can I help you with?',
  summarise: 'Here is a summary: Q2 revenue was up 18% year-over-year, driven primarily by enterprise subscriptions. Operating margin improved by 3 points.',
  summary: 'Here is a summary: Q2 revenue was up 18% year-over-year, driven primarily by enterprise subscriptions. Operating margin improved by 3 points.',
  schedule: 'I can schedule that for you. Should I send calendar invites to all attendees, or just block your personal calendar first?',
  report: 'I have drafted the report. It covers key metrics, highlights, and recommendations. Would you like me to send it now, or review it first?',
  approve: 'Noted. The item has been added to your pending approvals. You can approve or reject it in the Approvals panel on the right.',
  default: "I've received your request and I'm processing it now. Let me look into that for you and get back to you shortly.",
};

async function* fallbackSimulateStream(
  prompt: string,
  signal: AbortSignal,
): AsyncGenerator<string> {
  const lower = prompt.toLowerCase();
  const key = Object.keys(RESPONSES).find((k) => k !== 'default' && lower.includes(k)) ?? 'default';
  const text = RESPONSES[key];

  // Stream character by character for a buttery-smooth typewriter effect
  for (let i = 0; i < text.length; i++) {
    if (signal.aborted) return;
    yield text[i];
    // Very fast delay (10-30ms per character) mimics true LLM token decoding smoothly
    await new Promise<void>((resolve) => setTimeout(resolve, 10 + Math.random() * 20));
  }
}

// ── Real API Implementation (OpenRouter) ───────────────────────────────────

export async function* streamAi(
  prompt: string,
  signal: AbortSignal,
): AsyncGenerator<string> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    yield* fallbackSimulateStream(prompt, signal);
    return;
  }

  try {
    // 1. Initiate fetch request with the AbortSignal
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Assistant Dashboard Task',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
      signal, // Cancels the HTTP connection natively if aborted
    });

    if (!res.ok || !res.body) throw new Error(`API returned ${res.status}`);

    // 2. Parse Server-Sent Events (SSE) stream chunk by chunk
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      if (signal.aborted) {
        reader.cancel();
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // The last line might be incomplete, so we keep it in the buffer
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const parsed = JSON.parse(line.slice(6));
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) yield chunk;
          } catch (e) {
            // Ignore parse errors from malformed partial chunks if any
          }
        }
      }
    }
  } catch (err: any) {
    // If it was cancelled intentionally by the user/unmount, don't fall back, just stop
    if (err.name === 'AbortError') return;
    
    // Otherwise, the API failed (e.g. rate limit, bad key). Explain it and gracefully fall back
    console.warn('Real AI API failed, falling back to simulation:', err);
    yield* fallbackSimulateStream(prompt, signal);
  }
}
