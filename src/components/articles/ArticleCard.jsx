import { BookOpen, Sparkles, ArrowRight, Bot } from "lucide-react";
import { getCategoryColor, getPriorityColor } from "@/utils/colors";
import { formatDate } from "@/utils/formatDate";

export default function ArticleCard({ article, isExpanded, onClick }) {
  return (
    <article
      className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer overflow-hidden group"
      onClick={onClick}
    >
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getCategoryColor(article.category)}`}>
                {article.category}
              </span>
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getCategoryColor(article.jurisdiction)}`}>
                {article.jurisdiction}
              </span>
            </div>
            {article.priority && (
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${article.priority?.toLowerCase() === "high" ? "bg-red-500" : article.priority?.toLowerCase() === "medium" ? "bg-yellow-500" : "bg-gray-400"}`}></div>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(article.priority)}`}>
                  {article.priority}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Sparkles size={14} className="text-blue-500" />
              <span className="font-medium">Impact: {article.impact_score}/10</span>
            </div>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3">
          {article.summary}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <BookOpen size={12} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">{article.source}</span>
            <span>•</span>
            <span>{formatDate(article.published_at)}</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-medium">
            <span className="text-xs uppercase tracking-wide">{isExpanded ? "Click to collapse" : "Read more"}</span>
            <ArrowRight size={16} className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : "group-hover:translate-x-0.5"}`} />
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#262626]">
          <div className="p-6">
            <div className="prose dark:prose-invert max-w-none mb-6">
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                {article.content || "Full article content would appear here..."}
              </div>
            </div>
            {article.source_url && (
              <div className="mb-4">
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Read Original Source
                  <ArrowRight size={14} className="ml-2" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      {article.ai_insights && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm uppercase tracking-wide">
                  AI Legal Analysis
                </h4>
                <p className="text-blue-800 dark:text-blue-200 leading-relaxed text-sm">
                  {article.ai_insights}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
