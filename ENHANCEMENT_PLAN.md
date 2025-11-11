# Prompt Builder Enhancement Plan
**Project**: Optimization History & Comparison Features
**Date**: 2025-01-11
**Purpose**: Portfolio app showcasing AI/LLM skills + useful tool for power users

---

## Executive Summary

This document outlines a comprehensive enhancement plan to transform the Prompt Builder from a basic prompt management tool into a sophisticated prompt optimization platform with full version history, LLM comparison capabilities, and transparency-focused UX.

**Key Principle**: Transparency - Show users exactly what's happening, empower choice, never lose data.

---

## Current State Analysis

### ✅ What Works Well
- Optimization tracking (original_prompt, count, timestamp)
- Usage analytics collection (tokens, costs, latency)
- Auto-save for new prompts
- Edit page works perfectly with promptId

### ❌ Current Pain Points
1. `optimized_with` only shows last LLM used (loses history when optimized multiple times)
2. Users can't see their original input after optimizing
3. Users can't see optimization history if optimized multiple times
4. No way to compare Claude vs ChatGPT optimizations side-by-side
5. Content gets replaced - no "undo" or version history
6. No way to learn which LLM performs better for specific use cases

---

## Product Vision: Optimization History & Comparison

### User Story
> "As a prompt engineer, I want to see how different LLMs optimize my prompts so I can choose the best version, compare approaches, and learn from the differences."

### Value Propositions
1. **Learning Tool** - See how different LLMs approach prompt optimization
2. **Quality Control** - Compare outputs and choose the best version
3. **Version Control** - Never lose a previous version, always can revert
4. **Cost Optimization** - Track which LLM provides better value
5. **Transparency** - Full visibility into the optimization process

---

## Database Schema Enhancement

### New Table: `prompt_optimizations`

Stores complete history of every optimization attempt.

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

  -- Ensure uniqueness: one optimization per version per provider
  UNIQUE(prompt_id, version, provider)
);

-- Indexes for performance
CREATE INDEX idx_prompt_optimizations_prompt_id ON prompt_optimizations(prompt_id, version DESC);
CREATE INDEX idx_prompt_optimizations_user_id ON prompt_optimizations(user_id, created_at DESC);
CREATE INDEX idx_prompt_optimizations_provider ON prompt_optimizations(provider, created_at DESC);

-- Comments
COMMENT ON TABLE prompt_optimizations IS 'Full history of all prompt optimizations for version control and comparison';
COMMENT ON COLUMN prompt_optimizations.version IS 'Version number starting at 1, increments with each optimization attempt';
COMMENT ON COLUMN prompt_optimizations.input_text IS 'The prompt text that was sent to the LLM for optimization';
COMMENT ON COLUMN prompt_optimizations.output_text IS 'The optimized prompt returned by the LLM';
```

### Table Relationships

```
prompts (1) ----< (many) prompt_optimizations
  |
  |-- content: Current active version
  |-- original_prompt: Never changes after first optimization
  |-- optimization_count: Total number of optimizations
  |-- optimized_with: Last LLM used (for quick reference)
  |-- last_optimized_at: Timestamp of most recent optimization

prompt_optimizations
  |-- Each row is one optimization attempt
  |-- version: Sequential version number
  |-- provider: 'anthropic' or 'openai'
  |-- input_text: What we sent
  |-- output_text: What we got back
