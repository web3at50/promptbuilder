# Security Overview

PromptBuilder implements multiple layers of security to protect user data and prevent abuse. This document provides a high-level overview of the security measures in place.

---

## Authentication & Authorization

### User Authentication
- **Clerk Authentication** with email/password and Google OAuth
- Secure session management with automatic token refresh
- Email verification for new accounts (configurable)
- Multi-factor authentication support (available through Clerk)

### Role-Based Access Control (RBAC)
- Admin roles stored in Clerk public metadata
- Middleware protection for admin routes (`/admin/*`)
- Server-side authorization checks on all admin endpoints
- Three-tier authorization: `isAdmin()`, `requireAdmin()`, `getAdminStatus()`

### Session Security
- Secure session tokens integrated between Clerk and Supabase
- Automatic session validation on protected routes
- Token expiry and refresh handling
- No JWT template required (using Clerk's 2025 native Supabase integration)

---

## Database Security

### Row Level Security (RLS)
- **User-scoped policies** on all tables - users can only access their own data
- Enforced at the database level (Supabase PostgreSQL)
- Four policy types: SELECT, INSERT, UPDATE, DELETE
- Separate admin policies for elevated access to community content

### Admin-Specific Policies
- `is_admin()` database function checks JWT claims
- Admins can view and moderate all community prompts
- Moderation-specific field update policies
- Admin actions logged for audit trail

### Data Isolation
- Complete data separation per user account
- No cross-user data leakage possible
- Multi-tenant architecture with user_id scoping
- Foreign key constraints maintain data integrity

---

## Input Validation

### Field Length Limits
All user inputs are validated with strict maximum lengths:
- **Titles**: 200 characters max
- **Prompt Content**: 50,000 characters max
- **Descriptions**: 500 characters max
- **Tags**: 10 tags max, 50 characters each
- **Search Queries**: 1,000 characters max

### Validation Functions
- `validatePromptInput()` - Multi-field validation with detailed error reporting
- `validateDescription()` - Single field validation for community prompts
- Server-side validation on all API endpoints
- Client-side validation for immediate user feedback

### Sanitization
- Automatic whitespace trimming
- Special character handling for CSV exports
- React's built-in XSS protection for rendered content
- Prepared statements prevent SQL injection

---

## Rate Limiting

### User Quotas
- **Regular Users**: Limited to 10 prompts maximum
- **Admin Users**: Unlimited prompt creation
- Enforced with `canCreate` flag on prompt creation
- Friendly notifications when limits are reached

### API Protection
- Pre-creation checks prevent quota bypass
- Database-level constraints as backup
- Clear error messages guide users to upgrade paths
- Rate limit tracking per user account

---

## Content Moderation

### AI-Powered Safety Scanning
- **OpenAI Moderation API** with 11-category safety scoring
- Automatic content scanning on community prompt publication
- Categories: sexual, hate, harassment, self-harm, violence (and subcategories)

### Automated Moderation Thresholds
- **Score < 0.3**: Auto-approved (instant publication)
- **0.3 to 0.8**: Pending review (flagged for admin)
- **Score > 0.8**: Auto-rejected (user notification)
- Thresholds are easily customizable in `/frontend/src/lib/moderation.ts`

### Admin Review System
- Color-coded score indicators (green, yellow, red)
- Detailed score breakdown by category
- Admin approval/rejection with notes
- Full moderation history tracking

### Fail-Safe Design
- If moderation API fails, defaults to admin review (not auto-approve)
- Graceful error handling prevents blocking legitimate content
- All moderation decisions logged for audit

---

## API Security

### Request Validation
- **CSRF Protection**: Built-in Next.js protection via server actions
- **HTTP Method Restrictions**: Proper use of POST, PUT, DELETE
- **Authentication Required**: All API routes verify user session
- **Authorization Checks**: User ownership verified on data access

### Field-Level Authorization
Update operations only allow specific fields to be modified:
- **Allowed**: title, content, tags, favorite status
- **Protected**: user_id, created_at, share_token, is_public
- Prevents privilege escalation and data tampering

### Error Handling
- Consistent error messages (no information leakage)
- Server-side logging of exceptions
- Failed API calls don't expose stack traces
- Generic user-facing error messages

---

## Data Privacy

### User Data Isolation
- Each user can only access their own prompts and data
- Community prompts visible to all, but modifiable only by owner
- Usage logs are user-scoped
- Analytics data aggregated without exposing individual user info

### Data Retention
- User data persisted until account deletion
- Usage logs maintained for analytics and billing
- Soft deletes for audit trail (where applicable)
- GDPR-compliant data handling

### Third-Party Services
- **Clerk**: Authentication and session management
- **Supabase**: Database hosting with built-in security
- **Anthropic & OpenAI**: AI model API calls (prompt content sent)
- No user data sold or shared beyond operational requirements

---

## Additional Security Measures

### Environment Security
- Sensitive API keys stored in environment variables
- `.env.local` files excluded from version control
- Separate keys for development and production
- Server-side only API calls (keys never exposed to client)

### Token Security
- Unique share tokens for public prompt URLs (nanoid 12-character)
- Tokens are cryptographically random and unpredictable
- No predictable patterns in generated URLs
- Share tokens only grant read access to specific prompts

### Logging & Monitoring
- Comprehensive API usage logging (15+ fields per request)
- Success and failure rates tracked
- Anomaly detection via admin analytics
- Error logs for debugging and security review

---

## Known Limitations

This is a portfolio/demonstration project and has some limitations:

- **No Enterprise SSO**: Currently supports email/password and Google OAuth only
- **Basic Rate Limiting**: Simple prompt count limit, not API request rate limiting
- **Moderation Scope**: Only applied to community prompts, not private prompts
- **No WAF**: Web Application Firewall not implemented (could be added via Cloudflare/Vercel)
- **Single Region**: Deployed in one region (Vercel + Supabase default regions)

---

## Security Best Practices Followed

✅ Defense in depth (multiple security layers)
✅ Principle of least privilege (user-scoped access)
✅ Input validation at multiple layers
✅ Secure defaults (RLS enabled, validation required)
✅ Authentication and authorization separation
✅ Error handling without information leakage
✅ Audit trail via logging
✅ Third-party security services (Clerk, Supabase)
✅ Environment variable protection
✅ HTTPS enforcement (via Vercel)

---

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

**Email**: support@syntorak.com
**Subject**: [SECURITY] PromptBuilder - [Brief Description]

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We take security seriously and will respond to all reports within 48 hours.

---

## References

For more technical details, see the following files in the codebase:
- `/frontend/src/lib/admin.ts` - RBAC implementation
- `/frontend/src/lib/validation.ts` - Input validation rules
- `/frontend/src/lib/moderation.ts` - Content moderation configuration
- `/frontend/src/middleware.ts` - Route protection
- `/supabase/migrations/` - Database security policies (26 migrations)

---

**Last Updated**: 2025-11-13
**Version**: 1.0
