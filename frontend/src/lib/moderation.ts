// Content moderation using OpenAI Moderation API

export const MODERATION_THRESHOLDS = {
  AUTO_APPROVE: 0.3,  // Scores below this auto-approve
  AUTO_REJECT: 0.8,   // Scores above this auto-reject
} as const;

export interface ModerationScores {
  sexual: number;
  'sexual/minors': number;
  hate: number;
  'hate/threatening': number;
  harassment: number;
  'harassment/threatening': number;
  'self-harm': number;
  'self-harm/intent': number;
  'self-harm/instructions': number;
  violence: number;
  'violence/graphic': number;
}

export interface ModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  category_scores: ModerationScores;
}

export interface ModerationDecision {
  status: 'auto_approved' | 'pending' | 'rejected';
  maxScore: number;
  flaggedCategories: string[];
  scores: ModerationScores;
}

/**
 * Call OpenAI Moderation API to check content
 * @param content - Text content to moderate
 * @returns Moderation result from OpenAI
 */
export async function moderateContent(content: string): Promise<ModerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: content,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI Moderation API error:', error);
    throw new Error(`Moderation API failed: ${response.status}`);
  }

  const data = await response.json();
  return data.results[0];
}

/**
 * Analyze moderation result and make a decision
 * @param result - Moderation result from OpenAI
 * @returns Decision on how to handle the content
 */
export function analyzeModerationResult(result: ModerationResult): ModerationDecision {
  const scores = result.category_scores;

  // Find max score and flagged categories
  const scoreEntries = Object.entries(scores);
  const maxScore = Math.max(...scoreEntries.map(([_, score]) => score));

  const flaggedCategories = scoreEntries
    .filter(([_, score]) => score >= MODERATION_THRESHOLDS.AUTO_APPROVE)
    .map(([category]) => category);

  // Determine status based on thresholds
  let status: 'auto_approved' | 'pending' | 'rejected';

  if (maxScore >= MODERATION_THRESHOLDS.AUTO_REJECT) {
    status = 'rejected';
  } else if (maxScore >= MODERATION_THRESHOLDS.AUTO_APPROVE) {
    status = 'pending';
  } else {
    status = 'auto_approved';
  }

  return {
    status,
    maxScore,
    flaggedCategories,
    scores,
  };
}

/**
 * Get user-friendly message for rejected content
 * @param flaggedCategories - Categories that were flagged
 * @returns User-friendly message
 */
export function getRejectionMessage(flaggedCategories: string[]): string {
  return 'This content doesn\'t meet our community guidelines. Please review our content policy and ensure your prompt is appropriate for public sharing.';
}

/**
 * Get user-friendly message for pending review
 * @returns User-friendly message
 */
export function getPendingMessage(): string {
  return 'Your prompt has been submitted and is being reviewed. It will be published shortly after approval.';
}