```

### Benefits
- ✅ Full audit trail of every optimization
- ✅ Can compare Claude vs ChatGPT for same version
- ✅ Can revert to any previous version
- ✅ Can see evolution over time
- ✅ Can analyze which LLM performs better for user's prompts
- ✅ Never lose data

---

## UI/UX Design Proposals

### 1. Edit Page Redesign - Tabbed Interface

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 📝 Prompt Title                                      [★] [Save]  │
├─────────────────────────────────────────────────────────────────┤
│ [Current] [Original] [History] [Compare]                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Current Version (Editable)                                      │
│  [Markdown editor with full content]                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 📊 Metadata:                                                │ │
│  │ • Optimized 3 times                                         │ │
│  │ • Last: Claude Sonnet 4.5 (2 minutes ago)                  │ │
│  │ • Total cost: $0.059 | Total tokens: 4,234                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [🤖 Optimize with Claude] [🤖 Optimize with ChatGPT]          │
│  [🔄 Compare Both LLMs]                                         │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Tab navigation for different views
- Metadata badges showing optimization stats
- Three optimization options (single Claude, single ChatGPT, or compare both)

---

### 2. "Compare Both LLMs" Feature ⭐ NEW

**User Flow:**
1. User clicks "Compare Both LLMs" button
2. System runs optimizations in parallel (both Claude and ChatGPT)
3. Side-by-side comparison view appears
4. User can choose one, both, or neither

**Layout:**
```
┌──────────────────────────────┬──────────────────────────────┐
│   🤖 Claude Sonnet 4.5       │      🤖 GPT-4o              │
├──────────────────────────────┼──────────────────────────────┤
│ [Optimizing... 🔄]           │ [Optimizing... 🔄]           │
│                              │                              │
│ ↓ After completion ↓         │                              │
│                              │                              │
│ [Optimized output text...]   │ [Optimized output text...]   │
│                              │                              │
│ ┌──────────────────────────┐ │ ┌──────────────────────────┐ │
│ │ 📊 Stats:                │ │ │ 📊 Stats:                │ │
│ │ • 1,234 tokens           │ │ │ • 1,156 tokens           │ │
│ │ • $0.018                 │ │ │ • $0.014                 │ │
│ │ • 12.3s                  │ │ │ • 8.7s                   │ │
│ └──────────────────────────┘ │ └──────────────────────────┘ │
│                              │                              │
│ [✅ Use This] [❌ Discard]   │ [✅ Use This] [❌ Discard]   │
└──────────────────────────────┴──────────────────────────────┘
```

**Technical Notes:**
- Run both API calls in parallel using `Promise.all()`
- Don't auto-save either result - let user choose
- User can select Claude version, ChatGPT version, or keep current
- Both get saved to `prompt_optimizations` table regardless of choice
- Only selected version updates `prompts.content`

---

### 3. History Tab - Version Timeline

**Purpose:** Show complete chronological history of all optimizations

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📜 Optimization History                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 📝 Original (Your Input)                                     │
│ ├─ "Write a function that checks if a number is prime"      │
│ ├─ 120 characters                                            │
│ ├─ Created 3 days ago                                        │
│ └─ [View Full] [Copy]                                        │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ 🤖 Version 1 - Claude Sonnet 4.5                            │
│ ├─ "Implement a robust function that efficiently..."        │
│ ├─ 340 characters | 2 days ago                              │
│ ├─ 📊 1,234 tokens | 💵 $0.018 | ⚡ 12.3s                  │
│ └─ [View Full] [Restore] [Compare to Current]                │
│                                                              │
│ 🤖 Version 2 - GPT-4o                                       │
│ ├─ "Create a well-structured function that..."              │
│ ├─ 298 characters | 2 days ago                              │
│ ├─ 📊 1,156 tokens | 💵 $0.014 | ⚡ 8.7s                   │
│ └─ [View Full] [Restore] [Compare to Current]                │
│                                                              │
│ 🤖 Version 3 - Claude Sonnet 4.5                            │
│ ├─ "Develop a comprehensive function with..."               │
│ ├─ 425 characters | 1 hour ago                              │
│ ├─ 📊 1,876 tokens | 💵 $0.027 | ⚡ 15.2s                  │
│ └─ [View Full] [Restore] [Compare to Current] ⭐ Current     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Chronological timeline showing all versions
- Color-coded by provider (Claude = purple, ChatGPT = green)
- Shows input/output text preview (truncated)
- Displays metrics (tokens, cost, latency)
- Actions: View, Restore, Compare
- Current version clearly marked

---

### 4. Original Tab - View Original Input

**Purpose:** Always accessible view of the user's original, unoptimized input

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📝 Your Original Prompt                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [Read-only markdown preview]                                 │
│                                                              │
│ Write a function that checks if a number is prime            │
│                                                              │
│ ────────────────────────────────────────────────────────── │
│                                                              │
│ ℹ️  This is your original input before any AI optimization. │
│    It has been preserved for reference.                      │
│                                                              │
│ 📅 Created: January 8, 2025 at 3:42 PM                      │
│ 📏 Length: 120 characters, 45 words                          │
│                                                              │
│ [Restore as Current] [Copy to Clipboard]                     │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Read-only view (can't accidentally modify original)
- Simple, clean presentation
- Quick actions: Restore, Copy
- Shows creation metadata

---

### 5. Compare Tab - Side-by-Side Diff

**Purpose:** Compare any two versions side-by-side with diff highlighting

**Layout:**
```
┌────────────────────────────┬────────────────────────────┐
│ Version 1 (Claude)         │ Version 3 (Claude)         │
├────────────────────────────┼────────────────────────────┤
│ Implement a robust         │ Develop a comprehensive    │
│ function that              │ function with              │
│ efficiently determines...  │ error handling...          │
│                            │                            │
│ [Added text highlighted]   │ [Modified text highlighted]│
│ [Removed text greyed out]  │                            │
└────────────────────────────┴────────────────────────────┘
```

**Features:**
- Diff highlighting (additions, deletions, changes)
- Can select any two versions to compare
- Helpful for understanding what changed between optimizations

---

## Implementation Phases

### Phase 1: Quick Wins (1-2 days) 🎯 START HERE

**Goal:** Add immediate value with minimal changes

**Tasks:**
1. ✅ Add "View Original" button to edit page
2. ✅ Show optimization metadata badges on edit page
   - Which LLM was used
   - When it was optimized
   - Token count and cost
3. ✅ Simple modal to view original vs current
4. ✅ Add optimization count badge to prompt cards on main page

**Files to Modify:**
- `frontend/src/app/edit/[id]/page.tsx` - Add UI elements
- Create `frontend/src/components/OriginalPromptModal.tsx` - Modal component
- Create `frontend/src/components/OptimizationBadge.tsx` - Metadata display

**Database:** No changes needed - use existing fields

**Benefits:**
- Users can immediately see their original input
- Transparency about which LLM was used
- Low risk, high impact

---

### Phase 2: Full History System (3-5 days) 🏗️

**Goal:** Build complete optimization history tracking

**Tasks:**
1. Create database migration for `prompt_optimizations` table
2. Update optimize API endpoints to save to history table
3. Create API endpoint: `GET /api/prompts/:id/optimizations`
4. Build Version History UI component
5. Implement restore functionality
6. Add version navigation

**Files to Create:**
- `supabase/migrations/010_create_prompt_optimizations_table.sql`
- `frontend/src/app/api/prompts/[id]/optimizations/route.ts`
- `frontend/src/components/VersionHistory.tsx`
- `frontend/src/types/index.ts` - Add `PromptOptimization` type

**Files to Modify:**
- `frontend/src/app/api/optimize/route.ts` - Save to history
- `frontend/src/app/api/optimize-openai/route.ts` - Save to history
- `frontend/src/app/edit/[id]/page.tsx` - Add History tab

**Benefits:**
- Full audit trail of optimizations
- Never lose a version
- Can revert to any previous state

---

### Phase 3: Dual Optimization & Comparison (2-3 days) ⚡

**Goal:** Enable side-by-side LLM comparison

**Tasks:**
1. Create "Compare Both" button on edit page
2. Create new API endpoint: `POST /api/prompts/:id/compare-both`
3. Run Claude and ChatGPT optimizations in parallel
4. Build side-by-side comparison UI
5. Let user select which version to keep
6. Save both to optimization history

**Files to Create:**
- `frontend/src/app/api/prompts/[id]/compare-both/route.ts`
- `frontend/src/components/DualOptimizeView.tsx`
- `frontend/src/components/ComparisonCard.tsx`

**Files to Modify:**
- `frontend/src/app/edit/[id]/page.tsx` - Add Compare Both button
- `frontend/src/components/MarkdownEditor.tsx` - May need to refactor optimize logic

**Benefits:**
- Unique feature - compare LLMs side-by-side
- Data-driven decision making
- Portfolio showcase piece

---

### Phase 4: Polish & Advanced Features (Future) ✨

**Goal:** Make the experience exceptional

**Potential Features:**
1. **Diff View** - Highlight what changed between versions
2. **Merge Tool** - Combine best parts of multiple optimizations
3. **Export History** - Download all versions as JSON/CSV
4. **Analytics Dashboard** - "Your Claude vs ChatGPT stats"
5. **Keyboard Shortcuts** - Power user features
6. **Batch Operations** - Optimize multiple prompts at once
7. **LLM Performance Insights** - Which LLM works better for you

---

## Technical Implementation Details

### Database Migration Strategy

**New Migration File:** `010_create_prompt_optimizations_table.sql`

```sql
BEGIN;

