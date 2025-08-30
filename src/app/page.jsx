"use client";
import { useDashboard } from "@/hooks/useDashboard";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import Header from "@/components/layout/Header";
import DashboardStats from "@/components/dashboard/DashboardStats";
import Filters from "@/components/dashboard/Filters";
import ArticleList from "@/components/articles/ArticleList";
import TrendingTopics from "@/components/dashboard/TrendingTopics";
import AIAssistant from "@/components/dashboard/AIAssistant";
import AIAssistantModal from "@/components/ai/AIAssistantModal";

export default function LegalNewsDashboard() {
  const {
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
  } = useDashboard();

  const {
    showAIAssistant,
    aiQuestion,
    setAiQuestion,
    aiResponse,
    aiLoading,
    handleAIQuestion,
    openModal,
    closeModal,
  } = useAIAssistant();

  const handleTrendingTopicClick = (topic) => {
    setSearchQuery(topic.topic);
    closeModal();
  };
  
  const handleSourceClick = (source) => {
     setSearchQuery(source.title);
     closeModal();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-[Inter]">
            Legal News Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with the latest Australian legal developments powered by AI
          </p>
        </div>

        <DashboardStats stats={dashboardStats} />

        <Filters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedJurisdiction={selectedJurisdiction}
          setSelectedJurisdiction={setSelectedJurisdiction}
          selectedPracticeArea={selectedPracticeArea}
          setSelectedPracticeArea={setSelectedPracticeArea}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ArticleList articles={articles} loading={loading} />

          <aside className="space-y-6">
            <TrendingTopics topics={trendingTopics} onTopicClick={handleTrendingTopicClick} />
            <AIAssistant onAsk={openModal} />
          </aside>
        </div>
      </main>

      <AIAssistantModal
        show={showAIAssistant}
        onClose={closeModal}
        question={aiQuestion}
        setQuestion={setAiQuestion}
        response={aiResponse}
        loading={aiLoading}
        onSubmit={handleAIQuestion}
        onSourceClick={handleSourceClick}
      />
    </div>
  );
}
