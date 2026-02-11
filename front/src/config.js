let API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  API_BASE_URL = 'https://41d3ac91dbf7.ngrok-free.app/ch';
}

export default API_BASE_URL;
