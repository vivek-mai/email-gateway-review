import axios from 'axios';

export const axiosClient = (url, params = {}, headers = {}) => {

    const axiosInstance = axios.create({
      baseURL: url,
      headers,
      params,
      validateStatus: () => true
    });
  
  

  return axiosInstance;
}
