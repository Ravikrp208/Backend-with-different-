import axios from 'axios';

 export let axiosInstance = axios.create({
    baseURL: 'http://api.team-sync.space/api',
    withCredentials: true,


});