export const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return isoString;
  }
};

export const formatRelativeTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} mins ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    return `${Math.floor(diffSeconds / 86400)} days ago`;
  } catch {
    return 'Recently';
  }
};

export const getRiskBadgeColor = (risk: string) => {
  switch (risk?.toLowerCase()) {
    case 'high':
    case 'severe':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'medium':
    case 'moderate':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
};
