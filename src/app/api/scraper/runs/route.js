import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Get recent scraper runs
    const runs = await sql`
      SELECT 
        id, run_time, status, articles_scraped, articles_saved, 
        details, error_message, created_at
      FROM scraper_runs 
      ORDER BY run_time DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Get total count
    const totalCount = await sql`
      SELECT COUNT(*) as count FROM scraper_runs
    `;

    // Get summary stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total_runs,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_runs,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed_runs,
        SUM(articles_scraped) as total_articles_scraped,
        SUM(articles_saved) as total_articles_saved,
        MAX(run_time) as last_run_time
      FROM scraper_runs
    `;

    return Response.json({
      runs,
      total: totalCount[0].count,
      stats: stats[0],
      pagination: {
        limit,
        offset,
        hasMore: (offset + limit) < totalCount[0].count
      }
    });

  } catch (error) {
    console.error("Error fetching scraper runs:", error);
    return Response.json(
      { error: "Failed to fetch scraper runs", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('id');
    const olderThan = searchParams.get('olderThan'); // days

    if (runId) {
      // Delete specific run
      await sql`
        DELETE FROM scraper_runs WHERE id = ${runId}
      `;
      return Response.json({ message: "Scraper run deleted successfully" });
      
    } else if (olderThan) {
      // Delete runs older than specified days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThan));
      
      const result = await sql`
        DELETE FROM scraper_runs 
        WHERE run_time < ${cutoffDate}
      `;
      
      return Response.json({ 
        message: `Deleted ${result.length} scraper runs older than ${olderThan} days` 
      });
      
    } else {
      return Response.json({ error: "Missing id or olderThan parameter" }, { status: 400 });
    }

  } catch (error) {
    console.error("Error deleting scraper runs:", error);
    return Response.json(
      { error: "Failed to delete scraper runs", details: error.message },
      { status: 500 }
    );
  }
}