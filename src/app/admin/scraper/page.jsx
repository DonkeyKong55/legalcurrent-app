"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RefreshCw,
  Clock,
  Database,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function ScraperAdminPage() {
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [scraperRuns, setScraperRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [runningNow, setRunningNow] = useState(false);
  const [testUrl, setTestUrl] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    fetchSchedulerStatus();
    fetchScraperRuns();
  }, []);

  const fetchSchedulerStatus = async () => {
    try {
      const response = await fetch("/api/scraper/schedule");
      if (response.ok) {
        const data = await response.json();
        setSchedulerStatus(data);
      }
    } catch (error) {
      console.error("Error fetching scheduler status:", error);
    }
  };

  const fetchScraperRuns = async () => {
    try {
      const response = await fetch("/api/scraper/runs");
      if (response.ok) {
        const data = await response.json();
        setScraperRuns(data.runs || []);
      }
    } catch (error) {
      console.error("Error fetching scraper runs:", error);
    }
  };

  const handleSchedulerAction = async (action, interval = "hourly") => {
    setLoading(true);
    try {
      const response = await fetch("/api/scraper/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, interval }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        await fetchSchedulerStatus();
      }
    } catch (error) {
      console.error("Error managing scheduler:", error);
    } finally {
      setLoading(false);
    }
  };

  const runScraperNow = async () => {
    setRunningNow(true);
    try {
      const response = await fetch("/api/scraper/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run-now" }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Scraper run completed:", result);
        await fetchScraperRuns();
        await fetchSchedulerStatus();
      }
    } catch (error) {
      console.error("Error running scraper:", error);
    } finally {
      setRunningNow(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleTestUrl = async () => {
    if (!testUrl.trim()) return;

    setTestLoading(true);
    setTestResults(null);

    try {
      const response = await fetch("/api/scraper/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testUrl: testUrl.trim() }),
      });

      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error("Test error:", error);
      setTestResults({ error: "Test failed", details: error.message });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Article Scraper Management
          </h1>
          <p className="text-gray-600">
            Manage automated article collection from legal news sources
          </p>
        </div>

        {/* Scheduler Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Scheduler Status
            </h2>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                schedulerStatus?.status === "running"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {schedulerStatus?.status || "Unknown"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Last Run</div>
              <div className="font-medium">
                {schedulerStatus?.lastRun
                  ? formatDate(schedulerStatus.lastRun)
                  : "Never"}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Next Run</div>
              <div className="font-medium">
                {schedulerStatus?.nextRun
                  ? formatDate(schedulerStatus.nextRun)
                  : "Not scheduled"}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Status</div>
              <div className="font-medium capitalize">
                {schedulerStatus?.status || "Unknown"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {schedulerStatus?.status !== "running" ? (
              <button
                onClick={() => handleSchedulerAction("start", "hourly")}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Scheduler (Hourly)
              </button>
            ) : (
              <button
                onClick={() => handleSchedulerAction("stop")}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Pause className="w-4 h-4 mr-2" />
                Stop Scheduler
              </button>
            )}

            <button
              onClick={runScraperNow}
              disabled={runningNow}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${runningNow ? "animate-spin" : ""}`}
              />
              Run Now
            </button>

            <button
              onClick={fetchSchedulerStatus}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </button>
          </div>
        </div>

        {/* Recent Runs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Recent Scraper Runs
            </h2>
            <button
              onClick={fetchScraperRuns}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Refresh
            </button>
          </div>

          {scraperRuns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No scraper runs recorded yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Run Time
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Articles Found
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Articles Saved
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scraperRuns.map((run) => (
                    <tr key={run.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm">
                        {formatDate(run.run_time)}
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`flex items-center text-sm ${
                            run.status === "success"
                              ? "text-green-600"
                              : run.status === "error"
                                ? "text-red-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {run.status === "success" ? (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          ) : run.status === "error" ? (
                            <AlertCircle className="w-4 h-4 mr-1" />
                          ) : (
                            <Clock className="w-4 h-4 mr-1" />
                          )}
                          {run.status}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {run.articles_scraped || 0}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {run.articles_saved || 0}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {run.error_message ? (
                          <span className="text-red-600">
                            {run.error_message}
                          </span>
                        ) : run.details ? (
                          <span className="text-gray-600">
                            {(() => {
                              try {
                                const details =
                                  typeof run.details === "string"
                                    ? JSON.parse(run.details)
                                    : run.details;
                                return `${details.sources?.length || 0} sources processed`;
                              } catch (e) {
                                return "Processing details available";
                              }
                            })()}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Configuration Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">
            Scraper Configuration
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              • Scrapes articles from The Guardian Australia, ABC News
              Australia, and Sydney Morning Herald
            </p>
            <p>
              • Uses Google Gemini 2.5 Pro for article analysis and
              categorization
            </p>
            <p>• Automatically detects and skips duplicate articles</p>
            <p>• Runs every hour when scheduler is active</p>
            <p>• Processes up to 10 articles per source per run</p>
          </div>
        </div>

        {/* Debug Testing Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Debug Test URLs
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Test individual URLs to see what content the scraper finds
          </p>

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Test URL:
              </label>
              <div className="flex space-x-3">
                <input
                  type="url"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="https://www.theguardian.com/australia-news/law"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleTestUrl}
                  disabled={testLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-w-[100px]"
                >
                  {testLoading ? "Testing..." : "Test"}
                </button>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setTestUrl("https://www.theguardian.com/australia-news")
                }
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                Guardian Australia
              </button>
              <button
                onClick={() =>
                  setTestUrl(
                    "https://www.abc.net.au/news/topic/law-crime-and-justice",
                  )
                }
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                ABC News Australia
              </button>
              <button
                onClick={() =>
                  setTestUrl("https://www.smh.com.au/topic/legal-affairs-1mgl")
                }
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                Sydney Morning Herald
              </button>
            </div>

            {testResults && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Test Results:
                </h4>
                {testResults.error ? (
                  <div className="text-red-600">
                    <p className="font-medium">Error: {testResults.error}</p>
                    {testResults.details && (
                      <p className="text-sm mt-1">{testResults.details}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-white p-2 rounded">
                        <div className="text-gray-600">HTML Length</div>
                        <div className="font-medium">
                          {testResults.htmlLength?.toLocaleString()} chars
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="text-gray-600">Total Links</div>
                        <div className="font-medium">
                          {testResults.summary?.totalLinks || 0}
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="text-gray-600">Headlines</div>
                        <div className="font-medium">
                          {testResults.summary?.totalHeadlines || 0}
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="text-gray-600">Legal Articles</div>
                        <div className="font-medium">
                          {(testResults.summary?.potentialLegalLinks || 0) +
                            (testResults.summary?.potentialLegalHeadlines || 0)}
                        </div>
                      </div>
                    </div>

                    {testResults.sample?.potentialLegalHeadlines?.length >
                      0 && (
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">
                          Found Legal Headlines:
                        </h5>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {testResults.sample.potentialLegalHeadlines.map(
                            (item, idx) => (
                              <div
                                key={idx}
                                className="bg-white p-2 rounded border"
                              >
                                <div className="font-medium text-sm">
                                  {item.title}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {item.url}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {testResults.sample?.potentialLegalLinks?.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">
                          Found Legal Links:
                        </h5>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {testResults.sample.potentialLegalLinks
                            .slice(0, 5)
                            .map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-white p-2 rounded border"
                              >
                                <div className="font-medium text-sm">
                                  {item.title}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {item.url}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700">
                        View Raw HTML Sample (First 1000 chars)
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                        {testResults.sample?.htmlStart}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
