"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  BookOpen,
  Calendar,
  Tag,
  ExternalLink,
  Sparkles,
  Brain,
  Lightbulb,
} from "lucide-react";
import Header from "@/components/layout/Header";

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedJurisdiction, setSelectedJurisdiction] =
    useState("All Jurisdictions");
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 12;

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const fetchArticles = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          search: searchQuery,
          jurisdiction: selectedJurisdiction,
          practiceArea: selectedCategory,
          limit: articlesPerPage.toString(),
          offset: ((page - 1) * articlesPerPage).toString(),
        });

        const response = await fetch(`/api/articles?${params}`);
        if (response.ok) {
          const data = await response.json();
          setArticles(data);
          setTotalResults(
            data.length === articlesPerPage
              ? page * articlesPerPage + 1
              : (page - 1) * articlesPerPage + data.length,
          );
          setSearchResults(null); // Clear AI search results when doing regular search
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, selectedJurisdiction, selectedCategory, articlesPerPage],
  );

  const performAISearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      fetchArticles(1);
      return;
    }

    try {
      setAiSearchLoading(true);
      setSearchResults(null);

      const response = await fetch("/api/library/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          category:
            selectedCategory !== "All Categories" ? selectedCategory : null,
          jurisdiction:
            selectedJurisdiction !== "All Jurisdictions"
              ? selectedJurisdiction
              : null,
        }),
      });

      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        setArticles(results.articles || []);
        setTotalResults(results.totalResults || 0);
      } else {
        // Fallback to regular search
        fetchArticles(1);
      }
    } catch (error) {
      console.error("Error performing AI search:", error);
      // Fallback to regular search
      fetchArticles(1);
    } finally {
      setAiSearchLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedJurisdiction, fetchArticles]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      if (searchQuery.trim()) {
        performAISearch();
      } else {
        fetchArticles(1);
      }
    }, 500); // Slightly longer delay for AI search
    return () => clearTimeout(handler);
  }, [
    searchQuery,
    selectedCategory,
    selectedJurisdiction,
    performAISearch,
    fetchArticles,
  ]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchArticles(currentPage);
    }
  }, [currentPage, fetchArticles]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const jurisdictions = [
    "All Jurisdictions",
    "Federal",
    "NSW",
    "VIC",
    "QLD",
    "SA",
    "WA",
    "TAS",
    "NT",
    "ACT",
  ];

  const totalPages = Math.ceil(totalResults / articlesPerPage);
  const isAISearch = searchQuery.trim() && searchResults;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Legal Library</h1>
            <Sparkles className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-gray-600">
            Search and explore our comprehensive collection of legal articles
            with AI-powered insights
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          {/* AI Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ask questions like 'What are recent privacy law changes?' or search for specific topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {(aiSearchLoading ||
                (searchQuery.trim() && !searchResults && loading)) && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Brain className="w-5 h-5 text-purple-500 animate-pulse" />
                </div>
              )}
            </div>
            {searchQuery.trim() && (
              <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI-powered search active - analyzing your query for the best
                results
              </p>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All Categories">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jurisdiction
              </label>
              <select
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {jurisdictions.map((jurisdiction) => (
                  <option key={jurisdiction} value={jurisdiction}>
                    {jurisdiction}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery ||
            selectedCategory !== "All Categories" ||
            selectedJurisdiction !== "All Jurisdictions") && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Search: "{searchQuery}"
                  </span>
                )}
                {selectedCategory !== "All Categories" && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    <Tag className="w-3 h-3 mr-1" />
                    {selectedCategory}
                  </span>
                )}
                {selectedJurisdiction !== "All Jurisdictions" && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {selectedJurisdiction}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Search Results Summary */}
        {isAISearch && searchResults && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6 mb-6">
            <div className="flex items-start gap-3">
              <Brain className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  AI Analysis
                </h3>
                <p className="text-gray-700 mb-4">
                  {searchResults.searchSummary}
                </p>

                {searchResults.searchAnalysis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Key Concepts Found:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {searchResults.searchAnalysis.legal_concepts
                          ?.slice(0, 4)
                          .map((concept, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                            >
                              {concept}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Likely Practice Areas:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {searchResults.searchAnalysis.likely_categories
                          ?.slice(0, 3)
                          .map((category, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {category}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Results with AI Suggestions */}
        {isAISearch &&
          searchResults &&
          searchResults.articles.length === 0 &&
          searchResults.suggestions && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Try These Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {searchResults.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-gray-700">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            {loading || aiSearchLoading ? (
              <span className="flex items-center gap-2">
                {aiSearchLoading && (
                  <Brain className="w-4 h-4 animate-pulse text-purple-500" />
                )}
                {aiSearchLoading
                  ? "AI is analyzing your search..."
                  : "Searching..."}
              </span>
            ) : (
              `Showing ${articles.length} ${articles.length === 1 ? "result" : "results"}${isAISearch ? " (AI-powered)" : ""}`
            )}
          </div>
        </div>

        {/* Articles Grid */}
        {loading || aiSearchLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters to find more articles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Article Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {article.priority === "high" && (
                        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                          High Priority
                        </span>
                      )}
                      {article.category && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          <Tag className="w-3 h-3 mr-1" />
                          {article.category}
                        </span>
                      )}
                      {isAISearch && article.relevance_score && (
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {Math.round(article.relevance_score * 100)}% match
                        </span>
                      )}
                    </div>
                    {article.impact_score && (
                      <div className="text-xs text-gray-500">
                        Impact: {article.impact_score}/10
                      </div>
                    )}
                  </div>

                  {/* Article Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Article Summary */}
                  {article.summary && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="w-3 h-3 text-purple-500" />
                        <span className="text-xs text-purple-600 font-medium">
                          AI Summary
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {article.summary}
                      </p>
                    </div>
                  )}

                  {/* Article Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.published_at)}
                      </div>
                      {article.jurisdiction && (
                        <span>{article.jurisdiction}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{article.source}</span>
                      {article.source_url && (
                        <a
                          href={article.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Keywords */}
                  {article.keywords && article.keywords.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {article.keywords.slice(0, 3).map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                        {article.keywords.length > 3 && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{article.keywords.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !isAISearch && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm border rounded-lg ${
                    currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
