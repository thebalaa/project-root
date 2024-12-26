// src/utils/helpers.ts

/**
 * helpers.ts
 * 
 * Provides utility functions for the web portal.
 */

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string | null} The authentication token or null if not found.
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Generates a unique identifier.
 * @returns {string} A unique identifier string.
 */
export const generateId = (): string => {
  return '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Validates JSON strings.
 * @param {string} str - The JSON string to validate.
 * @returns {boolean} True if valid JSON, false otherwise.
 */
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};
