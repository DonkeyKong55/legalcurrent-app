import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const jurisdiction =
      searchParams.get("jurisdiction") || "All Jurisdictions";
    const practiceArea = searchParams.get("practiceArea") || "All Categories";
    const limit = parseInt(searchParams.get("limit")) || 20;
    const offset = parseInt(searchParams.get("offset")) || 0;

    // Build dynamic query based on filters
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Search text
    if (search.trim()) {
      paramCount++;
      whereConditions.push(`(
        title ILIKE $${paramCount} OR 
        summary ILIKE $${paramCount} OR 
        content ILIKE $${paramCount} OR
        to_tsvector('english', title || ' ' || COALESCE(summary, '')) @@ plainto_tsquery('english', $${paramCount})
      )`);
      queryParams.push(`%${search.trim()}%`);
    }

    // Jurisdiction filter
    if (jurisdiction !== "All Jurisdictions") {
      paramCount++;
      whereConditions.push(`jurisdiction = $${paramCount}`);
      queryParams.push(jurisdiction);
    }

    // Practice area filter - handle both "All Categories" and "All Practice Areas"
    if (
      practiceArea !== "All Categories" &&
      practiceArea !== "All Practice Areas"
    ) {
      paramCount++;
      whereConditions.push(`category = $${paramCount}`);
      queryParams.push(practiceArea);
    }

    // Build WHERE clause
    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Add limit and offset parameters
    const limitParam = ++paramCount;
    const offsetParam = ++paramCount;
    queryParams.push(limit, offset);

    // Execute query
    const queryString = `
      SELECT 
        id,
        title,
        summary,
        content,
        source,
        source_url,
        published_at,
        category,
        jurisdiction,
        priority,
        impact_score,
        ai_insights,
        keywords,
        view_count
      FROM articles
      ${whereClause}
      ORDER BY 
        CASE WHEN priority = 'high' THEN 1 
             WHEN priority = 'medium' THEN 2 
             ELSE 3 END,
        published_at DESC,
        impact_score DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    const articles = await sql(queryString, queryParams);

    // Log search for trending analysis (if search term provided)
    if (search.trim()) {
      try {
        await sql`
          INSERT INTO search_history (search_query, filters, results_count)
          VALUES (${search.trim()}, ${JSON.stringify({ jurisdiction, practiceArea })}, ${articles.length})
        `;
      } catch (searchLogError) {
        console.warn("Failed to log search:", searchLogError);
      }
    }

    return Response.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return Response.json(
      { error: "Failed to fetch articles" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      summary,
      content,
      source,
      source_url,
      category,
      jurisdiction,
      priority = "medium",
      impact_score,
      ai_insights,
      keywords,
    } = body;

    // Validate required fields
    if (!title || !source) {
      return Response.json(
        { error: "Title and source are required" },
        { status: 400 },
      );
    }

    // Insert new article
    const result = await sql`
      INSERT INTO articles (
        title, summary, content, source, source_url, published_at,
        category, jurisdiction, priority, impact_score, ai_insights, keywords
      ) VALUES (
        ${title}, ${summary}, ${content}, ${source}, ${source_url}, NOW(),
        ${category}, ${jurisdiction}, ${priority}, ${impact_score}, ${ai_insights}, ${keywords}
      )
      RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return Response.json(
      { error: "Failed to create article" },
      { status: 500 },
    );
  }
}
