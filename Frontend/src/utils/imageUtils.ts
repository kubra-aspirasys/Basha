/**
 * Constructs a full URL for an image, handling both absolute and relative paths.
 * In production, uploads are routed through /api/uploads to leverage
 * the existing /api proxy in Apache, avoiding a separate /uploads proxy rule.
 * @param url The image URL or relative path from the database
 * @returns The full URL to be used in an <img> tag
 */
export const getImageUrl = (url?: string | null): string => {
  if (!url) return '';
  
  // If it's already an absolute URL or a data URI, return it as is
  if (
    url.startsWith('http://') || 
    url.startsWith('https://') || 
    url.startsWith('data:') || 
    url.startsWith('blob:')
  ) {
    return url;
  }

  // Get the base API URL from environment variables
  // Expected format: http://domain.com/api or http://localhost:5009/api
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5009/api';
  
  // Remove trailing slashes and the /api suffix to get the root URL
  let baseUrl = apiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  
  // Ensure the relative path starts with a single slash
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  
  // Route /uploads/* through /api/uploads/* so the existing /api proxy handles it
  if (cleanPath.startsWith('/uploads/')) {
    return `${baseUrl}/api${cleanPath}`;
  }

  // Combine base URL and clean path
  return `${baseUrl}${cleanPath}`;
};
