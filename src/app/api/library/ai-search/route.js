import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, category, jurisdiction } = body;

    if (!query) {
      return Response.json({ error: "Search query is required" }, { status: 400 });
    }

    // First, let ChatGPT analyze the search query to extract legal concepts and keywords
    const analysisResponse = await fetch("/integrations/chat-gpt/conversationgpt4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are an Australian legal search assistant. Analyze user search queries and extract relevant legal concepts, keywords, and search terms for finding legal articles.

Your task is to:
1. Identify key legal concepts, case names, legislation, or topics
2. Extract relevant keywords for database searching
3. Suggest related legal terms that might be relevant
4. Determine the likely legal practice area if not specified

Return your analysis in a structured format.`
          },
          {
            role: "user",
            content: `Analyze this legal search query and extract keywords and concepts: "${query}"`
          }
        ],
        json_schema: {
          name: "legal_search_analysis",
          schema: {
            type: "object",
            properties: {
              primary_keywords: {
                type: "array",
                items: { type: "string" },
                description: "Main keywords to search for"
              },
              legal_concepts: {
                type: "array", 
                items: { type: "string" },
                description: "Legal concepts and topics identified"
              },
              related_terms: {
                type: "array",
                items: { type: "string" },
                description: "Related legal terms that might be relevant"
              },
              likely_categories: {
                type: "array",
                items: { type: "string" },
                description: "Likely legal practice areas this query relates to"
              },
              search_intent: {
                type: "string",
                description: "What the user is likely looking for"
              }
            },
            required: ["primary_keywords", "legal_concepts", "related_terms", "likely_categories", "search_intent"],
            additionalProperties: false
          }
        }
      }),
    });

    if (!analysisResponse.ok) {
      throw new Error("Failed to analyze search query");
    }

    const analysisResult = await analysisResponse.json();
    const searchAnalysis = JSON.parse(analysisResult.choices[0].message.content);

    // Build comprehensive search terms
    const allSearchTerms = [
      ...searchAnalysis.primary_keywords,
      ...searchAnalysis.legal_concepts,
      ...searchAnalysis.related_terms
    ].join(' ');

    // Build dynamic SQL query with filters
    let baseQuery = `
      SELECT 
        id, title, summary, content, source, source_url, published_at, 
        category, jurisdiction, priority, impact_score, ai_insights, keywords, view_count,
        ts_rank(to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, '')), 
                plainto_tsquery('english', $1)) as relevance_score
      FROM articles 
      WHERE to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, '')) 
            @@ plainto_tsquery('english', $1)
    `;

    const queryParams = [allSearchTerms];
    let paramCount = 1;

    // Add category filter if specified
    if (category && category !== 'All Categories') {
      paramCount++;
      baseQuery += ` AND category = $${paramCount}`;
      queryParams.push(category);
    }

    // Add jurisdiction filter if specified  
    if (jurisdiction && jurisdiction !== 'All Jurisdictions') {
      paramCount++;
      baseQuery += ` AND jurisdiction = $${paramCount}`;
      queryParams.push(jurisdiction);
    }

    // Order by relevance and impact
    baseQuery += ` ORDER BY relevance_score DESC, impact_score DESC, published_at DESC LIMIT 20`;

    // Execute the search
    const searchResults = await sql(baseQuery, queryParams);

    // If we have results, enhance them with AI insights
    let enhancedResults = searchResults;
    if (searchResults.length > 0) {
      // Get AI summary of search results
      const summaryResponse = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are an Australian legal research assistant. Provide a brief, professional summary of search results for legal articles, highlighting key themes and important developments."
            },
            {
              role: "user", 
              content: `Based on the search query "${query}", here are the top legal articles found:

${searchResults.slice(0, 5).map(article => 
  `- ${article.title} (${article.category}, ${article.jurisdiction})
    ${article.summary || 'No summary available'}`
).join('\n\n')}

Provide a brief summary of what these results show and key themes.`
            }
          ]
        }),
      });

      let searchSummary = "Search completed successfully.";
      if (summaryResponse.ok) {
        const summaryResult = await summaryResponse.json();
        searchSummary = summaryResult.choices[0].message.content;
      }

      enhancedResults = {
        articles: searchResults,
        searchAnalysis: searchAnalysis,
        searchSummary: searchSummary,
        totalResults: searchResults.length
      };
    } else {
      // No results found - suggest alternative searches
      const suggestionResponse = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are an Australian legal search assistant. When no search results are found, suggest alternative search terms or related legal topics that might yield better results."
            },
            {
              role: "user",
              content: `No results found for: "${query}". Suggest 3-5 alternative search terms or related legal topics that might help find relevant Australian legal articles.`
            }
          ]
        }),
      });

      let suggestions = ["Try broader search terms", "Check spelling", "Use different keywords"];
      if (suggestionResponse.ok) {
        const suggestionResult = await suggestionResponse.json();
        const suggestionText = suggestionResult.choices[0].message.content;
        suggestions = suggestionText.split('\n').filter(s => s.trim()).slice(0, 5);
      }

      enhancedResults = {
        articles: [],
        searchAnalysis: searchAnalysis,
        searchSummary: "No articles found matching your search criteria.",
        suggestions: suggestions,
        totalResults: 0
      };
    }

    return Response.json(enhancedResults);

  } catch (error) {
    console.error("Error in AI search:", error);
    return Response.json(
      { error: "Failed to perform AI search" },
      { status: 500 }
    );
  }
}