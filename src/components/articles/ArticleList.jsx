import { useState } from "react";
import ArticleCard from "./ArticleCard";
import { Bot } from "lucide-react";

const LoadingSkeleton = () => (
    <div className="space-y-6">
        {[1, 2, 3].map((i) => (
            <div
                key={i}
                className="bg-white dark:bg-[#1E1E1E] p-6 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse"
            >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
        ))}
    </div>
);

export default function ArticleList({ articles, loading }) {
  const [expandedArticleId, setExpandedArticleId] = useState(null);

  const handleArticleClick = (articleId) => {
    setExpandedArticleId(expandedArticleId === articleId ? null : articleId);
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Filter Results
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Bot size={16} />
          <span>AI-Enhanced Analysis</span>
        </div>
      </div>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isExpanded={expandedArticleId === article.id}
              onClick={() => handleArticleClick(article.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
