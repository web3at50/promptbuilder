# Prompt Builder Enhancement Plan v2
**Project**: Complete Optimization Platform Transformation
**Date**: 2025-01-11
**Purpose**: Portfolio app showcasing AI/LLM skills + powerful tool for prompt engineers

---

## Executive Summary

This comprehensive enhancement plan transforms Prompt Builder from a basic prompt management tool into a **professional-grade prompt engineering platform** with:

- ✅ **Full version history & LLM comparison** (Original Phase 1-3)
- 📊 **Analytics dashboard** showing AI spending and insights
- 🌐 **Public prompt library** for community sharing
- ⚡ **Command palette** for power users
- 📁 **Folders/Collections** for organization at scale
- 🎯 **Prompt templates with variables** for reusability

**Key Principle**: Transparency, empowerment, and community-first design.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Product Vision](#product-vision)
3. [Database Schema Enhancements](#database-schema-enhancements)
4. [Implementation Phases](#implementation-phases)
   - [Phase 1: Quick Wins](#phase-1-quick-wins-1-2-days)
   - [Phase 2: Full History System](#phase-2-full-history-system-3-5-days)
   - [Phase 3: Dual Optimization & Comparison](#phase-3-dual-optimization--comparison-2-3-days)
   - [Phase 4: Analytics Dashboard](#phase-4-analytics-dashboard-3-4-days)
   - [Phase 5: Public Prompt Library](#phase-5-public-prompt-library-5-7-days)
   - [Phase 6: Command Palette](#phase-6-command-palette-2-3-days)
   - [Phase 7: Folders & Collections](#phase-7-folders--collections-3-4-days)
   - [Phase 8: Prompt Templates](#phase-8-prompt-templates-with-variables-4-5-days)
5. [Technical Architecture](#technical-architecture)
6. [Success Metrics](#success-metrics)
7. [Risk Assessment](#risk-assessment)

---

## Current State Analysis

### ✅ What Works Well
- Optimization tracking (original_prompt, count, timestamp)
- Usage analytics collection (tokens, costs, latency)
- Auto-save for new prompts
- Edit page works perfectly with promptId
- Clean UI with dark/light mode
- Search and filtering

### ❌ Current Pain Points
1. `optimized_with` only shows last LLM used (loses history)
2. Users can't see their original input after optimizing
3. No optimization history if optimized multiple times
4. No way to compare Claude vs ChatGPT side-by-side
5. Content gets replaced - no "undo" or version history
6. No organization system for 100+ prompts (flat list)
7. No insights into AI spending or usage patterns
8. No way to share or discover prompts from community
9. No keyboard shortcuts for power users
10. No reusable prompt templates

---

## Product Vision

### User Stories

**Story 1: The Optimizer**
> "As a prompt engineer, I want to see how different LLMs optimize my prompts so I can choose the best version, compare approaches, and learn from the differences."

**Story 2: The Organizer**
> "As a user with 200+ prompts, I need folders and quick search so I can find what I need in seconds, not minutes."

**Story 3: The Data-Driven User**
> "As a cost-conscious professional, I want to track my AI spending and understand which LLM provides better value for my use cases."

**Story 4: The Collaborator**
> "As a team lead, I want to share my best prompts with my team and discover proven prompts from the community."

**Story 5: The Efficiency Expert**
> "As a power user, I want templates and keyboard shortcuts so I can build prompts 10x faster."

### Value Propositions
1. **Learning Tool** - See how different LLMs approach optimization
2. **Quality Control** - Compare outputs and choose the best version
3. **Version Control** - Never lose a previous version, always can revert
4. **Cost Optimization** - Track spending and make data-driven decisions
5. **Transparency** - Full visibility into the optimization process
6. **Organization** - Scale to hundreds of prompts with folders
7. **Community** - Learn from others, share knowledge
8. **Productivity** - Templates and shortcuts for rapid development
9. **Analytics** - Understand your AI usage patterns

---

## Database Schema Enhancements

### New Tables Overview

```
prompts (existing, enhanced)
  ├── prompt_optimizations (NEW - version history)
  ├── collections (NEW - folders/organization)
  ├── prompt_templates (NEW - reusable templates)
  └── community_prompts (NEW - public sharing)
```

---

### Table 1: `prompt_optimizations` (Version History)

**Purpose:** Store complete history of every optimization attempt.

```sql
CREATE TABLE prompt_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('anthropic', 'openai')),
  model TEXT NOT NULL,
  input_text TEXT NOT NULL,  -- What was sent to the LLM
  output_text TEXT NOT NULL, -- What the LLM returned
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd DECIMAL(10, 8),
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT NOT NULL,

  -- Ensure version increments globally per prompt (not per provider)
  CONSTRAINT unique_version_prompt UNIQUE(prompt_id, version)
);

-- Indexes for performance
CREATE INDEX idx_prompt_optimizations_prompt_id ON prompt_optimizations(prompt_id, version DESC);
CREATE INDEX idx_prompt_optimizations_user_id ON prompt_optimizations(user_id, created_at DESC);
CREATE INDEX idx_prompt_optimizations_provider ON prompt_optimizations(provider, created_at DESC);

-- Enable RLS
ALTER TABLE prompt_optimizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own optimization history"
  ON prompt_optimizations FOR SELECT
  TO authenticated
  USING (user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can insert own optimization history"
  ON prompt_optimizations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'::text));

-- Comments
COMMENT ON TABLE prompt_optimizations IS 'Full history of all prompt optimizations for version control and comparison';
COMMENT ON COLUMN prompt_optimizations.version IS 'Global version number per prompt, increments with each optimization';
```

**Key Change from v1:** Version is now globally unique per prompt, not per provider. This prevents confusion.

---

### Table 2: `collections` (Folders/Organization)

**Purpose:** Allow users to organize prompts into folders/collections.

```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',  -- Hex color for visual distinction
  icon TEXT DEFAULT 'folder',     -- Icon name (lucide-react icons)
  sort_order INTEGER DEFAULT 0,   -- For user-defined ordering
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_collection_name_per_user UNIQUE(user_id, name)
);

-- Add collection_id to prompts table
ALTER TABLE prompts ADD COLUMN collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_collections_user_id ON collections(user_id, sort_order);
CREATE INDEX idx_prompts_collection_id ON prompts(collection_id);

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own collections"
  ON collections FOR ALL
  TO authenticated
  USING (user_id = (auth.jwt() ->> 'sub'::text))
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'::text));

-- Comments
COMMENT ON TABLE collections IS 'User-defined folders/collections for organizing prompts';
```

---

### Table 3: `prompt_templates` (Reusable Templates)

**Purpose:** Store reusable prompt templates with variable placeholders.

```sql
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_content TEXT NOT NULL,  -- Contains {{variable}} placeholders
  variables JSONB NOT NULL,         -- Array of variable definitions
  category TEXT,                    -- e.g., 'coding', 'writing', 'analysis'
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,  -- Can be shared to community
  use_count INTEGER DEFAULT 0,      -- Track usage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_template_name_per_user UNIQUE(user_id, name)
);

-- Indexes
CREATE INDEX idx_prompt_templates_user_id ON prompt_templates(user_id, created_at DESC);
CREATE INDEX idx_prompt_templates_public ON prompt_templates(is_public, use_count DESC) WHERE is_public = true;
CREATE INDEX idx_prompt_templates_category ON prompt_templates(category, use_count DESC);

-- Enable RLS
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own templates"
  ON prompt_templates FOR ALL
  TO authenticated
  USING (user_id = (auth.jwt() ->> 'sub'::text))
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Anyone can view public templates"
  ON prompt_templates FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Comments
COMMENT ON TABLE prompt_templates IS 'Reusable prompt templates with variable placeholders';
COMMENT ON COLUMN prompt_templates.template_content IS 'Template text with {{variable_name}} placeholders';
COMMENT ON COLUMN prompt_templates.variables IS 'JSON array: [{"name": "language", "type": "text", "default": "Python", "description": "Programming language"}]';
```

**Example variables JSON:**
```json
[
  {
    "name": "language",
    "type": "text",
    "default": "Python",
    "description": "Programming language",
    "required": true
  },
  {
    "name": "task",
    "type": "textarea",
    "default": "",
    "description": "What the function should do",
    "required": true
  },
  {
    "name": "test_type",
    "type": "select",
    "options": ["unit", "integration", "e2e"],
    "default": "unit",
    "description": "Type of tests to include",
    "required": false
  }
]
```

---

### Table 4: `community_prompts` (Public Sharing)

**Purpose:** Public gallery of shared prompts with engagement metrics.

```sql
CREATE TABLE community_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT,                    -- e.g., 'coding', 'writing', 'marketing'
  like_count INTEGER DEFAULT 0,
  fork_count INTEGER DEFAULT 0,     -- How many times copied
  view_count INTEGER DEFAULT 0,
  share_token TEXT UNIQUE,          -- For public URL
  is_featured BOOLEAN DEFAULT false, -- Admin can feature best prompts
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_public_prompt UNIQUE(prompt_id)
);

-- Track who liked what
CREATE TABLE community_prompt_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_prompt_id UUID NOT NULL REFERENCES community_prompts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_like_per_user UNIQUE(community_prompt_id, user_id)
);

-- Track forks (copies to personal library)
CREATE TABLE community_prompt_forks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_prompt_id UUID NOT NULL REFERENCES community_prompts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  forked_prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_community_prompts_category ON community_prompts(category, like_count DESC);
CREATE INDEX idx_community_prompts_featured ON community_prompts(is_featured, like_count DESC) WHERE is_featured = true;
CREATE INDEX idx_community_prompts_recent ON community_prompts(published_at DESC);
CREATE INDEX idx_community_prompts_popular ON community_prompts(like_count DESC);
CREATE INDEX idx_community_prompt_likes_user ON community_prompt_likes(user_id);

-- Enable RLS
ALTER TABLE community_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community prompts"
  ON community_prompts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can publish own prompts"
  ON community_prompts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can update own published prompts"
  ON community_prompts FOR UPDATE
  TO authenticated
  USING (user_id = (auth.jwt() ->> 'sub'::text));

-- Comments
COMMENT ON TABLE community_prompts IS 'Public gallery of shared prompts';
```

---

### Enhanced `prompts` Table

Add new columns to existing prompts table:

```sql
-- Add new columns
ALTER TABLE prompts ADD COLUMN collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;
ALTER TABLE prompts ADD COLUMN is_template_instance BOOLEAN DEFAULT false;
ALTER TABLE prompts ADD COLUMN template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL;
ALTER TABLE prompts ADD COLUMN share_token TEXT UNIQUE;
ALTER TABLE prompts ADD COLUMN is_public BOOLEAN DEFAULT false;
ALTER TABLE prompts ADD COLUMN view_count INTEGER DEFAULT 0;

-- Index for public prompts
CREATE INDEX idx_prompts_public ON prompts(is_public, created_at DESC) WHERE is_public = true;
```

---

## Implementation Phases

---

## Phase 1: Quick Wins (1-2 days) 🎯

**Goal:** Add immediate value with minimal changes - transparency and metadata display.

### Tasks

#### 1.1 View Original Prompt Feature
- [ ] Create `OriginalPromptModal.tsx` component
  - Modal shows original prompt (read-only)
  - Display creation date and metadata
  - "Restore as Current" button
  - "Copy to Clipboard" button
- [ ] Add "View Original" button to edit page
- [ ] Style with shadcn/ui Dialog component

#### 1.2 Optimization Metadata Display
- [ ] Create `OptimizationBadge.tsx` component
  - Show which LLM was used (with icon)
  - Display "Optimized X times"
  - Show last optimization timestamp (relative)
  - Show total tokens and cost
- [ ] Add badges to edit page header
- [ ] Add optimization count badge to PromptCard on home

#### 1.3 Simple Before/After Comparison
- [ ] Create modal with side-by-side view
- [ ] Left: Original prompt
- [ ] Right: Current (optimized) prompt
- [ ] Show metadata differences

### Files to Create
```
frontend/src/components/OriginalPromptModal.tsx
frontend/src/components/OptimizationBadge.tsx
frontend/src/components/BeforeAfterModal.tsx
```

### Files to Modify
```
frontend/src/app/edit/[id]/page.tsx
frontend/src/components/PromptCard.tsx
```

### Database Changes
**None** - uses existing fields

### Success Criteria
- [ ] Users can view their original prompt
- [ ] Optimization metadata is visible on edit page
- [ ] No bugs or regressions
- [ ] Deploy time < 2 days

---

## Phase 2: Full History System (3-5 days) 🏗️

**Goal:** Build complete optimization history tracking with version timeline.

### Tasks

#### 2.1 Database Migration
- [ ] Create migration `010_create_prompt_optimizations_table.sql`
- [ ] Test migration on local Supabase
- [ ] Run migration on dev environment
- [ ] Backup data before production migration

#### 2.2 API Endpoints
- [ ] Create `GET /api/prompts/[id]/optimizations`
  - Fetch all versions for a prompt
  - Order by version DESC
  - Include pagination (latest 50)
- [ ] Create `POST /api/prompts/[id]/optimizations/restore/[versionId]`
  - Restore a specific version as current
  - Update prompts.content
  - Return success response
- [ ] Modify `POST /api/optimize` to save to history
  - Calculate next version number
  - Save input_text and output_text
  - Save all metadata (tokens, cost, latency)
- [ ] Modify `POST /api/optimize-openai` (same as above)

#### 2.3 Version History UI
- [ ] Create `VersionHistory.tsx` component
  - Timeline view of all versions
  - Show version number, provider, timestamp
  - Display preview of input/output (truncated)
  - Show metrics (tokens, cost, latency)
  - Color-coded by provider (purple for Claude, green for OpenAI)
- [ ] Create `VersionCard.tsx` component
  - Expandable card for each version
  - Actions: View Full, Restore, Compare to Current
  - Badge showing if currently active
- [ ] Add "History" tab to edit page
- [ ] Implement restore functionality with confirmation

#### 2.4 TypeScript Types
- [ ] Add `PromptOptimization` type to `types/index.ts`
- [ ] Add API response types

### Files to Create
```
supabase/migrations/010_create_prompt_optimizations_table.sql
frontend/src/app/api/prompts/[id]/optimizations/route.ts
frontend/src/app/api/prompts/[id]/optimizations/restore/[versionId]/route.ts
frontend/src/components/VersionHistory.tsx
frontend/src/components/VersionCard.tsx
```

### Files to Modify
```
frontend/src/app/api/optimize/route.ts
frontend/src/app/api/optimize-openai/route.ts
frontend/src/app/edit/[id]/page.tsx (add History tab)
frontend/src/types/index.ts
```

### Success Criteria
- [ ] Complete optimization history stored in database
- [ ] Users can view version timeline
- [ ] Users can restore any previous version
- [ ] RLS policies properly restrict access
- [ ] Migration runs successfully
- [ ] No data loss

---

## Phase 3: Dual Optimization & Comparison (2-3 days) ⚡

**Goal:** Enable side-by-side LLM comparison - the killer feature.

### Tasks

#### 3.1 Dual Optimization API
- [ ] Create `POST /api/prompts/[id]/compare-both` endpoint
  - Accept prompt text
  - Run Claude and OpenAI optimizations in parallel using `Promise.all()`
  - Calculate next version number
  - Save both results to `prompt_optimizations` with same version
  - Return both results with metadata
  - Handle partial failures gracefully

#### 3.2 Comparison UI
- [ ] Create `DualOptimizeView.tsx` component
  - Two-column layout
  - Left: Claude optimization (with loading state)
  - Right: OpenAI optimization (with loading state)
  - Show metrics below each (tokens, cost, latency)
  - Action buttons: "Use This", "Discard"
- [ ] Create `ComparisonCard.tsx` component
  - Display optimized text
  - Metadata badges
  - Selection controls
- [ ] Add "Compare Both LLMs" button to edit page
- [ ] Implement selection logic
  - User can choose Claude, OpenAI, or keep current
  - Only selected version updates prompts.content
  - Both saved to history regardless

#### 3.3 Error Handling
- [ ] Handle case where one LLM fails but other succeeds
  - Show partial results
  - Allow user to use successful one
- [ ] Show cost estimate before running
  - "This will cost approximately $0.XX"
  - User confirms before API calls

### Files to Create
```
frontend/src/app/api/prompts/[id]/compare-both/route.ts
frontend/src/components/DualOptimizeView.tsx
frontend/src/components/ComparisonCard.tsx
```

### Files to Modify
```
frontend/src/app/edit/[id]/page.tsx
frontend/src/components/MarkdownEditor.tsx (may need refactoring)
```

### Success Criteria
- [ ] Users can run dual optimization (both LLMs at once)
- [ ] Side-by-side comparison view works
- [ ] Both results saved to history
- [ ] User can choose which to keep
- [ ] Parallel API calls complete successfully
- [ ] Loading states are clear
- [ ] Cost estimate shown before running

---

## Phase 4: Analytics Dashboard (3-4 days) 📊

**Goal:** Visualize AI usage, spending, and insights - make data tangible.

### Tasks

#### 4.1 Analytics API Endpoints
- [ ] Create `GET /api/analytics/overview`
  - Total prompts count
  - Total optimizations count
  - Total cost (all time)
  - Cost this month
  - Most used provider
- [ ] Create `GET /api/analytics/spending`
  - Daily/weekly/monthly cost breakdown
  - Cost by provider (Claude vs OpenAI)
  - Cost trend over time
- [ ] Create `GET /api/analytics/usage`
  - Total tokens used
  - Tokens by provider
  - Average tokens per optimization
- [ ] Create `GET /api/analytics/prompts`
  - Most optimized prompts (top 10)
  - Most expensive prompts
  - Favorite prompts usage

#### 4.2 Analytics Dashboard UI
- [ ] Create `/profile/analytics` page
- [ ] Create `AnalyticsOverview.tsx` component
  - Cards showing key metrics
  - Total spent, optimizations count, avg cost
- [ ] Create `SpendingChart.tsx` component
  - Line chart: spending over time
  - Bar chart: Claude vs OpenAI costs
  - Use Recharts library
- [ ] Create `UsageChart.tsx` component
  - Token usage over time
  - Breakdown by provider
- [ ] Create `TopPromptsTable.tsx` component
  - Table of most optimized prompts
  - Sortable columns
  - Click to navigate to prompt

#### 4.3 Insights & Recommendations
- [ ] Create `InsightsCard.tsx` component
  - "Claude costs you 23% more on average but generates 40% more tokens"
  - "You've saved $12.50 this month compared to last month"
  - "Your most optimized prompt: [title]"
  - "GPT-4o is 15% faster for your use cases"

#### 4.4 Export Analytics
- [ ] Add "Export as CSV" button
- [ ] Generate CSV with all usage logs
- [ ] Include: date, prompt, provider, tokens, cost

### Files to Create
```
frontend/src/app/api/analytics/overview/route.ts
frontend/src/app/api/analytics/spending/route.ts
frontend/src/app/api/analytics/usage/route.ts
frontend/src/app/api/analytics/prompts/route.ts
frontend/src/app/profile/analytics/page.tsx
frontend/src/components/analytics/AnalyticsOverview.tsx
frontend/src/components/analytics/SpendingChart.tsx
frontend/src/components/analytics/UsageChart.tsx
frontend/src/components/analytics/TopPromptsTable.tsx
frontend/src/components/analytics/InsightsCard.tsx
```

### Dependencies
```bash
npm install recharts
npm install @tremor/react  # Alternative: more polished charts
```

### Success Criteria
- [ ] Dashboard shows accurate spending data
- [ ] Charts render correctly with real data
- [ ] Insights are meaningful and actionable
- [ ] Export functionality works
- [ ] Performance is good (< 2s load time)
- [ ] Responsive on mobile

---

## Phase 5: Public Prompt Library (5-7 days) 🌐

**Goal:** Enable community sharing - network effects and portfolio showcase.

### Tasks

#### 5.1 Database Setup
- [ ] Create migration `020_create_community_tables.sql`
  - community_prompts table
  - community_prompt_likes table
  - community_prompt_forks table
- [ ] Add share_token to prompts table
- [ ] Test migration locally

#### 5.2 Publishing API
- [ ] Create `POST /api/prompts/[id]/publish`
  - Validate prompt is owned by user
  - Generate unique share_token
  - Insert into community_prompts
  - Return public URL
- [ ] Create `DELETE /api/prompts/[id]/unpublish`
  - Remove from community_prompts
  - Keep personal copy

#### 5.3 Community Gallery API
- [ ] Create `GET /api/community/prompts`
  - List all public prompts
  - Support filters: category, tags, sort
  - Sort options: recent, popular (likes), trending
  - Pagination (20 per page)
- [ ] Create `GET /api/community/prompts/[id]`
  - Get single public prompt
  - Increment view_count
- [ ] Create `POST /api/community/prompts/[id]/like`
  - Toggle like for current user
  - Update like_count
- [ ] Create `POST /api/community/prompts/[id]/fork`
  - Copy prompt to user's personal library
  - Increment fork_count
  - Return new prompt ID

#### 5.4 Community Gallery UI
- [ ] Create `/community` page
  - Grid layout of public prompts
  - Search and filter controls
  - Category tabs (All, Coding, Writing, Marketing, etc.)
  - Sort dropdown (Recent, Popular, Trending)
- [ ] Create `CommunityPromptCard.tsx` component
  - Display title, description, tags
  - Show author (username/avatar)
  - Show like count, fork count, view count
  - Like button (heart icon)
  - "Fork to My Library" button
  - "View Details" link
- [ ] Create `/community/[id]` detail page
  - Full prompt content
  - Author info
  - Metadata (published date, stats)
  - Comments section (optional - Phase 9)
  - "Fork" and "Like" actions

#### 5.5 Publishing UI
- [ ] Add "Publish to Community" button on edit page
- [ ] Create `PublishPromptModal.tsx`
  - Edit description (required)
  - Select category
  - Preview how it will appear
  - Confirm button
- [ ] Show "Public" badge on PromptCard if published
- [ ] Add "Unpublish" option in prompt menu

#### 5.6 Discovery Features
- [ ] Add "Trending" algorithm
  - Score based on: recent likes, forks, views
  - Decay over time (favor recent activity)
- [ ] Add "Featured" section
  - Admin can manually feature best prompts
  - Rotate weekly

### Files to Create
```
supabase/migrations/020_create_community_tables.sql
frontend/src/app/api/prompts/[id]/publish/route.ts
frontend/src/app/api/prompts/[id]/unpublish/route.ts
frontend/src/app/api/community/prompts/route.ts
frontend/src/app/api/community/prompts/[id]/route.ts
frontend/src/app/api/community/prompts/[id]/like/route.ts
frontend/src/app/api/community/prompts/[id]/fork/route.ts
frontend/src/app/community/page.tsx
frontend/src/app/community/[id]/page.tsx
frontend/src/components/community/CommunityPromptCard.tsx
frontend/src/components/community/PublishPromptModal.tsx
```

### Files to Modify
```
frontend/src/app/edit/[id]/page.tsx (add Publish button)
frontend/src/components/PromptCard.tsx (add public badge)
```

### Success Criteria
- [ ] Users can publish prompts to community
- [ ] Community gallery displays all public prompts
- [ ] Like and fork functionality works
- [ ] Search and filtering work correctly
- [ ] Trending algorithm surfaces good content
- [ ] RLS policies prevent unauthorized access
- [ ] Performance is good with 1000+ prompts

---

## Phase 6: Command Palette (2-3 days) ⚡

**Goal:** Power user feature - keyboard-driven navigation and actions.

### Tasks

#### 6.1 Library Setup
- [ ] Install cmdk library: `npm install cmdk`
- [ ] Configure keyboard shortcut (Cmd/Ctrl + K)

#### 6.2 Command Palette Component
- [ ] Create `CommandPalette.tsx` component
  - Modal overlay (shadcn Dialog)
  - Search input with autofocus
  - Keyboard navigation (up/down arrows)
  - Grouped commands
- [ ] Implement fuzzy search
  - Search across all prompts (title, content, tags)
  - Search commands
  - Highlight matching text

#### 6.3 Command Actions
- [ ] **Navigation Commands**
  - Go to Home
  - Go to New Prompt
  - Go to Profile
  - Go to Analytics
  - Go to Community
- [ ] **Prompt Commands**
  - Jump to any prompt (fuzzy search)
  - Create new prompt
  - Optimize with Claude
  - Optimize with ChatGPT
  - Toggle favorite
- [ ] **Search Commands**
  - Search by tag
  - Filter favorites
  - Filter by collection
- [ ] **Settings Commands**
  - Toggle dark mode
  - Keyboard shortcuts help

#### 6.4 Keyboard Shortcuts
- [ ] Document all shortcuts
- [ ] Create keyboard shortcuts help modal (Cmd/Ctrl + /)
- [ ] Add shortcuts:
  - `Cmd+K` - Open command palette
  - `Cmd+N` - New prompt
  - `Cmd+S` - Save prompt (on edit page)
  - `Cmd+Enter` - Optimize with Claude (on edit page)
  - `Cmd+Shift+Enter` - Optimize with ChatGPT (on edit page)
  - `Cmd+F` - Focus search
  - `Cmd+/` - Show keyboard shortcuts

#### 6.5 Recent Items
- [ ] Track recently viewed prompts (localStorage)
- [ ] Show in command palette
- [ ] Quick access to last 5 prompts

### Files to Create
```
frontend/src/components/CommandPalette.tsx
frontend/src/components/KeyboardShortcutsModal.tsx
frontend/src/hooks/useCommandPalette.ts
frontend/src/lib/keyboard-shortcuts.ts
```

### Files to Modify
```
frontend/src/app/layout.tsx (add CommandPalette globally)
frontend/src/app/edit/[id]/page.tsx (add keyboard shortcuts)
```

### Dependencies
```bash
npm install cmdk
```

### Success Criteria
- [ ] Command palette opens with Cmd+K
- [ ] Fuzzy search works across all prompts
- [ ] Keyboard navigation is smooth
- [ ] All commands execute correctly
- [ ] Recent items appear
- [ ] Shortcuts documented and accessible

---

## Phase 7: Folders & Collections (3-4 days) 📁

**Goal:** Organization system for users with 100+ prompts.

### Tasks

#### 7.1 Database Setup
- [ ] Create migration `030_create_collections_table.sql`
- [ ] Add collection_id to prompts table
- [ ] Test migration

#### 7.2 Collections API
- [ ] Create `GET /api/collections`
  - List all collections for user
  - Include prompt count per collection
  - Order by sort_order
- [ ] Create `POST /api/collections`
  - Create new collection
  - Validate unique name per user
- [ ] Create `PUT /api/collections/[id]`
  - Update name, description, color, icon
- [ ] Create `DELETE /api/collections/[id]`
  - Delete collection
  - Set collection_id to NULL for prompts (don't delete prompts)
- [ ] Create `POST /api/collections/[id]/reorder`
  - Update sort_order for drag-drop

#### 7.3 Assign Prompts to Collections
- [ ] Modify `PUT /api/prompts/[id]`
  - Accept collection_id in body
  - Update prompt's collection
- [ ] Create `POST /api/collections/[id]/prompts`
  - Bulk assign multiple prompts to collection

#### 7.4 Sidebar Navigation
- [ ] Create `CollectionsSidebar.tsx` component
  - Collapsible sidebar on left
  - List all collections
  - Show prompt count per collection
  - Drag-drop to reorder
  - Click to filter prompts
- [ ] Create `CollectionItem.tsx` component
  - Collection name with icon and color
  - Hover actions: Edit, Delete
  - Active state when selected
- [ ] Add "New Collection" button
- [ ] Implement drag-drop with `@dnd-kit/core`

#### 7.5 Collection Management UI
- [ ] Create `CreateCollectionModal.tsx`
  - Name input (required)
  - Description textarea
  - Color picker (predefined colors)
  - Icon picker (Lucide icons)
- [ ] Create `EditCollectionModal.tsx` (same as create)
- [ ] Add collection selector on new/edit prompt pages
  - Dropdown to select collection
  - Option to create new collection inline

#### 7.6 Filtering & Navigation
- [ ] Update homepage to filter by collection
  - URL param: `/prompts?collection=[id]`
  - Show collection name in header
  - Breadcrumb: Home > [Collection Name]
- [ ] Add "Uncategorized" section
  - Show prompts with no collection
  - Quick action to assign to collection

#### 7.7 Drag-Drop Prompts to Collections
- [ ] Implement drag from prompt card to collection in sidebar
- [ ] Visual feedback during drag
- [ ] Update prompt's collection_id on drop

### Files to Create
```
supabase/migrations/030_create_collections_table.sql
frontend/src/app/api/collections/route.ts
frontend/src/app/api/collections/[id]/route.ts
frontend/src/app/api/collections/[id]/prompts/route.ts
frontend/src/app/api/collections/[id]/reorder/route.ts
frontend/src/components/collections/CollectionsSidebar.tsx
frontend/src/components/collections/CollectionItem.tsx
frontend/src/components/collections/CreateCollectionModal.tsx
frontend/src/components/collections/EditCollectionModal.tsx
frontend/src/types/index.ts (add Collection type)
```

### Files to Modify
```
frontend/src/app/page.tsx (add sidebar, filtering)
frontend/src/app/layout.tsx (add sidebar to layout)
frontend/src/app/new/page.tsx (add collection selector)
frontend/src/app/edit/[id]/page.tsx (add collection selector)
frontend/src/app/api/prompts/[id]/route.ts (accept collection_id)
```

### Dependencies
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

### Success Criteria
- [ ] Users can create collections
- [ ] Users can assign prompts to collections
- [ ] Sidebar shows all collections
- [ ] Filtering by collection works
- [ ] Drag-drop reordering works
- [ ] Drag-drop prompts to collections works
- [ ] Delete collection doesn't delete prompts

---

## Phase 8: Prompt Templates with Variables (4-5 days) 🎯

**Goal:** Reusable prompt templates with variable substitution - huge productivity boost.

### Tasks

#### 8.1 Database Setup
- [ ] Create migration `040_create_prompt_templates_table.sql`
- [ ] Add template_id and is_template_instance to prompts table
- [ ] Test migration

#### 8.2 Template Parser
- [ ] Create `lib/template-parser.ts`
  - Parse template content for {{variable}} syntax
  - Extract all variables
  - Validate variable names (alphanumeric + underscore)
  - Replace variables with values
  - Handle missing variables (error or use default)

#### 8.3 Templates API
- [ ] Create `GET /api/templates`
  - List all templates for user
  - Include use_count
  - Filter by category, public status
- [ ] Create `POST /api/templates`
  - Create new template
  - Validate template syntax
  - Parse and store variables
- [ ] Create `GET /api/templates/[id]`
  - Get single template
- [ ] Create `PUT /api/templates/[id]`
  - Update template
  - Reparse variables if content changed
- [ ] Create `DELETE /api/templates/[id]`
  - Delete template
  - Don't delete prompts created from it
- [ ] Create `POST /api/templates/[id]/instantiate`
  - Accept variable values
  - Replace {{variables}} with values
  - Create new prompt from template
  - Increment use_count

#### 8.4 Create Template UI
- [ ] Create `/templates/new` page
  - Template name input
  - Description textarea
  - Category selector
  - Tags input
  - Template editor (like MarkdownEditor)
  - Variable definition panel
    - Auto-detect {{variables}} in content
    - For each variable: type, default, description, required
  - Preview panel showing variables highlighted
  - "Save Template" button
- [ ] Create `VariableDefinitionPanel.tsx` component
  - List of detected variables
  - For each: input fields for metadata
  - Add/remove variables manually
  - Validation

#### 8.5 Template Library UI
- [ ] Create `/templates` page
  - Grid of template cards
  - Search and filter (category, tags)
  - "New Template" button
  - "Browse Public Templates" link
- [ ] Create `TemplateCard.tsx` component
  - Template name, description, tags
  - Show variable count
  - Show use count
  - Actions: Use, Edit, Delete, Publish
- [ ] Click "Use" opens instantiation modal

#### 8.6 Template Instantiation UI
- [ ] Create `InstantiateTemplateModal.tsx`
  - Show template preview
  - Form for each variable:
    - Text input for "text" type
    - Textarea for "textarea" type
    - Select dropdown for "select" type
    - Checkbox for "boolean" type
  - Real-time preview with variables filled
  - "Create Prompt" button
- [ ] After instantiation, redirect to edit page
  - Pre-filled with template content
  - Mark as template instance
  - Link back to template

#### 8.7 Use Template from New Prompt
- [ ] Add "Start from Template" button on `/new` page
- [ ] Opens template picker modal
- [ ] Selecting template opens instantiation flow

#### 8.8 Public Templates
- [ ] Add "Publish Template" button on template edit page
- [ ] Published templates appear in `/community/templates`
- [ ] Users can fork public templates to their library

#### 8.9 Example Templates (Seed Data)
Create sample templates:

**Template 1: Code Function**
```
Write a {{language}} function that {{task}}.

Requirements:
- Include proper error handling
- Add {{test_type}} tests
- Follow {{style_guide}} style guide
- Add inline comments explaining the logic

The function should {{additional_requirements}}.
```

Variables:
- language: text, default: "Python"
- task: textarea, required
- test_type: select [unit, integration, e2e], default: "unit"
- style_guide: select [PEP8, Google, Airbnb], default: "PEP8"
- additional_requirements: textarea

**Template 2: Blog Post Outline**
```
Create a blog post outline about {{topic}} for {{audience}}.

Goals:
- {{goal}}

Tone: {{tone}}
Length: {{word_count}} words

Include:
- Engaging introduction with hook
- {{section_count}} main sections
- Practical examples
- Actionable takeaways
- Conclusion with CTA
```

Variables:
- topic: text, required
- audience: text, default: "general readers"
- goal: textarea, required
- tone: select [professional, casual, friendly, technical], default: "professional"
- word_count: text, default: "1500"
- section_count: text, default: "5"

**Template 3: API Documentation**
```
Generate API documentation for {{endpoint_name}} endpoint.

Method: {{http_method}}
Path: {{api_path}}
Description: {{description}}

Include:
- Request parameters ({{param_type}})
- Response format
- Example request
- Example response
- Error codes
- Rate limiting info
```

Variables:
- endpoint_name: text, required
- http_method: select [GET, POST, PUT, DELETE, PATCH], required
- api_path: text, required
- description: textarea, required
- param_type: select [query, body, path, header], default: "body"

### Files to Create
```
supabase/migrations/040_create_prompt_templates_table.sql
frontend/src/app/api/templates/route.ts
frontend/src/app/api/templates/[id]/route.ts
frontend/src/app/api/templates/[id]/instantiate/route.ts
frontend/src/app/templates/page.tsx
frontend/src/app/templates/new/page.tsx
frontend/src/app/templates/[id]/page.tsx
frontend/src/components/templates/TemplateCard.tsx
frontend/src/components/templates/VariableDefinitionPanel.tsx
frontend/src/components/templates/InstantiateTemplateModal.tsx
frontend/src/components/templates/TemplateEditor.tsx
frontend/src/lib/template-parser.ts
frontend/src/types/index.ts (add Template types)
```

### Files to Modify
```
frontend/src/app/new/page.tsx (add "Start from Template" button)
frontend/src/app/layout.tsx (add Templates link to nav)
```

### Success Criteria
- [ ] Users can create templates with variables
- [ ] Template parser correctly extracts and replaces variables
- [ ] Variable types work correctly (text, textarea, select, boolean)
- [ ] Instantiation creates new prompts correctly
- [ ] Use count increments
- [ ] Public templates can be browsed and forked
- [ ] Validation prevents invalid templates

---

## Technical Architecture

### Stack Overview

```
Frontend:
├── Next.js 15 (App Router)
├── React 19
├── TypeScript
├── Tailwind CSS 4
├── shadcn/ui components
├── Recharts (analytics)
├── cmdk (command palette)
├── @dnd-kit (drag-drop)
└── ReactMarkdown

Backend:
├── Next.js API routes
├── Node.js runtime
├── Anthropic SDK
├── OpenAI SDK
└── Template parser

Database:
├── Supabase PostgreSQL
├── Row Level Security (RLS)
└── Indexes for performance

Authentication:
├── Clerk (user management)
└── Clerk + Supabase integration
```

### API Route Structure

```
/api
├── /prompts
│   ├── GET /            (list all prompts)
│   ├── POST /           (create prompt)
│   ├── /[id]
│   │   ├── GET /        (get single prompt)
│   │   ├── PUT /        (update prompt)
│   │   ├── DELETE /     (delete prompt)
│   │   ├── /optimizations
│   │   │   ├── GET /    (list optimization history)
│   │   │   └── /restore/[versionId]
│   │   │       └── POST / (restore version)
│   │   ├── /compare-both
│   │   │   └── POST /   (dual optimization)
│   │   ├── /publish
│   │   │   └── POST /   (publish to community)
│   │   └── /unpublish
│   │       └── POST /   (unpublish)
├── /optimize
│   └── POST /           (Claude optimization)
├── /optimize-openai
│   └── POST /           (OpenAI optimization)
├── /collections
│   ├── GET /            (list collections)
│   ├── POST /           (create collection)
│   └── /[id]
│       ├── GET /        (get collection)
│       ├── PUT /        (update collection)
│       ├── DELETE /     (delete collection)
│       ├── /prompts
│       │   └── POST /   (bulk assign prompts)
│       └── /reorder
│           └── POST /   (reorder collections)
├── /templates
│   ├── GET /            (list templates)
│   ├── POST /           (create template)
│   └── /[id]
│       ├── GET /        (get template)
│       ├── PUT /        (update template)
│       ├── DELETE /     (delete template)
│       └── /instantiate
│           └── POST /   (create prompt from template)
├── /community
│   └── /prompts
│       ├── GET /        (list public prompts)
│       └── /[id]
│           ├── GET /    (get public prompt)
│           ├── /like
│           │   └── POST / (toggle like)
│           └── /fork
│               └── POST / (fork to library)
└── /analytics
    ├── /overview
    │   └── GET /        (summary stats)
    ├── /spending
    │   └── GET /        (cost breakdown)
    ├── /usage
    │   └── GET /        (token usage)
    └── /prompts
        └── GET /        (top prompts)
```

### Component Hierarchy

```
app/
├── layout.tsx
│   ├── ClerkProvider
│   ├── ThemeProvider
│   ├── CommandPalette (global)
│   └── CollectionsSidebar (on /prompts routes)
├── page.tsx (homepage)
│   ├── SearchBar
│   ├── FilterControls
│   └── PromptCard[] (grid)
├── /new
│   └── page.tsx
│       ├── TemplateSelector (optional)
│       └── MarkdownEditor
├── /edit/[id]
│   └── page.tsx (tabbed interface)
│       ├── [Current Tab]
│       │   ├── MarkdownEditor
│       │   ├── OptimizationBadge
│       │   └── OptimizeButtons
│       ├── [Original Tab]
│       │   └── OriginalPromptView
│       ├── [History Tab]
│       │   └── VersionHistory
│       │       └── VersionCard[]
│       └── [Compare Tab]
│           └── DualOptimizeView
│               └── ComparisonCard (x2)
├── /templates
│   ├── page.tsx (template library)
│   │   └── TemplateCard[]
│   ├── /new
│   │   └── page.tsx
│   │       ├── TemplateEditor
│   │       └── VariableDefinitionPanel
│   └── /[id]
│       └── page.tsx (edit template)
├── /community
│   ├── page.tsx (public gallery)
│   │   └── CommunityPromptCard[]
│   ├── /[id]
│   │   └── page.tsx (prompt detail)
│   └── /templates
│       └── page.tsx (public templates)
├── /profile
│   ├── page.tsx (basic stats)
│   └── /analytics
│       └── page.tsx (analytics dashboard)
│           ├── AnalyticsOverview
│           ├── SpendingChart
│           ├── UsageChart
│           ├── TopPromptsTable
│           └── InsightsCard
└── components/
    ├── PromptCard.tsx
    ├── MarkdownEditor.tsx
    ├── OriginalPromptModal.tsx
    ├── OptimizationBadge.tsx
    ├── BeforeAfterModal.tsx
    ├── VersionHistory.tsx
    ├── VersionCard.tsx
    ├── DualOptimizeView.tsx
    ├── ComparisonCard.tsx
    ├── CommandPalette.tsx
    ├── /collections
    │   ├── CollectionsSidebar.tsx
    │   ├── CollectionItem.tsx
    │   ├── CreateCollectionModal.tsx
    │   └── EditCollectionModal.tsx
    ├── /templates
    │   ├── TemplateCard.tsx
    │   ├── TemplateEditor.tsx
    │   ├── VariableDefinitionPanel.tsx
    │   └── InstantiateTemplateModal.tsx
    ├── /community
    │   ├── CommunityPromptCard.tsx
    │   └── PublishPromptModal.tsx
    └── /analytics
        ├── AnalyticsOverview.tsx
        ├── SpendingChart.tsx
        ├── UsageChart.tsx
        ├── TopPromptsTable.tsx
        └── InsightsCard.tsx
```

### Database Schema Summary

```
prompts (enhanced)
  ├── existing fields...
  ├── collection_id → collections.id
  ├── template_id → prompt_templates.id
  ├── is_template_instance BOOLEAN
  ├── share_token TEXT
  ├── is_public BOOLEAN
  └── view_count INTEGER

prompt_optimizations (NEW)
  ├── id UUID PK
  ├── prompt_id → prompts.id
  ├── version INTEGER
  ├── provider TEXT
  ├── model TEXT
  ├── input_text TEXT
  ├── output_text TEXT
  ├── tokens_input INTEGER
  ├── tokens_output INTEGER
  ├── cost_usd DECIMAL
  ├── latency_ms INTEGER
  ├── created_at TIMESTAMPTZ
  └── user_id TEXT

collections (NEW)
  ├── id UUID PK
  ├── user_id TEXT
  ├── name TEXT
  ├── description TEXT
  ├── color TEXT
  ├── icon TEXT
  ├── sort_order INTEGER
  ├── created_at TIMESTAMPTZ
  └── updated_at TIMESTAMPTZ

prompt_templates (NEW)
  ├── id UUID PK
  ├── user_id TEXT
  ├── name TEXT
  ├── description TEXT
  ├── template_content TEXT
  ├── variables JSONB
  ├── category TEXT
  ├── tags TEXT[]
  ├── is_public BOOLEAN
  ├── use_count INTEGER
  ├── created_at TIMESTAMPTZ
  └── updated_at TIMESTAMPTZ

community_prompts (NEW)
  ├── id UUID PK
  ├── prompt_id → prompts.id
  ├── user_id TEXT
  ├── title TEXT
  ├── description TEXT
  ├── content TEXT
  ├── tags TEXT[]
  ├── category TEXT
  ├── like_count INTEGER
  ├── fork_count INTEGER
  ├── view_count INTEGER
  ├── share_token TEXT
  ├── is_featured BOOLEAN
  ├── published_at TIMESTAMPTZ
  └── updated_at TIMESTAMPTZ

community_prompt_likes (NEW)
  ├── id UUID PK
  ├── community_prompt_id → community_prompts.id
  ├── user_id TEXT
  └── created_at TIMESTAMPTZ

community_prompt_forks (NEW)
  ├── id UUID PK
  ├── community_prompt_id → community_prompts.id
  ├── user_id TEXT
  ├── forked_prompt_id → prompts.id
  └── created_at TIMESTAMPTZ
```

---

## Success Metrics

### Phase 1-3 (Original Features)
- [ ] Users can view original prompt
- [ ] Version history shows all optimizations
- [ ] Dual optimization works correctly
- [ ] No data loss during migrations
- [ ] Performance: page load < 2s

### Phase 4 (Analytics)
- [ ] Dashboard loads in < 2s
- [ ] All charts render correctly
- [ ] Export functionality works
- [ ] Insights are accurate

### Phase 5 (Community)
- [ ] Users can publish prompts
- [ ] Like/fork functionality works
- [ ] Search and filtering perform well (< 500ms)
- [ ] Trending algorithm surfaces good content
- [ ] 100+ public prompts within first month

### Phase 6 (Command Palette)
- [ ] Command palette opens instantly (< 100ms)
- [ ] Fuzzy search returns results < 200ms
- [ ] All keyboard shortcuts work
- [ ] 50% of power users adopt (tracked via analytics)

### Phase 7 (Collections)
- [ ] Users can create unlimited collections
- [ ] Drag-drop works smoothly (60fps)
- [ ] Filtering by collection is instant
- [ ] Average user creates 5+ collections

### Phase 8 (Templates)
- [ ] Template parser handles all edge cases
- [ ] Instantiation creates correct prompts
- [ ] Public templates get forked
- [ ] 20+ templates in public library

### Overall Success
- [ ] **User Retention**: 70% return within 7 days
- [ ] **Engagement**: 50+ prompts per active user
- [ ] **Community**: 500+ published prompts
- [ ] **Portfolio**: Featured on personal website/resume
- [ ] **Technical**: No critical bugs, 99% uptime

---

## Risk Assessment & Mitigation

### Risk 1: Database Migration Failures
**Probability:** Low
**Impact:** Critical
**Mitigation:**
- Test all migrations on local/dev environments first
- Use transactions in migration files (BEGIN/COMMIT)
- Backup production data before each migration
- Have rollback scripts ready
- Test RLS policies thoroughly

### Risk 2: Complex UI Overwhelms Users
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Implement progressive disclosure (hide advanced features initially)
- Add onboarding tooltips for new features
- Keep default view simple (Phase 1 improvements)
- Optional: user testing with 5-10 beta users
- Add "Skip Tour" option

### Risk 3: Performance Degradation
**Probability:** Medium
**Impact:** High
**Mitigation:**
- Add proper database indexes (included in migrations)
- Implement pagination (20 items per page)
- Use database-level filtering/sorting
- Lazy load analytics charts
- Consider Redis caching for community prompts (future)
- Monitor with Vercel Analytics

### Risk 4: API Cost Explosion (Dual Optimization)
**Probability:** High
**Impact:** Medium
**Mitigation:**
- Make dual optimization opt-in only
- Show cost estimate before running: "This will cost ~$0.05"
- Add rate limiting: 10 dual optimizations per day per user
- Track costs in analytics dashboard
- Consider usage limits for free tier

### Risk 5: Low Community Adoption
**Probability:** Medium
**Impact:** Low (doesn't affect core features)
**Mitigation:**
- Seed with 20-30 high-quality templates
- Feature best prompts prominently
- Add social proof (likes, forks, views)
- Share on Twitter/LinkedIn
- Consider adding simple comment system (Phase 9)

### Risk 6: Template Syntax Errors
**Probability:** Medium
**Impact:** Low
**Mitigation:**
- Validate template syntax before saving
- Highlight variables in template editor
- Show parse errors in real-time
- Provide example templates
- Comprehensive error messages

### Risk 7: Scope Creep
**Probability:** High
**Impact:** Medium
**Mitigation:**
- Stick to phased approach (resist adding features mid-phase)
- Timeboxed phases (if Phase X takes > planned time, move to next)
- MVP first, polish later
- Track time spent per phase
- Regular check-ins (end of each phase)

---

## Implementation Timeline

### Optimistic Timeline (Full-time, 8 hours/day)

```
Week 1:
├── Phase 1: Quick Wins (Days 1-2)
├── Phase 2: History System (Days 3-5)
└── Phase 3: Dual Optimization (Days 6-7)

Week 2:
├── Phase 4: Analytics Dashboard (Days 8-11)
└── Phase 5: Community Library (Days 12-14)

Week 3:
├── Phase 6: Command Palette (Days 15-17)
├── Phase 7: Collections (Days 18-20)
└── Phase 8: Templates (Days 21-23)

Week 4:
├── Testing & Bug Fixes (Days 24-26)
├── Documentation (Day 27)
└── Portfolio Presentation (Day 28)
```

### Realistic Timeline (Part-time, 4 hours/day)

```
Month 1:
├── Week 1-2: Phases 1-3
├── Week 3-4: Phase 4

Month 2:
├── Week 5-7: Phase 5
├── Week 8: Phase 6

Month 3:
├── Week 9-10: Phase 7
├── Week 11-12: Phase 8

Month 4:
├── Testing, bug fixes, polish
└── Documentation & portfolio materials
```

---

## Future Opportunities (Phase 9+)

### Phase 9: Advanced Features
- **Batch Operations**: Optimize multiple prompts at once
- **Diff View**: Visual diff between any two versions
- **Merge Tool**: Combine best parts of multiple optimizations
- **A/B Testing**: Test prompts with real usage
- **Custom Optimization Instructions**: User-defined optimization goals
- **Versioning for Templates**: Track template changes

### Phase 10: Integrations & Extensions
- **Browser Extension**: Save prompts from anywhere
- **API Access**: Programmatic prompt management
- **Webhooks**: Notifications for optimization completion
- **Export to Tools**: Notion, Obsidian, Roam Research
- **Import from Tools**: PromptBase, OpenAI Playground
- **Slack/Discord Integration**: Share prompts with team

### Phase 11: Collaboration
- **Team Workspaces**: Share prompts within teams
- **Comments**: Discuss prompts and optimizations
- **Permissions**: View/edit/admin roles
- **Activity Feed**: See what team members are doing
- **Approval Workflow**: Request reviews before publishing

### Phase 12: AI-Powered Features
- **Smart Tagging**: Auto-categorize and tag prompts
- **Related Prompts**: "Users who used this also used..."
- **Quality Scoring**: AI-powered prompt quality assessment
- **Optimization Suggestions**: Proactive improvement recommendations
- **Duplicate Detection**: Find similar prompts to merge
- **Prompt Generation**: AI generates prompts from description

### Phase 13: Enterprise & Monetization
- **Freemium Model**:
  - Free: 50 prompts, 20 optimizations/month, no templates
  - Pro ($9/mo): Unlimited prompts, optimizations, templates, priority support
  - Team ($29/mo): All Pro + team features, shared collections
- **Custom Branding**: White-label for enterprises
- **SSO Integration**: SAML, Okta
- **Audit Logs**: Compliance and security
- **API Keys Management**: Users bring their own OpenAI/Anthropic keys

---

## Documentation & Portfolio Materials

### Technical Documentation
- [ ] README with complete setup instructions
- [ ] API documentation (endpoints, request/response examples)
- [ ] Database schema documentation
- [ ] Deployment guide (Vercel + Supabase)
- [ ] Contributing guide (if open source)

### Portfolio Presentation
- [ ] **Project Overview**: One-page summary with screenshots
- [ ] **Architecture Diagram**: Visual representation of tech stack
- [ ] **Key Features Showcase**: GIFs/videos of unique features
  - Dual optimization comparison
  - Analytics dashboard
  - Command palette
  - Public library
  - Templates with variables
- [ ] **Metrics**: "Managed 1000+ prompts, tracked $500+ in AI spending"
- [ ] **Code Samples**: Highlight interesting implementations
  - Template parser
  - Parallel API optimization
  - RLS policies
- [ ] **Challenges Solved**: Write-up of technical challenges
  - Handling version conflicts
  - Optimizing database queries
  - Real-time preview in template editor

### Blog Posts (Optional)
- "Building a Prompt Engineering Platform with Next.js and Supabase"
- "Comparing Claude vs ChatGPT: Insights from 10,000 Optimizations"
- "Implementing a Command Palette in React: A Deep Dive"
- "Template Variables in TypeScript: Design Patterns and Parser Implementation"

---

## Appendix A: TypeScript Types Reference

```typescript
// Complete type definitions

export type Prompt = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  favorite: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  original_prompt: string | null;
  optimized_with: string | null;
  optimization_count: number;
  last_optimized_at: string | null;
  collection_id: string | null;
  template_id: string | null;
  is_template_instance: boolean;
  share_token: string | null;
  is_public: boolean;
  view_count: number;
};

export type PromptOptimization = {
  id: string;
  prompt_id: string;
  version: number;
  provider: 'anthropic' | 'openai';
  model: string;
  input_text: string;
  output_text: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  latency_ms: number;
  created_at: string;
  user_id: string;
};

export type Collection = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  prompt_count?: number; // Computed field
};

export type PromptTemplate = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  template_content: string;
  variables: TemplateVariable[];
  category: string | null;
  tags: string[];
  is_public: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
};

export type TemplateVariable = {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'boolean' | 'number';
  default?: string | boolean | number;
  description?: string;
  required: boolean;
  options?: string[]; // For select type
};

export type CommunityPrompt = {
  id: string;
  prompt_id: string;
  user_id: string;
  title: string;
  description: string | null;
  content: string;
  tags: string[];
  category: string | null;
  like_count: number;
  fork_count: number;
  view_count: number;
  share_token: string;
  is_featured: boolean;
  published_at: string;
  updated_at: string;
  author?: {
    username: string;
    avatar_url: string;
  };
  is_liked_by_user?: boolean; // Computed field
};

export type AnalyticsOverview = {
  total_prompts: number;
  total_optimizations: number;
  total_cost: number;
  cost_this_month: number;
  most_used_provider: 'anthropic' | 'openai';
  total_tokens: number;
};

export type SpendingData = {
  date: string;
  anthropic: number;
  openai: number;
  total: number;
}[];

export type UsageData = {
  date: string;
  tokens: number;
  cost: number;
}[];

export type TopPrompt = {
  id: string;
  title: string;
  optimization_count: number;
  total_cost: number;
  total_tokens: number;
  last_optimized_at: string;
};

export type ComparisonResult = {
  version: number;
  claude: {
    id: string;
    output: string;
    tokens_input: number;
    tokens_output: number;
    cost: number;
    latency: number;
  };
  openai: {
    id: string;
    output: string;
    tokens_input: number;
    tokens_output: number;
    cost: number;
    latency: number;
  };
};
```

---

## Appendix B: Environment Variables

```env
# Existing
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# New (optional)
NEXT_PUBLIC_APP_URL=https://promptbuilder.app  # For share links
RATE_LIMIT_MAX_REQUESTS=100  # Per hour per user
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour
COMMUNITY_FEATURED_COUNT=10  # Number of featured prompts
```

---

## Appendix C: Migration Order

Execute in this exact order:

```
1. 010_create_prompt_optimizations_table.sql
2. 020_create_community_tables.sql
3. 030_create_collections_table.sql
4. 040_create_prompt_templates_table.sql
5. 050_add_prompt_enhancements.sql (add collection_id, template_id, etc.)
```

Each migration should be idempotent (can run multiple times safely).

---

## Conclusion

This enhanced plan transforms Prompt Builder into a **comprehensive prompt engineering platform** that showcases:

1. **Backend Skills**: Complex database schema, API design, RLS policies
2. **Frontend Skills**: Advanced React patterns, state management, UI/UX
3. **AI Integration**: Multiple LLM providers, cost tracking, optimization
4. **Full-Stack Features**: Authentication, multi-tenancy, real-time updates
5. **Product Thinking**: User-centric design, analytics, community features
6. **Scalability**: Proper indexing, pagination, performance optimization

### Unique Differentiators for Portfolio:

✅ **Dual LLM Comparison** - No other tool does this
✅ **Analytics Dashboard** - Data-driven insights
✅ **Template Variables** - Reusable, professional-grade
✅ **Community Library** - Network effects
✅ **Command Palette** - Power user features
✅ **Full Version History** - Professional version control

This is a **portfolio-worthy project** that demonstrates both technical depth and product design skills.

---

**Ready to build? Let's start with Phase 1!** 🚀

---

*Document Version: 2.0*
*Last Updated: 2025-01-11*
*Status: Ready for Implementation*
