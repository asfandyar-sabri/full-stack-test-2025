// src/lib/api.ts
import axios, { AxiosRequestHeaders } from 'axios';
import { supabase } from './supabase-browser';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    // ensure headers object exists, then set Authorization only
    (config.headers as AxiosRequestHeaders) = (config.headers as AxiosRequestHeaders) ?? {};
    (config.headers as AxiosRequestHeaders)['Authorization'] = `Bearer ${session.access_token}`;
  }
  return config;
});
