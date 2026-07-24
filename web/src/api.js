import axios from 'axios';
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:3000/api'});
const isMobileApp=()=>Boolean(window.Capacitor?.isNativePlatform?.())||/; wv\)/i.test(navigator.userAgent);
api.interceptors.request.use(c=>{const t=localStorage.getItem('rofis_token');if(t)c.headers.Authorization=`Bearer ${t}`;c.headers['X-Client-Platform']=isMobileApp()?'mobile':'web';return c});
