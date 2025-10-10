"use client";

import axios from "axios";
import dataProviderSimpleRest from "@refinedev/simple-rest";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Pass custom axiosInstance to dataProvider
export const dataProvider = dataProviderSimpleRest(API_URL, axiosInstance);
