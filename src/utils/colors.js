export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "text-red-600 bg-red-50 border-red-200";
    case "medium":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

export const getCategoryColor = (category) => {
  const colors = {
    "Consumer Law": "text-blue-600 bg-blue-50 border-blue-200",
    "Corporate Law": "text-purple-600 bg-purple-50 border-purple-200",
    "Competition Law": "text-green-600 bg-green-50 border-green-200",
    "Financial Services": "text-orange-600 bg-orange-50 border-orange-200",
    "Property Law": "text-teal-600 bg-teal-50 border-teal-200",
    "Constitutional Law": "text-indigo-600 bg-indigo-50 border-indigo-200",
  };
  return colors[category] || "text-gray-600 bg-gray-50 border-gray-200";
};
