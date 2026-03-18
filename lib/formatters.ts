import { format } from 'date-fns';

/**
 * Formats a date string or Date object into DD/MM/YYYY format.
 * @param date - The date to format.
 * @returns The formatted date string.
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return format(d, 'dd/MM/yyyy');
};

/**
 * Formats a date string or Date object into DD/MM/YYYY HH:MM format.
 * @param date - The date to format.
 * @returns The formatted date and time string.
 */
export const formatDateTime = (date: string | Date): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return format(d, 'dd/MM/yyyy HH:mm');
};
