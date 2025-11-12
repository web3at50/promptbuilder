// ============================================================================
// Prompt Types
// ============================================================================

export type Prompt = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  favorite: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  // New optimization tracking fields
  original_prompt: string | null;
  optimized_with: string | null;
  optimization_count: number;
  last_optimized_at: string | null;
};

export type CreatePromptDto = {
  title: string;
  content: string;
  tags?: string[];
  favorite?: boolean;
};

export type UpdatePromptDto = Partial<CreatePromptDto>;

// ============================================================================
// AI Usage Log Types
// ============================================================================

export type AIProvider = 'anthropic' | 'openai';

export type OperationType = 'optimize' | 'generate' | 'analyze' | 'chat';

export type AIUsageLog = {
  id: string;
  user_id: string;
  prompt_id: string | null;
  provider: AIProvider;
  model: string;
  operation_type: OperationType;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  latency_ms: number | null;
  success: boolean;
  error_message: string | null;
  api_message_id: string | null;
  stop_reason: string | null;
  created_at: string;
};

// ============================================================================
// Profile Types
// ============================================================================

export type Profile = {
  id: string; // Clerk user ID
  email: string;
  clerk_username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  clerk_metadata: Record<string, unknown>;
  preferences: Record<string, unknown>;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
};

// ============================================================================
// Prompt Optimization History Types (Phase 2)
// ============================================================================

export type PromptOptimization = {
  id: string;
  prompt_id: string;
  version: number;
  provider: 'anthropic' | 'openai';
  model: string;
  input_text: string;
  output_text: string;
  tokens_input: number | null;
  tokens_output: number | null;
  cost_usd: number | null;
  latency_ms: number | null;
  created_at: string;
  user_id: string;
};

// ============================================================================
// Usage Analytics Types (for dashboards)
// ============================================================================

export type UsageStats = {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  costByProvider: Record<AIProvider, number>;
  tokensByProvider: Record<AIProvider, number>;
  requestsByProvider: Record<AIProvider, number>;
};

export type UsageByDate = {
  date: string;
  cost: number;
  tokens: number;
  requests: number;
};

export type ModelUsageStats = {
  model: string;
  provider: AIProvider;
  requests: number;
  totalCost: number;
  totalTokens: number;
  averageLatency: number;
};
