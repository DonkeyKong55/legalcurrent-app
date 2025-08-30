export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInHours < 24) {
    return `about ${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  } else if (diffInDays < 30) {
    return `about ${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  } else {
    return `about ${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
  }
};
