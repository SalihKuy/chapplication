let API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// If no env variable is set, try to fetch the current ngrok URL
if (!API_BASE_URL) {
  // Fallback to a known URL - update this manually when needed
  API_BASE_URL = 'https://mighty-lemons-doubt.loca.lt/ch';
}

export default API_BASE_URL;
