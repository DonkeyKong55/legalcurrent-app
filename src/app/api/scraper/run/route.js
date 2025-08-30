import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    console.log("Starting article scraper...");

    const sources = [
      {
        name: "The Guardian Australia",
        url: "https://www.theguardian.com/australia-news",
        selector: "h3 a[href]",
      },
      {
        name: "ABC News Australia",
        url: "https://www.abc.net.au/news/topic/law-crime-and-justice",
        selector: "a[href*='law']",
      },
      {
        name: "Sydney Morning Herald",
        url: "https://www.smh.com.au/topic/legal-affairs-1mgl",
        selector: "a[href*='legal']",
      },
      {
        name: "The Australian",
        url: "https://www.theaustralian.com.au/nation/politics",
        selector: "a[href]",
      },
      {
        name: "Australian Financial Review",
        url: "https://www.afr.com/policy",
        selector: "a[href]",
      },
      {
        name: "Lawyers Weekly",
        url: "https://www.lawyersweekly.com.au/news",
        selector: "a[href]",
      },
      {
        name: "Australian Lawyer",
        url: "https://www.australianlawyer.com.au/news",
        selector: "a[href]",
      },
      {
        name: "Law Institute Journal",
        url: "https://www.liv.asn.au/news-and-media/news",
        selector: "a[href]",
      },
      {
        name: "Federal Court of Australia",
        url: "https://www.fedcourt.gov.au/about/news-and-events/media-releases",
        selector: "a[href]",
      },
      {
        name: "High Court of Australia",
        url: "https://www.hcourt.gov.au/cases/recent-decisions",
        selector: "a[href]",
      },
      {
        name: "ASIC Media Releases",
        url: "https://asic.gov.au/about-asic/news-centre/find-a-media-release/",
        selector: "a[href]",
      },
      {
        name: "ACCC News",
        url: "https://www.accc.gov.au/media-and-publications/media-releases",
        selector: "a[href]",
      },
    ];

    let totalScraped = 0;
    let totalSaved = 0;
    const results = [];

    for (const source of sources) {
      console.log(`Scraping ${source.name}...`);

      try {
        const articles = await scrapeSource(source);
        const savedCount = await saveArticles(articles, source.name);

        totalScraped += articles.length;
        totalSaved += savedCount;

        results.push({
          source: source.name,
          scraped: articles.length,
          saved: savedCount,
        });

        console.log(
          `${source.name}: Found ${articles.length}, saved ${savedCount}`,
        );
      } catch (sourceError) {
        console.error(`Error scraping ${source.name}:`, sourceError);
        results.push({
          source: source.name,
          scraped: 0,
          saved: 0,
          error: sourceError.message,
        });
      }
    }

    const summary = {
      totalScraped,
      totalSaved,
      sources: results,
      timestamp: new Date().toISOString(),
    };

    console.log("Scraper completed:", summary);
    return Response.json(summary);
  } catch (error) {
    console.error("Scraper error:", error);
    return Response.json(
      { error: "Scraper failed", details: error.message },
      { status: 500 },
    );
  }
}

