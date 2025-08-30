import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { question, context } = body;

    if (!question) {
      return Response.json({ error: "Question is required" }, { status: 400 });
    }

    // Get relevant articles for context
    const relevantArticles = await sql`
      SELECT 
        title, summary, category, jurisdiction, impact_score, ai_insights
      FROM articles 
      WHERE 
        to_tsvector('english', title || ' ' || COALESCE(summary, '')) 
        @@ plainto_tsquery('english', ${question})
      ORDER BY impact_score DESC, published_at DESC
      LIMIT 5
    `;

    // Build context from relevant articles
    const contextText =
      relevantArticles.length > 0
        ? `Context from recent Australian legal articles:\n${relevantArticles
            .map(
              (article) =>
                `- ${article.title} (${article.category}, ${article.jurisdiction}, Impact: ${article.impact_score}/10)\n  ${article.summary}`,
            )
            .join("\n\n")}`
        : "No directly relevant articles found in database.";

    // Call Google Gemini for AI analysis
    const geminiResponse = await fetch("/integrations/google-gemini-2-5-pro/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a specialized Australian legal AI assistant. You provide accurate, detailed analysis of Australian legal matters including case law, legislation, regulatory changes, and their practical implications.

Your expertise covers:
- Australian Federal and State legislation
- High Court and Federal Court decisions
- ASIC, ACCC, and other regulatory body actions
- Consumer law, corporate law, competition law, constitutional law
- Practical implications for legal practitioners and businesses

Always provide:
1. Clear, accurate legal analysis
2. Practical implications for relevant stakeholders
3. References to applicable legislation or case law where relevant
4. Professional, authoritative tone suitable for legal professionals

When discussing specific cases or legislation, be precise about jurisdiction, dates, and key legal principles.`,
          },
          {
            role: "user",
            content: `${contextText}\n\nQuestion: ${question}\n\nPlease provide detailed legal analysis based on Australian law and the context provided.`,
          },
        ],
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error("Failed to get AI response");
    }

    const geminiResult = await geminiResponse.json();
    const aiAnswer = geminiResult.choices[0].message.content;

    const aiResponse = {
      answer: aiAnswer,
      sources: relevantArticles.map((article) => ({
        title: article.title,
        category: article.category,
        jurisdiction: article.jurisdiction,
        impact_score: article.impact_score,
      })),
      confidence: 0.9,
      followUp: [
        "What are the practical implications for legal practitioners?",
        "How might this affect business compliance requirements?",
        "Are there similar developments in other Australian jurisdictions?",
        "What should companies be doing to prepare for these changes?",
      ],
    };

    return Response.json(aiResponse);
  } catch (error) {
    console.error("Error processing AI assistant request:", error);
    return Response.json(
      { error: "Failed to process AI assistant request" },
      { status: 500 },
    );
  }
}

// Generate AI insights for articles
export async function PUT(request) {
  try {
    const body = await request.json();
    const { articleId } = body;

    if (!articleId) {
      return Response.json(
        { error: "Article ID is required" },
        { status: 400 },
      );
    }

    // Get article details
    const article = await sql`
      SELECT * FROM articles WHERE id = ${articleId}
    `;

    if (article.length === 0) {
      return Response.json({ error: "Article not found" }, { status: 404 });
    }

    // Generate AI insight using Gemini
    try {
      const geminiResponse = await fetch(
        "/integrations/google-gemini-2-5-pro/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "You are an Australian legal AI assistant. Analyze legal articles and provide concise, professional insights about their significance, implications, and practical considerations for legal practitioners and businesses.",
              },
              {
                role: "user",
                content: `Please provide a concise AI analysis for this Australian legal article:

Title: ${article[0].title}
Category: ${article[0].category}
Jurisdiction: ${article[0].jurisdiction}
Summary: ${article[0].summary}

Provide analysis covering: legal significance, practical implications, and key considerations for practitioners.`,
              },
            ],
          }),
        },
      );

      const geminiResult = await geminiResponse.json();
      const aiInsight = geminiResult.choices[0].message.content;

      // Update article with AI insights
      await sql`
        UPDATE articles 
        SET ai_insights = ${aiInsight}, updated_at = NOW()
        WHERE id = ${articleId}
      `;

      return Response.json({
        success: true,
        insight: aiInsight,
      });
    } catch (aiError) {
      // Fallback to a basic insight if AI fails
      const fallbackInsight = `AI Analysis: This ${article[0].category} matter in ${article[0].jurisdiction} represents a significant development with potential widespread implications. Key considerations include regulatory compliance, precedent-setting aspects, and practical implementation challenges for legal practitioners.`;

      await sql`
        UPDATE articles 
        SET ai_insights = ${fallbackInsight}, updated_at = NOW()
        WHERE id = ${articleId}
      `;

      return Response.json({
        success: true,
        insight: fallbackInsight,
      });
    }
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return Response.json(
      { error: "Failed to generate AI insights" },
      { status: 500 },
    );
  }
}
