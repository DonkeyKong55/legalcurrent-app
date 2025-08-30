import { Search, Filter } from "lucide-react";

export default function Filters({
  searchQuery,
  setSearchQuery,
  selectedJurisdiction,
  setSelectedJurisdiction,
  selectedPracticeArea,
  setSelectedPracticeArea,
}) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search legal articles, cases, and legislation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#262626] text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={selectedJurisdiction}
            onChange={(e) => setSelectedJurisdiction(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#262626] text-gray-900 dark:text-white"
          >
            <option>All Jurisdictions</option>
            <option>Federal</option>
            <option>NSW</option>
            <option>VIC</option>
            <option>QLD</option>
            <option>WA</option>
            <option>SA</option>
            <option>TAS</option>
            <option>ACT</option>
            <option>NT</option>
          </select>
          <select
            value={selectedPracticeArea}
            onChange={(e) => setSelectedPracticeArea(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#262626] text-gray-900 dark:text-white"
          >
            <option>All Practice Areas</option>
            <option>Consumer Law</option>
            <option>Corporate Law</option>
            <option>Competition Law</option>
            <option>Financial Services</option>
            <option>Property Law</option>
            <option>Constitutional Law</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
        <Filter size={16} className="mr-2" />
        Advanced filtering available with subscription
      </div>
    </div>
  );
}
