/**
 * Returns a formatted date string (YYYY-MM-DD) for a given date.
 */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Returns dynamic date ranges to prevent requesting future dates which cause API errors.
 */
export function getDynamicDateRange(daysBack = 7): { startDate: string; endDate: string } {
  const today = new Date();
  const past = new Date(today.getTime() - daysBack * 24 * 60 * 60 * 1000);

  return {
    startDate: formatDate(past),
    endDate: formatDate(today),
  };
}
