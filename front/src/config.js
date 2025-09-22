let API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  API_BASE_URL = 'https://9063448c680d5a62135cbc0c64904cd4.serveo.net/ch';
}

export default API_BASE_URL;
