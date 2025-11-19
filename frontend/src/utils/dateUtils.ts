export function isSameUTCDay(lastFetchTime: string | null): boolean {
  if (!lastFetchTime) return false;
  
  const now = new Date();
  const lastFetchDate = new Date(parseInt(lastFetchTime));
  
  return lastFetchDate.getUTCFullYear() === now.getUTCFullYear() &&
         lastFetchDate.getUTCMonth() === now.getUTCMonth() &&
         lastFetchDate.getUTCDate() === now.getUTCDate();
} 