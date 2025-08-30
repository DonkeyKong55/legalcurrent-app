import { useState, useEffect, useCallback } from "react";

export function useDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("All Jurisdictions");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState("All Practice Areas");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    articlesToday: 0,
    highPriority: 0,
    weeklyTotal: 0,
    totalViews: 0,
  });
  const [trendingTopics, setTrendingTopics] = useState([]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) setDashboardStats(await response.json());
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  }, []);

  const fetchTrendingTopics = useCallback(async () => {
    try {
      const response = await fetch("/api/trending?limit=5");
      if (response.ok) setTrendingTopics(await response.json());
    } catch (error) {
      console.error("Error fetching trending topics:", error);
    }
  }, []);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchQuery,
        jurisdiction: selectedJurisdiction,
        practiceArea: selectedPracticeArea,
      });
      const response = await fetch(`/api/articles?${params}`);
      if (response.ok) setArticles(await response.json());
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedJurisdiction, selectedPracticeArea]);

  useEffect(() => {
    fetchDashboardStats();
    fetchTrendingTopics();
  }, [fetchDashboardStats, fetchTrendingTopics]);
  
  useEffect(() => {
    const handler = setTimeout(() => fetchArticles(), 300);
    return () => clearTimeout(handler);
  }, [fetchArticles]);

  return {
    searchQuery,
    setSearchQuery,
    selectedJurisdiction,
    setSelectedJurisdiction,
    selectedPracticeArea,
    setSelectedPracticeArea,
    articles,
    loading,
    dashboardStats,
    trendingTopics,
  };
}
