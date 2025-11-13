import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

// GET /api/community/prompts
// Lists all public prompts with filters, sorting, and pagination
// Public endpoint - no auth required for viewing
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const supabase = await createClerkSupabaseClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'recent'; // recent, popular, trending
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query - only show approved prompts (auto_approved or manually approved)
    let query = supabase
      .from('community_prompts')
      .select('*', { count: 'exact' })
      .in('moderation_status', ['auto_approved', 'approved']);

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Apply search filter (search in title, description, content, tags)
    if (search && search.trim()) {
      // Use text search on title, description, and content
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`
      );
    }

    // Apply sorting
    if (sort === 'popular') {
      query = query.order('like_count', { ascending: false });
    } else if (sort === 'trending') {
      // Trending: recent + popular (last 7 days, sorted by likes)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query = query
        .gte('published_at', sevenDaysAgo.toISOString())
        .order('like_count', { ascending: false });
    } else {
      // Default: recent
      query = query.order('published_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: prompts, error, count } = await query;

    if (error) {
      console.error('Error fetching community prompts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch community prompts' },
        { status: 500 }
      );
    }

    // Get user's likes for these prompts (only if authenticated)
    let likedPromptIds = new Set<string>();

    if (userId) {
      const promptIds = prompts?.map(p => p.id) || [];
      const { data: userLikes } = await supabase
        .from('community_prompt_likes')
        .select('community_prompt_id')
        .eq('user_id', userId)
        .in('community_prompt_id', promptIds);

      likedPromptIds = new Set(userLikes?.map(l => l.community_prompt_id) || []);
    }

    // Add is_liked_by_user field to each prompt
    const promptsWithLikes = prompts?.map(prompt => ({
      ...prompt,
      is_liked_by_user: likedPromptIds.has(prompt.id),
    }));

    return NextResponse.json({
      prompts: promptsWithLikes || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('[Community Prompts List] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community prompts' },
      { status: 500 }
    );
  }
}
