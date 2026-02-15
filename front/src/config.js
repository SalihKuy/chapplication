let API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  API_BASE_URL = 'https://7031-213-142-134-32.ngrok-free.app/ch';
}

export default API_BASE_URL;
