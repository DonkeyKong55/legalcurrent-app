import { BookOpen } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-[Inter]">
                LegalCurrent
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI-Powered Legal News
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              className="text-gray-900 dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => (window.location.href = "/")}
            >
              Dashboard
            </button>
            <button
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => (window.location.href = "/library")}
            >
              Library
            </button>
            <button
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => (window.location.href = "/pricing")}
            >
              Pricing
            </button>
            <button
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => alert("Saved articles feature coming soon!")}
            >
              Saved
            </button>
            <button
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => (window.location.href = "/contact")}
            >
              Contact
            </button>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
              onClick={() => alert("Sign in coming soon!")}
            >
              Sign In
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              onClick={() => (window.location.href = "/pricing")}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
