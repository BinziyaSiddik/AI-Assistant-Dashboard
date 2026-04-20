/**
 * simulateStream.ts
 *
 * Simulates a word-by-word streaming AI response using an async generator.
 * Each yielded value is one word (with a trailing space), mimicking how
 * real SSE / streaming APIs emit chunks.
 *
 * The generator accepts an AbortSignal so the caller can cancel mid-stream:
 *   - Real API path  → aborting closes the HTTP connection (no bandwidth waste).
 *   - Simulation path → the signal.aborted check exits the loop early,
 *     preventing setState calls on an unmounted component.
 *
 * Delay per token: 60–120 ms (randomised to feel more natural).
 */

/** Canned responses keyed by a substring the prompt must contain. */
const RESPONSES: Record<string, string> = {
  help: 'I can help you draft messages, summarise documents, schedule meetings, search your files, and more. Just ask!',
  hello: 'Hello! How can I assist you today?',
  hi: 'Hi there! What can I help you with?',
  summarise: 'Here is a summary: Q2 revenue was up 18% year-over-year, driven primarily by enterprise subscriptions. Operating margin improved by 3 points. The pipeline heading into Q3 looks strong.',
  summary: 'Here is a summary: Q2 revenue was up 18% year-over-year, driven primarily by enterprise subscriptions. Operating margin improved by 3 points. The pipeline heading into Q3 looks strong.',
  schedule: 'I can schedule that for you. Should I send calendar invites to all attendees, or just block your personal calendar first?',
  report:
    'I have drafted the report. It covers key metrics, highlights, and recommendations. Would you like me to send it now, or review it first?',
  approve:
    'Noted. The item has been added to your pending approvals. You can approve or reject it in the Approvals panel on the right.',
  default:
    "I've received your request and I'm processing it now. Let me look into that for you and get back to you shortly.",
};

/**
 * Returns a simulated streaming response for the given prompt.
 *
 * @param prompt   The user's input text.
 * @param signal   AbortSignal from an AbortController — honours cancellation.
 * @yields         One word at a time, with a trailing space.
 */
export async function* simulateStream(
  prompt: string,
  signal: AbortSignal,
): AsyncGenerator<string> {
  // Pick the best matching response key (case-insensitive substring match).
  const lower = prompt.toLowerCase();
  const key =
    Object.keys(RESPONSES).find((k) => k !== 'default' && lower.includes(k)) ??
    'default';

  const words = RESPONSES[key].split(' ');

  for (const word of words) {
    // Honour cancellation — exit the generator without yielding.
    if (signal.aborted) return;

    yield word + ' ';

    // Random delay between 60–120 ms to mimic natural cadence.
    await new Promise<void>((resolve) => setTimeout(resolve, 60 + Math.random() * 60));
  }
}
