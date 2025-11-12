# Quick Reference: All User Input Locations

## Files with User Inputs (25 locations)

### FRONTEND COMPONENTS & PAGES

#### Form Input Files
| File | Input Type | Fields | Validation | Risk |
|------|-----------|--------|-----------|------|
| `/src/app/new/page.tsx` | Form | Title, Content, Tags, Favorite | YES | LOW |
| `/src/app/edit/[id]/page.tsx` | Form | Title, Content, Tags, Favorite | YES | LOW |
| `/src/components/MarkdownEditor.tsx` | Textarea | Content (markdown) | YES | LOW |
| `/src/components/PublishPromptModal.tsx` | Modal Form | Title, Description, Category | YES | LOW |

#### Search Input Files
| File | Input Type | Fields | Validation | Risk |
|------|-----------|--------|-----------|------|
| `/src/app/page.tsx` | Search Input | Query (client-side) | N/A | NONE |
| `/src/app/community/page.tsx` | Search Input | Query, Category, Sort | YES | LOW |
| `/src/app/admin/analytics/logs/page.tsx` | Search Input | Query (client-side), Provider | YES | VERY LOW |

#### Analytics & Data Pages
| File | Input Type | Fields | Validation | Risk |
|------|-----------|--------|-----------|------|
| `/src/app/profile/analytics/logs/page.tsx` | Display Only | No inputs | N/A | NONE |
| `/src/app/admin/analytics/logs/page.tsx` | Display + Search | Search term, Provider filter | YES | VERY LOW |

### API ROUTE HANDLERS

#### Prompt Management Endpoints
| Route | Method | File | Accepts | Validation | Auth | Risk |
|-------|--------|------|---------|-----------|------|------|
| `/api/prompts` | POST | `/src/app/api/prompts/route.ts` | title, content, tags, favorite | YES | YES | LOW |
| `/api/prompts` | GET | `/src/app/api/prompts/route.ts` | None | N/A | YES | NONE |
| `/api/prompts/[id]` | GET | `/src/app/api/prompts/[id]/route.ts` | None | N/A | YES | NONE |
| `/api/prompts/[id]` | PUT | `/src/app/api/prompts/[id]/route.ts` | title, content, tags, favorite | YES | YES | LOW |
| `/api/prompts/[id]` | DELETE | `/src/app/api/prompts/[id]/route.ts` | None | N/A | YES | NONE |

#### Publishing Endpoints
| Route | Method | File | Accepts | Validation | Auth | Risk |
|-------|--------|------|---------|-----------|------|------|
| `/api/prompts/[id]/publish` | POST | `/src/app/api/prompts/[id]/publish/route.ts` | description, category | YES | YES | LOW |
| `/api/prompts/[id]/unpublish` | POST | `/src/app/api/prompts/[id]/unpublish/route.ts` | None | N/A | YES | NONE |

#### AI Optimization Endpoints
| Route | Method | File | Accepts | Validation | Auth | Risk |
|-------|--------|------|---------|-----------|------|------|
| `/api/optimize` | POST | `/src/app/api/optimize/route.ts` | prompt, promptId | PARTIAL | YES | LOW |
| `/api/optimize-openai` | POST | `/src/app/api/optimize-openai/route.ts` | prompt, promptId | PARTIAL | YES | LOW |
| `/api/prompts/[id]/compare-both` | POST | `/src/app/api/prompts/[id]/compare-both/route.ts` | prompt, [id] | PARTIAL | YES | LOW |

#### Community Endpoints
| Route | Method | File | Accepts | Validation | Auth | Risk |
|-------|--------|------|---------|-----------|------|------|
| `/api/community/prompts` | GET | `/src/app/api/community/prompts/route.ts` | search, category, sort, page, limit | YES | NO | LOW |
| `/api/community/prompts/[id]` | GET | `/src/app/api/community/prompts/[id]/route.ts` | None | N/A | NO | NONE |
| `/api/community/prompts/[id]/like` | POST | `/src/app/api/community/prompts/[id]/like/route.ts` | None (uses [id]) | YES | YES | LOW |
| `/api/community/prompts/[id]/fork` | POST | `/src/app/api/community/prompts/[id]/fork/route.ts` | None (uses [id]) | YES | YES | LOW |

