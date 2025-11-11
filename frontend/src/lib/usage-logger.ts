/**
 * AI Usage Logger
 *
 * Helper functions to log AI API usage to Supabase for analytics and cost tracking
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { calculateCost, getProviderFromModel } from './pricing';

export type AIProvider = 'anthropic' | 'openai';
export type OperationType = 'optimize' | 'generate' | 'analyze' | 'chat';

/**
 * Usage log data structure
 */
export interface UsageLogData {
  user_id: string;
  prompt_id?: string | null;
  provider: AIProvider;
  model: string;
  operation_type: OperationType;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  latency_ms: number;
  success: boolean;
  error_message?: string | null;
  api_message_id?: string | null;
  stop_reason?: string | null;
}

/**
 * Response structure from Anthropic API
 */
export interface AnthropicMessageResponse {
  id: string;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  content: Array<{ type: string; text: string }>;
  stop_reason: string | null;
}

/**
 * Response structure from OpenAI API
 */
export interface OpenAICompletionResponse {
  id: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    message: {
      role: string;
      content: string | null;
    };
    finish_reason: string | null;
  }>;
}

/**
 * Log AI usage to Supabase ai_usage_logs table
 *
 * @param supabase - Supabase client instance
 * @param data - Usage log data
 * @returns Promise that resolves when log is inserted
 */
export async function logAIUsage(
  supabase: SupabaseClient,
  data: UsageLogData
): Promise<void> {
  try {
    const { error } = await supabase.from('ai_usage_logs').insert({
      user_id: data.user_id,
      prompt_id: data.prompt_id,
      provider: data.provider,
      model: data.model,
      operation_type: data.operation_type,
      input_tokens: data.input_tokens,
      output_tokens: data.output_tokens,
      total_tokens: data.total_tokens,
      cost_usd: data.cost_usd,
      latency_ms: data.latency_ms,
      success: data.success,
      error_message: data.error_message,
      api_message_id: data.api_message_id,
      stop_reason: data.stop_reason,
    });

    if (error) {
      console.error('Failed to log AI usage to database:', error);
      // Don't throw - we don't want to fail the API request if logging fails
    }
  } catch (err) {
    console.error('Exception while logging AI usage:', err);
    // Don't throw - we don't want to fail the API request if logging fails
  }
}

/**
 * Create usage log data from Anthropic API response
 *
 * @param userId - Clerk user ID
 * @param response - Anthropic API response
 * @param latencyMs - API call latency in milliseconds
 * @param promptId - Optional prompt ID if this was a prompt optimization
 * @param operationType - Type of operation (default: 'optimize')
 * @returns Formatted usage log data
 */
export function createAnthropicUsageLog(
  userId: string,
  response: AnthropicMessageResponse,
  latencyMs: number,
  promptId?: string,
  operationType: OperationType = 'optimize'
): UsageLogData {
  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const totalTokens = inputTokens + outputTokens;
  const cost = calculateCost(response.model, inputTokens, outputTokens);

  return {
    user_id: userId,
    prompt_id: promptId || null,
    provider: 'anthropic',
    model: response.model,
    operation_type: operationType,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: totalTokens,
    cost_usd: cost,
    latency_ms: latencyMs,
    success: true,
    api_message_id: response.id,
    stop_reason: response.stop_reason,
  };
}

/**
 * Create usage log data from OpenAI API response
 *
 * @param userId - Clerk user ID
 * @param response - OpenAI API response
 * @param latencyMs - API call latency in milliseconds
 * @param promptId - Optional prompt ID if this was a prompt optimization
 * @param operationType - Type of operation (default: 'optimize')
 * @returns Formatted usage log data
 */
export function createOpenAIUsageLog(
  userId: string,
  response: OpenAICompletionResponse,
  latencyMs: number,
  promptId?: string,
  operationType: OperationType = 'optimize'
): UsageLogData {
  const inputTokens = response.usage.prompt_tokens;
  const outputTokens = response.usage.completion_tokens;
  const totalTokens = response.usage.total_tokens;
  const cost = calculateCost(response.model, inputTokens, outputTokens);

  return {
    user_id: userId,
    prompt_id: promptId || null,
    provider: 'openai',
    model: response.model,
    operation_type: operationType,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: totalTokens,
    cost_usd: cost,
    latency_ms: latencyMs,
    success: true,
    api_message_id: response.id,
    stop_reason: response.choices[0]?.finish_reason || null,
  };
}

/**
 * Create error usage log when API call fails
 *
 * @param userId - Clerk user ID
 * @param provider - AI provider
 * @param model - Model that was attempted
 * @param error - Error message
 * @param latencyMs - Time before failure in milliseconds
 * @param promptId - Optional prompt ID
 * @param operationType - Type of operation (default: 'optimize')
 * @returns Formatted error usage log data
 */
export function createErrorUsageLog(
  userId: string,
  provider: AIProvider,
  model: string,
  error: string,
  latencyMs: number,
  promptId?: string,
  operationType: OperationType = 'optimize'
): UsageLogData {
  return {
    user_id: userId,
    prompt_id: promptId || null,
    provider,
    model,
    operation_type: operationType,
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
    cost_usd: 0,
    latency_ms: latencyMs,
    success: false,
    error_message: error,
  };
}

/**
 * Helper to measure API call latency
 * Usage:
 *   const timer = startTimer();
 *   const response = await api.call();
 *   const latency = timer.stop();
 *
 * @returns Object with stop() method that returns elapsed milliseconds
 */
export function startTimer() {
  const startTime = Date.now();

  return {
    stop: () => Date.now() - startTime,
  };
}
