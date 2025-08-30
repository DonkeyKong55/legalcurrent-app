import { TrendingUp } from "lucide-react";

export default function TrendingTopics({ topics, onTopicClick }) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="text-green-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Trending Topics
        </h3>
      </div>
      <div className="space-y-4">
        {topics.map((topic, index) => (
          <div
            key={index}
            className="flex items-start justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#262626] p-2 rounded-lg transition-colors"
            onClick={() => onTopicClick(topic)}
          >
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                #{index + 1} {topic.topic.slice(0, 30)}
                {topic.topic.length > 30 ? "..." : ""}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {topic.article_count} articles • {topic.search_count} searches
              </p>
              <div className="flex items-center space-x-2 mt-1">
                {topic.category && (
                  <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
                    {topic.category}
                  </span>
                )}
                {topic.jurisdiction && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {topic.jurisdiction}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