#### Analytics Endpoints
| Route | Method | File | Accepts | Validation | Auth | Risk |
|-------|--------|------|---------|-----------|------|------|
| `/api/analytics/logs` | GET | `/src/app/api/analytics/logs/route.ts` | None | N/A | YES | NONE |
| `/api/analytics/prompts` | GET | `/src/app/api/analytics/prompts/route.ts` | None | N/A | YES | NONE |
| `/api/analytics/usage` | GET | `/src/app/api/analytics/usage/route.ts` | None | N/A | YES | NONE |
| `/api/analytics/spending` | GET | `/src/app/api/analytics/spending/route.ts` | None | N/A | YES | NONE |
| `/api/analytics/export` | GET | `/src/app/api/analytics/export/route.ts` | None | N/A | YES | NONE |

#### Admin Endpoints
| Route | Method | File | Accepts | Validation | Auth | Risk |
|-------|--------|------|---------|-----------|------|------|
| `/api/admin/check` | GET | `/src/app/api/admin/check/route.ts` | None | N/A | YES | NONE |
| `/api/admin/analytics/logs` | GET | `/src/app/api/admin/analytics/logs/route.ts` | limit | YES | YES | LOW |
| `/api/admin/analytics/users` | GET | `/src/app/api/admin/analytics/users/route.ts` | None | N/A | YES | NONE |
| `/api/admin/analytics/overview` | GET | `/src/app/api/admin/analytics/overview/route.ts` | None | N/A | YES | NONE |
| `/api/admin/analytics/spending` | GET | `/src/app/api/admin/analytics/spending/route.ts` | None | N/A | YES | NONE |
| `/api/admin/analytics/usage` | GET | `/src/app/api/admin/analytics/usage/route.ts` | None | N/A | YES | NONE |

#### Profile Endpoints
| Route | Method | File | Accepts | Validation | Auth | Risk |
|-------|--------|------|---------|-----------|------|------|
| `/api/profile/sync` | POST | `/src/app/api/profile/sync/route.ts` | None (from Clerk) | YES | YES | NONE |
| `/api/profile/sync` | GET | `/src/app/api/profile/sync/route.ts` | None | N/A | YES | NONE |

#### Utility Endpoints
| Route | Method | File | Accepts | Validation | Auth | Risk |
|-------|--------|------|---------|-----------|------|------|
| `/api/prompts/count` | GET | `/src/app/api/prompts/count/route.ts` | None | N/A | YES | NONE |

---

## Validation Functions Location

**File:** `/src/lib/validation.ts`

**Functions:**
- `validatePromptInput()` - Validates title, content, tags
- `validateDescription()` - Validates description field

**Validation Limits:**
- TITLE_MAX_LENGTH: 200
- CONTENT_MAX_LENGTH: 50,000
- DESCRIPTION_MAX_LENGTH: 500
- TAG_MAX_LENGTH: 50
- TAG_MAX_COUNT: 10

---

## Input Attack Surface

### High Risk Inputs: 0
### Medium Risk Inputs: 1
- Unlimited length search queries

### Low Risk Inputs: 10+
- All form inputs (validated)
- All search parameters
- All enumerated selects
- All pagination parameters

---

## Authentication & Authorization

**Clerk Integration:** `@clerk/nextjs/server`
- All protected endpoints check `auth()` before processing
- User ID extracted from Clerk context (not user-controlled)

**Ownership Checks:** Implemented on:
- PUT /api/prompts/[id]
- DELETE /api/prompts/[id]
- POST /api/prompts/[id]/publish
- POST /api/prompts/[id]/compare-both

**Admin Checks:** Implemented on:
- All /api/admin/* endpoints
- Checks Clerk metadata for admin role

---

## Recommended Security Review Checklist

- [ ] All form inputs have max length validation
- [ ] All API endpoints check authentication
- [ ] All mutation endpoints verify ownership
- [ ] All enumerated values use predefined lists
- [ ] All markdown content uses safe renderer (react-markdown)
- [ ] All search queries are parameterized (via Supabase ORM)
- [ ] All ID parameters are validated before use
- [ ] Rate limiting applied to expensive operations
- [ ] Error messages don't expose sensitive data
- [ ] CORS headers are properly configured
- [ ] CSP headers are implemented

