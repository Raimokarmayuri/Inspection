// import axios from 'axios';
// import { hostName } from '../../config/config';

// const http = axios.create({
//   baseURL: hostName,
//   headers: {
//     Accept: 'application/json',
//     'Content-Type': 'application/json',
//   },
// });

// export default http;
// /instance.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import qs from "qs";
import { hostName } from "../config/config";

const instance = axios.create({
  baseURL: hostName,
  paramsSerializer(params) {
    return qs.stringify(params, { indices: false });
  },
});

instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");

    // ✅ Safely mutate config.headers without reassigning
    if (config.headers) {
      config.headers["Accept"] = "application/json";
      config.headers["Content-Type"] = "application/json";
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// export default instance;

export const http = instance;

export default http;