async function scrapeSource(source) {
  try {
    // Fetch the page content
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LegalNewsBot/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${source.url}: ${response.statusText}`);
    }

    const html = await response.text();

    // Simple regex-based extraction since we can't use DOM parsing
    const articles = extractArticlesFromHtml(html, source);

    // Limit to 10 articles per source to avoid overwhelming the system
    return articles.slice(0, 10);
  } catch (error) {
    console.error(`Error scraping ${source.name}:`, error);
    return [];
  }
}

function extractArticlesFromHtml(html, source) {
  const articles = [];
  console.log(`Extracting articles from ${source.name}...`);
  console.log(`HTML length: ${html.length} characters`);

  try {
    // More flexible patterns that work with modern websites
    const patterns = {
      // Look for article links with various patterns
      links: [
        /<a[^>]*href="([^"]*)"[^>]*>([^<]{20,200})<\/a>/gi,
        /<a[^>]*href='([^']*)'[^>]*>([^<]{20,200})<\/a>/gi,
      ],
      // Look for headlines in various containers
      headlines: [
        /<h[1-6][^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>.*?<\/h[1-6]>/gi,
        /<h[1-6][^>]*><a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a><\/h[1-6]>/gi,
      ],
    };

    let foundCount = 0;
    const foundLinks = new Set();

    // Try headline patterns first (usually better quality)
    for (const pattern of patterns.headlines) {
      let match;
      while ((match = pattern.exec(html)) !== null && articles.length < 10) {
        const [, url, title] = match;
        const cleanTitle = title
          .trim()
          .replace(/&#x27;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/\s+/g, " ");

        if (
          isRelevantArticle(cleanTitle, url, source.name) &&
          !foundLinks.has(url)
        ) {
          const fullUrl = makeAbsoluteUrl(url, source.name);
          articles.push({
            title: cleanTitle,
            url: fullUrl,
            source: source.name,
          });
          foundLinks.add(url);
          foundCount++;
          console.log(
            `Found headline article: ${cleanTitle.substring(0, 50)}...`,
          );
        }
      }
    }

    // If no headlines found, try link patterns
    if (articles.length === 0) {
      for (const pattern of patterns.links) {
        let match;
        while ((match = pattern.exec(html)) !== null && articles.length < 10) {
          const [, url, title] = match;
          const cleanTitle = title
            .trim()
            .replace(/&#x27;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/\s+/g, " ");

          if (
            isRelevantArticle(cleanTitle, url, source.name) &&
            !foundLinks.has(url)
          ) {
            const fullUrl = makeAbsoluteUrl(url, source.name);
            articles.push({
              title: cleanTitle,
              url: fullUrl,
              source: source.name,
            });
            foundLinks.add(url);
            foundCount++;
            console.log(
              `Found link article: ${cleanTitle.substring(0, 50)}...`,
            );
          }
        }
      }
    }

    console.log(`Extracted ${articles.length} articles from ${source.name}`);

    // If still no articles, log some sample content for debugging
    if (articles.length === 0) {
      console.log(
        `No articles found for ${source.name}. Sample HTML:`,
        html.substring(0, 500),
      );

      // Try to find any links at all for debugging
      const anyLinkPattern = /<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/gi;
      let linkCount = 0;
      let match;
      while ((match = anyLinkPattern.exec(html)) !== null && linkCount < 5) {
        console.log(`Sample link found: ${match[2]} -> ${match[1]}`);
        linkCount++;
      }
    }
  } catch (error) {
    console.error(`Error extracting articles from ${source.name}:`, error);
  }

  return articles;
}

// Helper function to determine if an article is relevant
function isRelevantArticle(title, url, sourceName) {
  // Skip obvious non-articles
  if (title.length < 15 || title.length > 300) return false;

  const skipWords = [
    "subscribe",
    "login",
    "register",
    "newsletter",
    "contact",
    "about",
    "privacy",
    "terms",
    "cookie",
    "more articles",
    "view all",
    "home",
    "search",
    "menu",
    "navigation",
    "footer",
    "header",
  ];

  const titleLower = title.toLowerCase();
  if (skipWords.some((word) => titleLower.includes(word))) return false;

  // For legal news, prefer articles with legal keywords
  const legalKeywords = [
    "law",
    "legal",
    "court",
    "judge",
    "justice",
    "attorney",
    "lawyer",
    "legislation",
    "regulation",
    "ruling",
    "verdict",
    "case",
    "trial",
    "parliament",
    "government",
    "policy",
    "rights",
    "crime",
    "criminal",
    "civil",
    "constitutional",
    "supreme",
    "federal",
    "appeal",
  ];

  const hasLegalKeyword = legalKeywords.some(
    (keyword) =>
      titleLower.includes(keyword) || url.toLowerCase().includes(keyword),
  );

  // Source-specific filtering
  if (sourceName.includes("Guardian")) {
    return url.includes("/australia-news/") || hasLegalKeyword;
  } else if (sourceName.includes("ABC")) {
    return url.includes("law-crime") || hasLegalKeyword;
  } else if (sourceName.includes("Sydney Morning Herald")) {
    return url.includes("legal-affairs") || hasLegalKeyword;
  }

  return hasLegalKeyword;
}

// Helper function to make URLs absolute
function makeAbsoluteUrl(url, sourceName) {
  if (url.startsWith("http")) return url;

  const baseUrls = {
    Guardian: "https://www.theguardian.com",
    ABC: "https://www.abc.net.au",
    "Sydney Morning Herald": "https://www.smh.com.au",
    "The Australian": "https://www.theaustralian.com.au",
    "Australian Financial Review": "https://www.afr.com",
    "Lawyers Weekly": "https://www.lawyersweekly.com.au",
    "Australian Lawyer": "https://www.australianlawyer.com.au",
    "Law Institute Journal": "https://www.liv.asn.au",
    "Federal Court": "https://www.fedcourt.gov.au",
    "High Court": "https://www.hcourt.gov.au",
    ASIC: "https://asic.gov.au",
    ACCC: "https://www.accc.gov.au",
  };

  const baseUrl =
    Object.entries(baseUrls).find(([key]) => sourceName.includes(key))?.[1] ||
    "";

  return url.startsWith("/") ? baseUrl + url : baseUrl + "/" + url;
}

async function saveArticles(articles, sourceName) {
  let savedCount = 0;

  for (const article of articles) {
    try {
      // Check if article already exists
      const existing = await sql`
        SELECT id FROM articles 
        WHERE title = ${article.title} OR source_url = ${article.url}
      `;

      if (existing.length > 0) {
        console.log(`Skipping duplicate: ${article.title.substring(0, 50)}...`);
        continue;
      }

      // Get article content
      const content = await fetchArticleContent(article.url);

      // Analyze with AI
      const analysis = await analyzeArticleWithAI(content, article.title);

      // Save to database
      await sql`
        INSERT INTO articles (
          title, content, source, source_url, published_at,
          category, jurisdiction, priority, impact_score, 
          ai_insights, keywords, summary
        ) VALUES (
          ${article.title},
          ${content},
          ${sourceName},
          ${article.url},
          ${new Date()},
          ${analysis.category},
          ${analysis.jurisdiction},
          ${analysis.priority},
          ${analysis.impactScore},
          ${analysis.insights},
          ${analysis.keywords},
          ${analysis.summary}
        )
      `;

      savedCount++;
      console.log(`Saved: ${article.title.substring(0, 50)}...`);
    } catch (error) {
      console.error(`Error saving article "${article.title}":`, error);
    }
  }

  return savedCount;
}

async function fetchArticleContent(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LegalNewsBot/1.0)",
      },
    });

    if (!response.ok) {
      return "Content not available";
    }

    const html = await response.text();

    // Extract text content using basic regex patterns
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Limit content length
    if (content.length > 5000) {
      content = content.substring(0, 5000) + "...";
    }

    return content || "Content not available";
  } catch (error) {
    console.error("Error fetching article content:", error);
    return "Content not available";
  }
}

async function analyzeArticleWithAI(content, title) {
  try {
    const response = await fetch("/integrations/google-gemini-2-5-pro/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are an expert Australian legal analyst. Analyze legal news articles and provide structured categorization and insights.",
          },
          {
            role: "user",
            content: `Analyze this Australian legal news article and provide structured analysis:

Title: ${title}
Content: ${content.substring(0, 3000)}

Please analyze and categorize this article.`,
          },
        ],
        json_schema: {
          name: "legal_article_analysis",
          schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
              },
              category: {
                type: "string",
              },
              jurisdiction: {
                type: "string",
              },
              priority: {
                type: "string",
              },
              impactScore: {
                type: "integer",
              },
              insights: {
                type: "string",
              },
              keywords: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: [
              "summary",
              "category",
              "jurisdiction",
              "priority",
              "impactScore",
              "insights",
              "keywords",
            ],
            additionalProperties: false,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`AI analysis failed: ${response.statusText}`);
    }

    const result = await response.json();
    const analysis = JSON.parse(result.choices[0].message.content);

    // Validate and normalize the response
    return {
      summary: analysis.summary || "Summary not available",
      category: analysis.category || "General Legal",
      jurisdiction: analysis.jurisdiction || "Australia",
      priority: ["high", "medium", "low"].includes(analysis.priority)
        ? analysis.priority
        : "medium",
      impactScore: Math.min(Math.max(analysis.impactScore || 5, 1), 10),
      insights: analysis.insights || "Analysis not available",
      keywords: Array.isArray(analysis.keywords)
        ? analysis.keywords.slice(0, 10)
        : ["legal"],
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    return {
      summary: "Summary not available",
      category: "General Legal",
      jurisdiction: "Australia",
      priority: "medium",
      impactScore: 5,
      insights: "Analysis unavailable",
      keywords: ["legal"],
    };
  }
}
