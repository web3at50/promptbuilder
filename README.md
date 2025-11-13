# PromptBuilder AI

**Live Site**: [promptbuilderai.xyz](https://www.promptbuilderai.xyz/)

A modern AI prompt management platform with multi-AI comparison, smart content moderation, and powerful analytics. Built to showcase full-stack development capabilities including authentication, role-based access control, community features, and real-time data visualization.

## What It Does

PromptBuilder helps you create, optimize, and manage AI prompts with support for both Claude and ChatGPT. Run prompts through multiple AIs simultaneously to compare results, track version history, share prompts with the community, and get detailed analytics on your usage and costs. The platform includes a comprehensive admin system with AI-powered content moderation and usage analytics.

---

## Featured Highlights

### 1. Compare AI Models Side-by-Side

![Dual AI Comparison](screenshots/01-dual-comparison.png)

Run your prompt through both Claude and ChatGPT at the same time and see which AI gives you better results. Perfect for finding the right AI for your specific use case. Each comparison is saved in your version history so you can track what works best.

**Key Features:**
- Parallel execution of Claude Sonnet 4.5 and GPT-4o
- Side-by-side result comparison
- Automatic version tracking for both results
- Cost and performance metrics for each provider

---

### 2. Smart AI Moderation

![Moderation Dashboard](screenshots/02-moderation-dashboard.png)

When users share prompts to the community, OpenAI automatically scores them for safety across 11 categories. Low-risk prompts go live instantly, questionable ones get flagged for admin review, and harmful content is auto-rejected. The thresholds are easily customizable to get the right balance.

**How It Works:**
- **Score < 0.3**: Auto-approved (instant publish)
- **0.3 to 0.8**: Pending review (admin required)
- **Score > 0.8**: Auto-rejected (user notification)
- Color-coded score indicators (green, yellow, red)
- Admin can approve/reject with notes
- Configurable thresholds for different moderation levels

---

### 3. Community Prompt Library

![Community Gallery](screenshots/03-community-gallery.png)

Browse and fork prompts shared by other users. Filter by category (Coding, Writing, Marketing, etc.), search for specific topics, and like your favorites. When you fork a prompt, it gets added to your private library where you can customize it.

**Features:**
- Category filtering (coding, writing, marketing, analysis, and more)
- Sort by recent, popular, or trending
- Like and unlike prompts
- Fork prompts to your personal library
- View counts and engagement metrics
- Unique share tokens for public URLs

---

### 4. Admin Analytics Dashboard

![Admin Dashboard](screenshots/04-admin-dashboard.png)

Track everything: user spending, AI provider costs, success rates, and which prompts are most expensive. Export logs to CSV, filter by user or provider, and see real-time insights. Built-in role-based access control keeps admin features secure.

**Analytics Include:**
- Total users, requests, and costs
- Spending trends by provider (Claude vs ChatGPT)
- Daily and monthly usage patterns
- Top users by spending and activity
- Success rates and average latency
- Token consumption analysis
- CSV export of all logs

---

### 5. Complete Version Control

![Version History](screenshots/05-version-history.png)

Every AI optimization is automatically saved with full details: the input, output, tokens used, cost, and which AI model was used. Restore any previous version, compare versions side-by-side, or review your optimization history to see what worked best.

**Version Details:**
- Full input and output text preserved
- Provider and model information
- Token usage (input and output)
- Exact cost tracking
- API response time (latency)
- Restore to any previous version
- Original prompt always saved

---

## More Features

### User Features

- **Personal Analytics Dashboard** - Track your usage, costs, and see which prompts you optimize most with beautiful charts and insights
- **Smart Rate Limiting** - Free users get 10 prompts, admins unlimited (with friendly notifications when limits are reached)
- **Markdown Editor** - Write prompts with markdown support and live preview
- **Search & Filter** - Find your prompts instantly by title, content, or tags with real-time filtering
- **Favorites System** - Star your most-used prompts for quick access
- **CSV Data Export** - Download all your usage logs with detailed metrics

### Admin Features

- **3-Page Admin Panel** - Analytics overview, advanced logs, and content moderation all in one secure area
- **Role-Based Access Control** - Admin roles managed through Clerk with secure middleware protection
- **Advanced Logs** - Filter, search, and export all API usage data with detailed breakdowns
- **User Management** - See top users, spending patterns, and usage trends
- **Moderation Queue** - Review, approve, or reject community prompts with AI-generated safety scores

### Under the Hood

- **Multi-AI Support** - Claude Sonnet 4.5 and GPT-4o with accurate cost tracking for 11 different models
- **Real-Time Cost Tracking** - Per-token pricing with precision tracking down to fractions of a cent
- **Database Security** - Row Level Security ensures users only see their own data
- **Content Moderation API** - OpenAI's 11-category moderation system with customizable thresholds
- **Comprehensive Logging** - Track tokens, costs, latency, success rates, and more for every API call
- **Secure by Design** - See [SECURITY.md](SECURITY.md) for full details on security measures

---

## Built With

- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Authentication**: Clerk (email/password + Google & GitHub OAuth with role-based access control)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI Models**: Anthropic Claude Sonnet 4.5 & OpenAI GPT-4o
- **Styling**: Tailwind CSS 4 with Radix UI components
- **Charts & Analytics**: Recharts for data visualization
- **Content Moderation**: OpenAI Moderation API

---

## Security

Security is a top priority. PromptBuilder includes input validation, role-based access control, rate limiting, AI-powered content moderation, and database-level security policies. For a detailed breakdown of security measures, see [SECURITY.md](SECURITY.md).

---

## Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- API keys for Anthropic and OpenAI
- A Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/web3at50/promptbuilder.git
   cd promptbuilder
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Configure Clerk**
   - Create a Clerk application
   - Enable email/password and Google OAuth providers
   - Add admin role to user metadata: `{ "role": "admin" }`

5. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations in order from `supabase/migrations/`
   - Enable Row Level Security on all tables

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
promptbuilder/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── api/            # API routes (34 endpoints)
│   │   │   ├── admin/          # Admin dashboard pages
│   │   │   ├── community/      # Community features
│   │   │   ├── edit/           # Prompt editor
│   │   │   ├── profile/        # User profile & analytics
│   │   │   └── page.tsx        # Home page (prompt library)
│   │   ├── components/         # Reusable React components
│   │   │   └── ui/             # UI component library
│   │   ├── lib/                # Utilities and configurations
│   │   │   ├── admin.ts        # RBAC utilities
│   │   │   ├── moderation.ts   # Content moderation config
│   │   │   ├── pricing.ts      # AI provider pricing
│   │   │   └── validation.ts   # Input validation
│   │   └── types/              # TypeScript type definitions
│   └── package.json
├── supabase/                    # Database
│   └── migrations/              # 26 SQL migrations
├── screenshots/                 # README screenshots
└── README.md
```

---

## Key Features Summary

- ✅ **34 API endpoints** organized by feature domain
- ✅ **26 database migrations** tracking full application evolution
- ✅ **8 database tables** with comprehensive Row Level Security
- ✅ **11 AI models supported** (6 Anthropic + 5 OpenAI) with accurate pricing
- ✅ **3 admin dashboard pages** (analytics, logs, moderation)
- ✅ **Dual AI comparison** - run both providers simultaneously
- ✅ **Version control** - full history of every prompt optimization
- ✅ **AI-powered moderation** - automated content safety scoring
- ✅ **Community features** - publish, like, fork, and discover prompts
- ✅ **Real-time analytics** - track costs, tokens, and performance
- ✅ **Role-based access** - secure admin features with Clerk metadata
- ✅ **CSV export** - download your complete usage history

---

## Skills Demonstrated

This project showcases a range of full-stack development skills:

**Frontend Development:**
- Modern React with Next.js 15 App Router
- TypeScript for type safety
- Responsive design with Tailwind CSS
- Complex state management
- Real-time search and filtering
- Data visualization with charts

**Backend Development:**
- RESTful API design
- Multi-provider AI integration
- Database schema design
- Cost tracking and analytics
- Error handling and logging
- Migration management

**Security & Authorization:**
- Role-based access control (RBAC)
- Row Level Security (RLS) policies
- Input validation and sanitization
- Rate limiting and quota management
- Content moderation with AI
- Secure authentication flow

**DevOps & Architecture:**
- Multi-tenant SaaS design
- Database optimization with indexes
- Environment configuration
- Version control strategy
- Production deployment (Vercel)

---

## Possible Future Enhancements

This project demonstrates solid full-stack competence as-is, but there are several features that could be added if the application gained traction or to showcase additional skills:

**Expanded AI Support:**
- Add more AI providers (Google Gemini, xAI Grok)
- Support additional models per provider (Claude Haiku, GPT-4.5, GPT-5)
- Multi-model comparison (compare 3+ AIs simultaneously)

**Enhanced User Experience:**
- **Command Palette** - Keyboard-driven navigation and actions for power users
- **Folders & Collections** - Organizational system for users with 100+ prompts
- **Custom Usernames** - User-chosen usernames displayed on community prompt cards

**Advanced Prompt Features:**
- **Prompt Templates with Variables** - Reusable templates with variable substitution (e.g., `{{company_name}}`, `{{target_audience}}`)
- **"10x Better" AI Enhancement** - One-click prompt optimization using advanced meta-prompting techniques
- **Prompt Chaining** - Link multiple prompts together for complex workflows

**Collaboration Features:**
- Team workspaces with shared prompt libraries
- Commenting and discussion on community prompts
- Collaborative editing with version conflict resolution

These enhancements would demonstrate additional capabilities in UX design, complex state management, real-time collaboration, and advanced AI integration while building on the solid foundation already in place.

---

## Contact & Links

**Live Demo**: [promptbuilderai.xyz](https://www.promptbuilderai.xyz/)
**GitHub**: [github.com/web3at50/promptbuilder](https://github.com/web3at50/promptbuilder)
**Developer**: Syntorak
**Email**: support@syntorak.com

---

## License

MIT License - feel free to use this project as a reference or learning resource.
