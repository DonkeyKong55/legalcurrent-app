import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;

    // Get trending topics from the database
    const trendingTopics = await sql`
      SELECT 
        topic,
        search_count,
        article_count,
        category,
        jurisdiction,
        updated_at
      FROM trending_topics
      ORDER BY search_count DESC, article_count DESC
      LIMIT ${limit}
    `;

    return Response.json(trendingTopics);

  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return Response.json(
      { error: 'Failed to fetch trending topics' },
      { status: 500 }
    );
  }
}

// Update trending topics based on search activity
export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, category, jurisdiction } = body;

    if (!topic) {
      return Response.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Update or insert trending topic
    await sql`
      INSERT INTO trending_topics (topic, search_count, article_count, category, jurisdiction, updated_at)
      VALUES (${topic}, 1, 1, ${category}, ${jurisdiction}, NOW())
      ON CONFLICT (topic) 
      DO UPDATE SET 
        search_count = trending_topics.search_count + 1,
        updated_at = NOW()
    `;

    return Response.json({ success: true });

  } catch (error) {
    console.error('Error updating trending topics:', error);
    return Response.json(
      { error: 'Failed to update trending topics' },
      { status: 500 }
    );
  }
}

// Refresh trending topics based on recent search history
export async function PUT(request) {
  try {
    // Analyze recent search history to update trending topics
    await sql`
      INSERT INTO trending_topics (topic, search_count, article_count, category, jurisdiction, updated_at)
      SELECT 
        search_query as topic,
        COUNT(*) as search_count,
        1 as article_count,
        (filters->>'practiceArea') as category,
        (filters->>'jurisdiction') as jurisdiction,
        NOW() as updated_at
      FROM search_history 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
        AND search_query IS NOT NULL
        AND search_query != ''
      GROUP BY search_query, (filters->>'practiceArea'), (filters->>'jurisdiction')
      HAVING COUNT(*) >= 3
      ON CONFLICT (topic) 
      DO UPDATE SET 
        search_count = trending_topics.search_count + EXCLUDED.search_count,
        updated_at = NOW()
    `;

    // Update article counts for trending topics
    await sql`
      UPDATE trending_topics t
      SET article_count = (
        SELECT COUNT(*)
        FROM articles a
        WHERE 
          a.title ILIKE '%' || t.topic || '%' OR
          a.summary ILIKE '%' || t.topic || '%' OR
          t.topic = ANY(a.keywords)
      ),
      updated_at = NOW()
    `;

    return Response.json({ success: true });

  } catch (error) {
    console.error('Error refreshing trending topics:', error);
    return Response.json(
      { error: 'Failed to refresh trending topics' },
      { status: 500 }
    );
  }
}