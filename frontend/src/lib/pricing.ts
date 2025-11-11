/**
 * AI Model Pricing Configuration
 *
 * Prices are per token in USD
 * Updated: January 2025
 */

export type AIProvider = 'anthropic' | 'openai';

export interface ModelPricing {
  input: number;  // Cost per input token in USD
  output: number; // Cost per output token in USD
}

export interface ModelInfo {
  provider: AIProvider;
  displayName: string;
  pricing: ModelPricing;
}

/**
 * Model pricing constants
 * Prices are per token in USD
 */
export const MODEL_PRICING: Record<string, ModelInfo> = {
  // Anthropic Models
  'claude-sonnet-4-5-20250929': {
    provider: 'anthropic',
    displayName: 'Claude Sonnet 4.5',
    pricing: {
      input: 0.000003,  // $3.00 per 1M tokens
      output: 0.000015, // $15.00 per 1M tokens
    },
  },
  'claude-3-5-sonnet-20241022': {
    provider: 'anthropic',
    displayName: 'Claude 3.5 Sonnet',
    pricing: {
      input: 0.000003,  // $3.00 per 1M tokens
      output: 0.000015, // $15.00 per 1M tokens
    },
  },
  'claude-3-opus-20240229': {
    provider: 'anthropic',
    displayName: 'Claude 3 Opus',
    pricing: {
      input: 0.000015, // $15.00 per 1M tokens
      output: 0.000075, // $75.00 per 1M tokens
    },
  },
  'claude-3-haiku-20240307': {
    provider: 'anthropic',
    displayName: 'Claude 3 Haiku',
    pricing: {
      input: 0.00000025, // $0.25 per 1M tokens
      output: 0.00000125, // $1.25 per 1M tokens
    },
  },

  // OpenAI Models
  'gpt-4o': {
    provider: 'openai',
    displayName: 'GPT-4o',
    pricing: {
      input: 0.0000025, // $2.50 per 1M tokens
      output: 0.00001,   // $10.00 per 1M tokens
    },
  },
  'gpt-4o-mini': {
    provider: 'openai',
    displayName: 'GPT-4o Mini',
    pricing: {
      input: 0.00000015, // $0.15 per 1M tokens
      output: 0.0000006,  // $0.60 per 1M tokens
    },
  },
  'gpt-4-turbo': {
    provider: 'openai',
    displayName: 'GPT-4 Turbo',
    pricing: {
      input: 0.00001,  // $10.00 per 1M tokens
      output: 0.00003, // $30.00 per 1M tokens
    },
  },
  'gpt-4': {
    provider: 'openai',
    displayName: 'GPT-4',
    pricing: {
      input: 0.00003,  // $30.00 per 1M tokens
      output: 0.00006, // $60.00 per 1M tokens
    },
  },
  'gpt-3.5-turbo': {
    provider: 'openai',
    displayName: 'GPT-3.5 Turbo',
    pricing: {
      input: 0.0000005,  // $0.50 per 1M tokens
      output: 0.0000015, // $1.50 per 1M tokens
    },
  },
} as const;

/**
 * Calculate the cost in USD for an AI API call
 *
 * @param model - Model identifier (e.g., 'claude-sonnet-4-5-20250929', 'gpt-4o')
 * @param inputTokens - Number of input/prompt tokens consumed
 * @param outputTokens - Number of output/completion tokens generated
 * @returns Total cost in USD
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const modelInfo = MODEL_PRICING[model];

  if (!modelInfo) {
    console.error(`Unknown model: ${model}. Cannot calculate cost. Returning 0.`);
    return 0;
  }

  const inputCost = inputTokens * modelInfo.pricing.input;
  const outputCost = outputTokens * modelInfo.pricing.output;
  const totalCost = inputCost + outputCost;

  return totalCost;
}

/**
 * Format cost in USD for display
 *
 * @param cost - Cost in USD
 * @param decimals - Number of decimal places (default: 6 for micro-cents)
 * @returns Formatted string like "$0.001234"
 */
export function formatCost(cost: number, decimals: number = 6): string {
  return `$${cost.toFixed(decimals)}`;
}

/**
 * Calculate cost per 1K tokens for a given model
 * Useful for displaying pricing information to users
 *
 * @param model - Model identifier
 * @returns Object with input and output cost per 1K tokens, or null if model not found
 */
export function getCostPer1KTokens(model: string): { input: string; output: string } | null {
  const modelInfo = MODEL_PRICING[model];

  if (!modelInfo) {
    return null;
  }

  return {
    input: formatCost(modelInfo.pricing.input * 1000, 4),
    output: formatCost(modelInfo.pricing.output * 1000, 4),
  };
}

/**
 * Get provider name from model string
 *
 * @param model - Model identifier
 * @returns Provider name ('anthropic' or 'openai') or null if not found
 */
export function getProviderFromModel(model: string): AIProvider | null {
  const modelInfo = MODEL_PRICING[model];
  return modelInfo ? modelInfo.provider : null;
}

/**
 * Get display name for a model
 *
 * @param model - Model identifier
 * @returns Human-readable model name or the original string if not found
 */
export function getModelDisplayName(model: string): string {
  const modelInfo = MODEL_PRICING[model];
  return modelInfo ? modelInfo.displayName : model;
}

/**
 * Estimate cost before making an API call (rough estimate based on input length)
 * Assumes average output is 2x input tokens
 *
 * @param model - Model identifier
 * @param estimatedInputTokens - Estimated input tokens
 * @param estimatedOutputTokens - Estimated output tokens (optional, defaults to 2x input)
 * @returns Estimated cost in USD
 */
export function estimateCost(
  model: string,
  estimatedInputTokens: number,
  estimatedOutputTokens?: number
): number {
  const outputTokens = estimatedOutputTokens ?? estimatedInputTokens * 2;
  return calculateCost(model, estimatedInputTokens, outputTokens);
}
