import { Bot, X, Send } from "lucide-react";

export default function AIAssistantModal({
  show,
  onClose,
  question,
  setQuestion,
  response,
  loading,
  onSubmit,
  onSourceClick,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="text-white" size={16} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Legal AI Assistant
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={onSubmit} className="mb-6">
            <div className="flex space-x-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about legal developments, cases, or regulations..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#262626] text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center w-12"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </form>

          {response && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-[#262626] p-4 rounded-lg">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {response.answer}
                </p>
              </div>
              {response.sources && response.sources.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Related Sources:
                  </h4>
                  <div className="space-y-2">
                    {response.sources.map((source, index) => (
                      <div
                        key={index}
                        className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        onClick={() => onSourceClick(source)}
                      >
                         <h5 className="font-medium text-blue-900 dark:text-blue-100">{source.title}</h5>
                         <div className="flex items-center space-x-2 mt-1">
                             <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded">{source.category}</span>
                             <span className="text-xs text-blue-600 dark:text-blue-300">{source.jurisdiction}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {response.followUp && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Follow-up Questions:
                  </h4>
                  <div className="space-y-2">
                    {response.followUp.map((q, index) => (
                      <button
                        key={index}
                        onClick={() => setQuestion(q)}
                        className="block w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
