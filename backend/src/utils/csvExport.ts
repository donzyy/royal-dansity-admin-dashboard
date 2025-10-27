import { Response } from 'express';

/**
 * CSV Export Utility
 * Generates CSV files from data arrays
 */

/**
 * Convert array of objects to CSV string
 */
export const arrayToCSV = (data: any[], headers?: string[]): string => {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = csvHeaders.map(escapeCSVValue).join(',');

  // Create data rows
  const dataRows = data.map((row) => {
    return csvHeaders
      .map((header) => {
        const value = row[header];
        return escapeCSVValue(value);
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
const escapeCSVValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }

  // Convert to string
  let stringValue = String(value);

  // Handle dates
  if (value instanceof Date) {
    stringValue = value.toISOString();
  }

  // Handle objects/arrays (convert to JSON)
  if (typeof value === 'object' && !(value instanceof Date)) {
    stringValue = JSON.stringify(value);
  }

  // Escape quotes and wrap in quotes if contains special characters
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    stringValue = `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Send CSV file as download response
 */
export const sendCSVResponse = (
  res: Response,
  data: any[],
  filename: string,
  headers?: string[]
): void => {
  const csv = arrayToCSV(data, headers);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
};

/**
 * Format data for CSV export (flatten nested objects)
 */
export const flattenForCSV = (data: any[]): any[] => {
  return data.map((item) => flattenObject(item));
};

/**
 * Flatten nested object into single-level object
 */
const flattenObject = (obj: any, prefix = ''): any => {
  const flattened: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        // Convert arrays to comma-separated strings
        flattened[newKey] = value.join('; ');
      } else {
        flattened[newKey] = value;
      }
    }
  }

  return flattened;
};

export default {
  arrayToCSV,
  sendCSVResponse,
  flattenForCSV,
};


