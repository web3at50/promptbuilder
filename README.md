# Prompt Library

A beautiful AI prompt library application to save, organize, and optimize your AI prompts with Claude Sonnet 4.5.

## Features

- 📝 **Create & Edit Prompts** - Save your AI prompts with a beautiful markdown editor
- 🔍 **Search & Filter** - Quickly find prompts by title, content, or tags
- ⭐ **Favorites** - Mark your most-used prompts as favorites
- ✨ **AI Optimization** - Optimize your prompts using Claude Sonnet 4.5 API
- 🎨 **Modern UI** - Beautiful dark theme with Tailwind CSS and shadcn/ui
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude Sonnet 4.5
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

# Anthropic API Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Install Dependencies

```bash
cd frontend
npm install
```

### 4. Setup Database

Run the migration to create the `prompts` table in your Supabase project:

```bash
# Using Supabase CLI
supabase db push

# Or manually execute the SQL in supabase/migrations/001_create_prompts_table_20251001.sql
```

The migration creates:
- `prompts` table with columns: id, title, content, tags, favorite, created_at, updated_at
- Indexes for performance
- Row Level Security policies (open access since no auth)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Prompt

1. Click "New Prompt" button
2. Enter a title and content (markdown supported)
3. Add optional tags by typing and pressing Enter
4. Click "Save Prompt"

### Optimizing a Prompt

1. Create or edit a prompt
2. Write your initial prompt in the editor
3. Click "Optimize with Claude" button
4. Claude will analyze and improve your prompt
5. Review and save the optimized version

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
- `POST /api/optimize` - Optimize a prompt with Claude

## Contributing

This is a personal project, but feel free to fork and customize for your own use!

## License

MIT
