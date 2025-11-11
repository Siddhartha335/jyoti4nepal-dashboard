// src/providers/data-provider/index.ts
"use client";

import axios from "axios";
import dataProviderSimpleRest from "@refinedev/simple-rest";
import type { DataProvider } from "@refinedev/core";
import { createBlogDataProvider } from "./blog";
import { createGalleryDataProvider } from "./gallery";
import { createTestimonialDataProvider } from "./testimonial";
import { createFaqDataProvider } from "./faq";
import { createUserDataProvider } from "./user";
import { createTermDataProvider } from "./term";
import { createSettingDataProvider } from "./setting";
import { createProductDataProvider } from "./product";
import { createTeamDataProvider } from "./team";

const API_URL: string | undefined = process.env.NEXT_PUBLIC_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const base = dataProviderSimpleRest(API_URL ?? "", axiosInstance);

// Initialize blog data provider
const blogDataProvider = createBlogDataProvider(axiosInstance);
const galleryDataProvider = createGalleryDataProvider(axiosInstance);
const testimonialDataProvider = createTestimonialDataProvider(axiosInstance);
const faqDataProvider = createFaqDataProvider(axiosInstance);
const userDataProvider = createUserDataProvider(axiosInstance);
const termDataProvider = createTermDataProvider(axiosInstance);
const settingDataProvider = createSettingDataProvider(axiosInstance);
const productDataProvider = createProductDataProvider(axiosInstance);
const teamDataProvider = createTeamDataProvider(axiosInstance);


// Resources that need custom handling
const CUSTOM_RESOURCES: Record<string, any> = {
  blog: blogDataProvider,
  gallery: galleryDataProvider,
  testimonial: testimonialDataProvider,
  faq: faqDataProvider,
  user: userDataProvider,
  term: termDataProvider,
  setting: settingDataProvider,
  product:productDataProvider,
  team:teamDataProvider
};

// Main data provider with resource-specific handling
export const dataProvider: DataProvider = {
  ...base,

  async getList(params) {
    const customProvider = CUSTOM_RESOURCES[params.resource];
    return customProvider 
      ? customProvider.getList(params)
      : base.getList(params);
  },

  async getOne(params) {
    const customProvider = CUSTOM_RESOURCES[params.resource];
    return customProvider 
      ? customProvider.getOne(params)
      : base.getOne(params);
  },

  async create(params) {
    const customProvider = CUSTOM_RESOURCES[params.resource];
    return customProvider 
      ? customProvider.create(params)
      : base.create(params);
  },

  async update(params) {
    const customProvider = CUSTOM_RESOURCES[params.resource];
    return customProvider 
      ? customProvider.update(params)
      : base.update(params);
  },

  async deleteOne(params) {
    const customProvider = CUSTOM_RESOURCES[params.resource];
    return customProvider 
      ? customProvider.deleteOne(params)
      : base.deleteOne(params);
  },
};