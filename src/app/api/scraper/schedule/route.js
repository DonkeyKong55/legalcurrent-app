import sql from "@/app/api/utils/sql";

// Store the last run time and schedule info
let lastRun = null;
let isRunning = false;

export async function POST(request) {
  try {
    const { action, interval = "hourly" } = await request.json();

    if (action === "start") {
      // Start the scheduler
      if (isRunning) {
        return Response.json({
          message: "Scheduler is already running",
          status: "running",
          lastRun,
          nextRun: getNextRunTime(interval),
        });
      }

      isRunning = true;
      scheduleNextRun(interval);

      return Response.json({
        message: "Scheduler started successfully",
        status: "running",
        interval,
        nextRun: getNextRunTime(interval),
      });
    } else if (action === "stop") {
      isRunning = false;
      return Response.json({
        message: "Scheduler stopped",
        status: "stopped",
      });
    } else if (action === "status") {
      return Response.json({
        status: isRunning ? "running" : "stopped",
        lastRun,
        nextRun: isRunning ? getNextRunTime(interval) : null,
      });
    } else if (action === "run-now") {
      // Trigger immediate scraping
      const result = await runScraper();
      return Response.json({
        message: "Scraper executed immediately",
        result,
      });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Scheduler error:", error);
    return Response.json(
      { error: "Failed to manage scheduler", details: error.message },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  // Get scheduler status
  return Response.json({
    status: isRunning ? "running" : "stopped",
    lastRun,
    nextRun: isRunning ? getNextRunTime("hourly") : null,
  });
}

function scheduleNextRun(interval) {
  if (!isRunning) return;

  const delays = {
    hourly: 60 * 60 * 1000, // 1 hour
    daily: 24 * 60 * 60 * 1000, // 24 hours
    weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const delay = delays[interval] || delays["hourly"];

  setTimeout(async () => {
    if (isRunning) {
      console.log(`Running scheduled scraper (${interval})`);
      await runScraper();
      scheduleNextRun(interval); // Schedule next run
    }
  }, delay);
}

function getNextRunTime(interval) {
  const now = new Date();
  const delays = {
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
  };

  const delay = delays[interval] || delays["hourly"];
  return new Date(now.getTime() + delay);
}

async function runScraper() {
  try {
    console.log("Starting scheduled scraper run...");
    lastRun = new Date();

    // Import and call the scraper directly instead of using fetch
    const { POST } = await import("../run/route.js");
    const mockRequest = new Request("http://localhost/api/scraper/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(mockRequest);

    if (response.ok) {
      const result = await response.json();
      console.log("Scheduled scraper completed:", result);

      // Log the run to database
      await sql`
        INSERT INTO scraper_runs (
          run_time, status, articles_scraped, articles_saved, details
        ) VALUES (
          ${lastRun}, 'success', ${result.totalScraped}, ${result.totalSaved}, ${JSON.stringify(result)}
        )
      `;

      return result;
    } else {
      const errorText = await response.text();
      throw new Error(`Scraper failed: ${errorText}`);
    }
  } catch (error) {
    console.error("Scheduled scraper error:", error);

    // Log the error to database
    try {
      await sql`
        INSERT INTO scraper_runs (
          run_time, status, articles_scraped, articles_saved, error_message
        ) VALUES (
          ${lastRun}, 'error', 0, 0, ${error.message}
        )
      `;
    } catch (dbError) {
      console.error("Failed to log scraper error:", dbError);
    }

    return { error: error.message };
  }
}
