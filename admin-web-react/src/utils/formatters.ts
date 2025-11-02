import { format, parseISO } from 'date-fns';

export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'yyyy-MM-dd');
};

export const formatDateTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'yyyy-MM-dd HH:mm');
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

