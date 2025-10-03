# Prompt Library

A beautiful AI prompt library application to save, organise, and optimise your AI prompts with Claude Sonnet 4.5 and ChatGPT.

## Features

- 🔐 **User Authentication** - Secure sign-up/sign-in with email/password or Google OAuth
- 📝 **Create & Edit Prompts** - Save your AI prompts with a beautiful markdown editor
- 🔍 **Search & Filter** - Quickly find prompts by title, content, or tags
- ⭐ **Favorites** - Mark your most-used prompts as favorites
- ✨ **AI Optimisation** - Optimise your prompts using Claude Sonnet 4.5 or ChatGPT (GPT-4o)
- 🎯 **Demo Mode** - Try 3 free optimisations before signing up
- 👤 **User Profiles** - View your stats (prompts count, optimisations count)
- 🔒 **Multi-Tenancy** - Each user's data is isolated and secure
- 🎨 **Modern UI** - Clean monochrome theme with Tailwind CSS and shadcn/ui
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI**: Anthropic Claude Sonnet 4.5 & OpenAI GPT-4o
- **Deployment**: Vercel

## Project Structure

```
promptbuilder/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── api/       # API routes
│   │   │   ├── edit/      # Edit prompt page
│   │   │   ├── new/       # New prompt page
│   │   │   └── page.tsx   # Home page
│   │   ├── components/    # React components
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── lib/           # Utilities and config
│   │   └── types/         # TypeScript types
│   ├── .env.local         # Environment variables (not in git)
│   └── package.json
└── supabase/              # Database migrations
    └── migrations/
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- An Anthropic API key
- An OpenAI API key

### 1. Clone the Repository

```bash
git clone https://github.com/web3at50/promptbuilder.git
cd promptbuilder
```

### 2. Setup Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# AI API Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Install Dependencies

```bash
cd frontend
npm install
```

### 4. Configure Supabase Authentication

**Enable Email Authentication:**
1. Go to your Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Enable "Confirm email" (recommended for production)

**Enable Google OAuth (Optional but Recommended):**
1. Create a Google Cloud project at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable Google OAuth API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `https://[your-project-ref].supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret
6. In Supabase Dashboard → Authentication → Providers → Google:
   - Enable Google provider
   - Paste Client ID and Secret
   - Save

### 5. Run Database Migrations

Run the migrations to create all required tables:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or manually execute the SQL files in order:
# 1. supabase/migrations/001_create_prompts_table_20251001.sql
# 2. supabase/migrations/002_add_auth_and_multitenancy.sql
```

The migrations create:
- `prompts` table with user_id for multi-tenancy
- `profiles` table for user information
- `optimization_usage` table for tracking AI usage
- Row Level Security policies (user-scoped access)
- Automatic profile creation trigger

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**First Time Setup:**
1. Click "Sign Up" to create an account
2. Verify your email (if email confirmation is enabled)
3. Sign in and start creating prompts!

## Usage

### Creating a Prompt

1. Click "New Prompt" button
2. Enter a title and content (markdown supported)
3. Add optional tags by typing and pressing Enter
4. Click "Save Prompt"

### Optimising a Prompt

1. Create or edit a prompt
2. Write your initial prompt in the editor
3. Click "Optimise with Claude" or "Optimise with ChatGPT" button
4. The AI will analyse and improve your prompt
5. Review and save the optimised version

### Searching Prompts

- Use the search bar to filter prompts by title, content, or tags
- Prompts update in real-time as you type

### Favoriting Prompts

- Click the star icon on any prompt card
- Favorites appear in a separate section at the top

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the root directory to `frontend/`
4. Add environment variables in Vercel dashboard
5. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

## API Routes

- `GET /api/prompts` - Fetch all prompts
- `POST /api/prompts` - Create a new prompt
- `GET /api/prompts/[id]` - Fetch a single prompt
- `PUT /api/prompts/[id]` - Update a prompt
- `DELETE /api/prompts/[id]` - Delete a prompt
- `POST /api/optimize` - Optimise a prompt with Claude
- `POST /api/optimize-openai` - Optimise a prompt with ChatGPT

## Contributing

This is a personal project, but feel free to fork and customize for your own use!

## License

MIT
