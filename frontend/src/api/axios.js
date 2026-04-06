// // import axios from 'axios';

// // // All API calls go through this one instance
// // // So we never repeat the base URL anywhere
// // const api = axios.create({
// //   baseURL: 'http://localhost:5000/api',
// // });

// // // Before every request, attach the JWT token if it exists
// // api.interceptors.request.use((config) => {
// //   const token = localStorage.getItem('token');
// //   if (token) {
// //     config.headers.Authorization = `Bearer ${token}`;
// //   }
// //   return config;
// // });

// // export default api;
// import axios from 'axios';

// // In development: use localhost
// // In production: use the live Render backend URL
// const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// const api = axios.create({ baseURL });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;