-- Create the optimizations history table
CREATE TABLE prompt_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('anthropic', 'openai')),
  model TEXT NOT NULL,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd DECIMAL(10, 8),
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT NOT NULL,

  UNIQUE(prompt_id, version, provider)
);

-- Indexes
CREATE INDEX idx_prompt_optimizations_prompt_id ON prompt_optimizations(prompt_id, version DESC);
CREATE INDEX idx_prompt_optimizations_user_id ON prompt_optimizations(user_id, created_at DESC);
CREATE INDEX idx_prompt_optimizations_provider ON prompt_optimizations(provider, created_at DESC);

-- Enable RLS
ALTER TABLE prompt_optimizations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own optimization history
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

COMMIT;
```

---

### API Endpoint Design

#### 1. Get Optimization History

```typescript
// GET /api/prompts/:id/optimizations

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();

  const supabase = await createClerkSupabaseClient();

  const { data, error } = await supabase
    .from('prompt_optimizations')
    .select('*')
    .eq('prompt_id', id)
    .order('version', { ascending: true });

  return NextResponse.json({ optimizations: data });
}
```

#### 2. Compare Both LLMs

```typescript
// POST /api/prompts/:id/compare-both

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { prompt } = await request.json();

  // Run both optimizations in parallel
  const [claudeResult, openaiResult] = await Promise.all([
    optimizeWithClaude(prompt, id),
    optimizeWithOpenAI(prompt, id)
  ]);

  // Save both to prompt_optimizations
  // ... save logic ...

  return NextResponse.json({
    claude: claudeResult,
    openai: openaiResult,
    version: newVersion
  });
}
```

#### 3. Restore Version

```typescript
// POST /api/prompts/:id/optimizations/restore/:versionId

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const { id, versionId } = await params;

  // Get the version to restore
  const { data: version } = await supabase
    .from('prompt_optimizations')
    .select('output_text')
    .eq('id', versionId)
    .single();

  // Update prompts.content with this version
  await supabase
    .from('prompts')
    .update({ content: version.output_text })
    .eq('id', id);

  return NextResponse.json({ success: true });
}
```

---

### Component Architecture

```
edit/[id]/page.tsx
├── [Current Tab]
│   ├── MarkdownEditor
│   ├── OptimizationBadge (shows metadata)
│   ├── OptimizeButtons
│   └── DualOptimizeButton
│
├── [Original Tab]
│   └── OriginalPromptView
│       ├── Read-only display
│       └── [Restore] [Copy] buttons
│
├── [History Tab]
│   └── VersionHistory
│       ├── Timeline of all versions
│       └── VersionCard (foreach version)
│           ├── Metadata display
│           └── [View] [Restore] [Compare] buttons
│
└── [Compare Tab]
    └── ComparisonView
        ├── Version selector (dropdown)
        └── SideBySideDiff
