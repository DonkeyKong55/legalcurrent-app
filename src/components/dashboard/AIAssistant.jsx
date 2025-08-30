import { Bot } from "lucide-react";

export default function AIAssistant({ onAsk }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Bot className="text-white" size={16} />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Legal AI Assistant
        </h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Get instant insights on legal developments, case summaries, and regulatory changes.
      </p>
      <button
        onClick={onAsk}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
      >
        Ask AI Assistant
      </button>
    </div>
  );
}
