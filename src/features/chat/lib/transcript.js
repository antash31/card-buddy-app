// #genai: Turns persisted chat rows into the prose-only chat transcript.

export const AI_UNAVAILABLE_MESSAGE = 'AI is not working right now. Try again later.';

function withoutVerdictText(content, verdictText) {
  const at = content.indexOf(verdictText);
  if (at === -1) return content.trim();
  return `${content.slice(0, at)}${content.slice(at + verdictText.length)}`.trim();
}

/**
 * The server currently uses its deterministic verdict as a fallback when the LLM is unavailable.
 * That is useful for backend safety, but it is not LLM narration and must not appear in this UI.
 */
export function llmAnswerOf(message) {
  const content = message?.content ?? '';
  const verdictText = message?.toolResult?.verdictText;
  if (!verdictText) return content.trim();

  const narration = withoutVerdictText(content, verdictText);
  return narration || AI_UNAVAILABLE_MESSAGE;
}

export function llmAnswerFromLiveText(text, verdict) {
  const content = text?.trim() ?? '';
  if (!content) return '';
  const verdictText = verdict?.verdictText;
  if (!verdictText) return content;

  const narration = withoutVerdictText(content, verdictText);
  return narration || AI_UNAVAILABLE_MESSAGE;
}