```

---

### TypeScript Types

```typescript
// frontend/src/types/index.ts

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

export type ComparisonResult = {
  claude: {
    output: string;
    tokens: number;
    cost: number;
    latency: number;
  };
  openai: {
    output: string;
    tokens: number;
    cost: number;
    latency: number;
  };
  version: number;
};
```

---

## Design Philosophy & UX Principles

### 1. Transparency First
**Principle:** Users should always know what's happening and why.

**Implementation:**
- Show which LLM was used for each optimization
- Display token counts and costs upfront
- Make optimization history easily accessible
- Never hide complexity - embrace it

### 2. Empower Choice
**Principle:** Give users control and let them decide.

**Implementation:**
- Don't auto-replace content - let users preview and choose
- Offer side-by-side comparisons
- Allow easy revert to any previous version
- Provide multiple optimization options

### 3. Learn from Data
**Principle:** Help users understand what works.

**Implementation:**
- Show metrics for every optimization
- Compare LLM performance
- Track costs over time
- Highlight patterns (e.g., "Claude typically adds 40% more tokens")

### 4. Non-Destructive Operations
**Principle:** Never lose user data.

**Implementation:**
- Always preserve original input
- Keep full version history
- Make restore operations easy
- Confirm before destructive actions

### 5. Progressive Disclosure
**Principle:** Show advanced features to power users, keep it simple for beginners.

**Implementation:**
- Default to "Current" tab (simple)
- History and Compare tabs available but not mandatory
- Metadata badges visible but not overwhelming
- Advanced features (diff, merge) can come later

---

## Success Metrics

### Phase 1 Success Criteria
- [ ] Users can view their original prompt
- [ ] Optimization metadata is visible on edit page
- [ ] No bugs or regressions
- [ ] Deploy time < 2 days

### Phase 2 Success Criteria
- [ ] Complete optimization history stored in database
- [ ] Users can view version timeline
- [ ] Users can restore any previous version
- [ ] RLS policies properly restrict access
- [ ] Migration runs successfully
- [ ] No data loss

### Phase 3 Success Criteria
- [ ] Users can run dual optimization (both LLMs at once)
- [ ] Side-by-side comparison view works
- [ ] Both results saved to history
- [ ] User can choose which to keep
- [ ] Parallel API calls complete successfully
- [ ] Loading states are clear

---

## Risk Assessment & Mitigation

### Risk 1: Database Migration Failure
**Probability:** Low
**Impact:** High
**Mitigation:**
- Test migration on dev environment first
- Have rollback plan ready
- Backup data before migration
- Use transactions in migration file

### Risk 2: Complex UI Confuses Users
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Start with simple "View Original" in Phase 1
- Add features progressively
- User testing before Phase 3
- Clear onboarding tooltips

### Risk 3: Performance Issues with Large History
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Add proper indexes on `prompt_optimizations` table
- Paginate history view (show latest 10, load more)
- Use database-level ordering
- Consider archiving very old optimizations

### Risk 4: API Cost Increase (Dual Optimization)
**Probability:** High
**Impact:** Medium
**Mitigation:**
- Make dual optimization opt-in only
- Show cost estimate before running
- Consider rate limiting per user
- Add to usage analytics for monitoring

---

## Future Opportunities

### Analytics Dashboard
Create admin/user dashboard showing:
- Total optimizations run
- Claude vs ChatGPT usage split
- Average cost per optimization
- Most optimized prompts
- Cost savings over time

### Social Features
- Share optimized prompts with community
- Upvote best optimizations
- Leaderboard of most-improved prompts

### Advanced Optimization
- Batch optimize multiple prompts
- A/B test prompts with real usage
- Custom optimization instructions
- Fine-tune on user's preferred style

### Export & Integration
- Export prompts to popular tools (Notion, Obsidian)
- API for programmatic access
- Webhook notifications
- Browser extension

---

## Next Steps

### Immediate Actions (Tomorrow)
1. ✅ Review and approve this plan
2. ✅ Start Phase 1 implementation
   - Add "View Original" button
   - Add optimization metadata badges
   - Create simple modal component
3. ✅ Test on local environment
4. ✅ Deploy Phase 1 to production

### This Week
1. Complete Phase 1 (1-2 days)
2. Begin Phase 2 (database schema + APIs)
3. User testing of Phase 1 features

### Next Week
1. Complete Phase 2 (history system)
2. Begin Phase 3 (dual optimization)
3. Portfolio documentation/screenshots

---

## Questions for Discussion

1. Should we limit the number of versions stored per prompt? (e.g., keep last 10 only)
2. Do we want to show costs to users or just track internally?
3. Should dual optimization be a premium feature?
4. What should happen if one LLM fails but the other succeeds?
5. How should we handle very long optimization histories (100+ versions)?

---

## Technical Decisions Record

### Decision 1: Separate Table vs. JSON Column
**Chosen:** Separate `prompt_optimizations` table
**Reasoning:**
- Better querying performance
- Can add indexes
- Easier to analyze data
- Follows relational database best practices

### Decision 2: Store Both Input & Output
**Chosen:** Store both `input_text` and `output_text`
**Reasoning:**
- Need to know what was sent to LLM
- Can't rely on previous version (might have edited between optimizations)
- Helps with debugging and analytics

### Decision 3: Version Numbering
**Chosen:** Sequential integers starting at 1
**Reasoning:**
- Simple and intuitive
- Easy to order chronologically
- Can have same version number for different providers (e.g., v2-Claude and v2-GPT)

### Decision 4: Dual Optimization Storage
**Chosen:** Save both results to history even if user doesn't choose one
**Reasoning:**
- Full transparency and audit trail
- User might change mind later
- Valuable data for analytics
- Disk space is cheap

---

## Appendix A: Wireframes

See UI/UX Design Proposals section for detailed wireframes.

---

## Appendix B: Database Schema Diagram

```
┌─────────────────┐
│    prompts      │
├─────────────────┤
│ id (PK)         │
│ title           │
│ content         │◄────┐
│ original_prompt │     │
│ optimized_with  │     │
│ optimization_   │     │
│   _count        │     │
│ last_optimized_ │     │
│   _at           │     │
└─────────────────┘     │
                        │
                        │ prompt_id (FK)
                        │
