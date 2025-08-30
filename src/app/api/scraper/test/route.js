import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { testUrl } = await request.json();
    
    if (!testUrl) {
      return Response.json({ error: "testUrl is required" }, { status: 400 });
    }

    console.log(`Testing scraper on: ${testUrl}`);

    // Fetch the page content
    const response = await fetch(testUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LegalNewsBot/1.0)",
      },
    });

    if (!response.ok) {
      return Response.json(
        { 
          error: `Failed to fetch ${testUrl}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText
        },
        { status: 400 }
      );
    }

    const html = await response.text();
    console.log(`Fetched ${html.length} characters from ${testUrl}`);

    // Extract sample links for debugging
    const linkPattern = /<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/gi;
    const headlines = /<h[1-6][^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>.*?<\/h[1-6]>/gi;
    
    const foundLinks = [];
    const foundHeadlines = [];
    
    let match;
    let count = 0;
    
    // Sample regular links
    linkPattern.lastIndex = 0;
    while ((match = linkPattern.exec(html)) !== null && count < 20) {
      const [, url, title] = match;
      if (title && title.length > 10 && title.length < 200) {
        foundLinks.push({ url: url.substring(0, 100), title: title.trim().substring(0, 100) });
        count++;
      }
    }
    
    count = 0;
    // Sample headlines
    headlines.lastIndex = 0;
    while ((match = headlines.exec(html)) !== null && count < 10) {
      const [, url, title] = match;
      foundHeadlines.push({ url: url.substring(0, 100), title: title.trim().substring(0, 100) });
      count++;
    }

    // Try to identify legal-related content
    const legalKeywords = [
      'law', 'legal', 'court', 'judge', 'justice', 'attorney', 'lawyer',
      'legislation', 'regulation', 'ruling', 'verdict', 'case', 'trial',
      'parliament', 'government', 'policy', 'rights', 'crime', 'criminal',
      'civil', 'constitutional', 'supreme', 'federal', 'appeal'
    ];

    const potentialLegalLinks = foundLinks.filter(link => {
      const combined = (link.title + ' ' + link.url).toLowerCase();
      return legalKeywords.some(keyword => combined.includes(keyword));
    });

    const potentialLegalHeadlines = foundHeadlines.filter(headline => {
      const combined = (headline.title + ' ' + headline.url).toLowerCase();
      return legalKeywords.some(keyword => combined.includes(keyword));
    });

    return Response.json({
      success: true,
      url: testUrl,
      htmlLength: html.length,
      summary: {
        totalLinks: foundLinks.length,
        totalHeadlines: foundHeadlines.length,
        potentialLegalLinks: potentialLegalLinks.length,
        potentialLegalHeadlines: potentialLegalHeadlines.length,
      },
      sample: {
        htmlStart: html.substring(0, 1000),
        links: foundLinks.slice(0, 10),
        headlines: foundHeadlines,
        potentialLegalLinks: potentialLegalLinks.slice(0, 10),
        potentialLegalHeadlines: potentialLegalHeadlines
      }
    });

  } catch (error) {
    console.error("Test scraper error:", error);
    return Response.json(
      { error: "Test failed", details: error.message },
      { status: 500 }
    );
  }
}