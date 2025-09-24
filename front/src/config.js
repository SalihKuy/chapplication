let API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  API_BASE_URL = 'https://ead402a9be8f.ngrok-free.app/ch';
}

export default API_BASE_URL;