┌─────────────────────────────┐
│  prompt_optimizations       │
├─────────────────────────────┤
│ id (PK)                     │
│ prompt_id (FK) ─────────────┘
│ version                     │
│ provider                    │
│ model                       │
│ input_text                  │
│ output_text                 │
│ tokens_input                │
│ tokens_output               │
│ cost_usd                    │
│ latency_ms                  │
│ created_at                  │
│ user_id                     │
│                             │
│ UNIQUE(prompt_id,           │
│        version,             │
│        provider)            │
└─────────────────────────────┘
```

---

## Appendix C: File Structure

```
promptbuilder/
├── supabase/
│   └── migrations/
│       └── 010_create_prompt_optimizations_table.sql (NEW)
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── api/
│       │   │   └── prompts/
│       │   │       └── [id]/
│       │   │           ├── optimizations/
│       │   │           │   └── route.ts (NEW)
│       │   │           └── compare-both/
│       │   │               └── route.ts (NEW)
│       │   └── edit/
│       │       └── [id]/
│       │           └── page.tsx (MODIFY)
│       │
│       ├── components/
│       │   ├── OriginalPromptModal.tsx (NEW)
│       │   ├── OptimizationBadge.tsx (NEW)
│       │   ├── VersionHistory.tsx (NEW)
│       │   ├── DualOptimizeView.tsx (NEW)
│       │   ├── ComparisonCard.tsx (NEW)
│       │   └── MarkdownEditor.tsx (MODIFY)
│       │
│       └── types/
│           └── index.ts (MODIFY)
│
└── setup/
    └── ENHANCEMENT_PLAN.md (THIS FILE)
```

---

**End of Enhancement Plan**

---

*This document will be updated as we progress through implementation phases.*
