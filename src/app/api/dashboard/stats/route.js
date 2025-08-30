import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    // Get dashboard statistics
    const results = await sql.transaction([
      // Articles published today
      sql`
        SELECT COUNT(*) as articles_today 
        FROM articles 
        WHERE published_at >= CURRENT_DATE
      `,
      
      // High priority articles  
      sql`
        SELECT COUNT(*) as high_priority 
        FROM articles 
        WHERE priority = 'high' AND published_at >= CURRENT_DATE - INTERVAL '7 days'
      `,
      
      // Articles this week
      sql`
        SELECT COUNT(*) as weekly_total 
        FROM articles 
        WHERE published_at >= CURRENT_DATE - INTERVAL '7 days'
      `,
      
      // Total view count today
      sql`
        SELECT COALESCE(SUM(view_count), 0) as total_views 
        FROM articles 
        WHERE published_at >= CURRENT_DATE
      `
    ]);

    const [articlesResult, highPriorityResult, weeklyResult, viewsResult] = results;

    const stats = {
      articlesToday: parseInt(articlesResult[0].articles_today),
      highPriority: parseInt(highPriorityResult[0].high_priority), 
      weeklyTotal: parseInt(weeklyResult[0].weekly_total),
      totalViews: parseInt(viewsResult[0].total_views)
    };

    return Response.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return Response.json(
      { error: 'Failed to fetch dashboard statistics' }, 
      { status: 500 }
    );
  }
}