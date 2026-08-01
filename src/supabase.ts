/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = (
  import.meta.env.VITE_SUPABASE_URL || 'https://rqulvpciliclkduuvkhq.supabase.co'
).trim();
const defaultKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdWx2cGNpbGljbGtkdXV2a2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MzM0MzgsImV4cCI6MjA5OTQwOTQzOH0.3db4vQ123_67LA08hcCfXlc8OI7srOkasNSEMjRitjo'
).trim();

export interface SupabaseConfig {
  url: string;
  key: string;
  isConfigured: boolean;
  source: 'env' | 'custom' | 'none';
}

export function isValidSupabaseUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (
    trimmed.includes('MY_') ||
    trimmed.includes('YOUR_') ||
    trimmed.includes('example.com')
  ) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidSupabaseKey(key: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed.length < 10) return false;
  if (
    trimmed.includes('MY_') ||
    trimmed.includes('YOUR_') ||
    trimmed === 'MY_SUPABASE_ANON_KEY'
  ) {
    return false;
  }
  return true;
}

export function getSupabaseConfig(): SupabaseConfig {
  const customUrl =
    typeof window !== 'undefined'
      ? (localStorage.getItem('pulse_supabase_url') || '').trim()
      : '';
  const customKey =
    typeof window !== 'undefined'
      ? (localStorage.getItem('pulse_supabase_key') || '').trim()
      : '';

  if (isValidSupabaseUrl(customUrl) && isValidSupabaseKey(customKey)) {
    return {
      url: customUrl,
      key: customKey,
      isConfigured: true,
      source: 'custom',
    };
  }

  if (isValidSupabaseUrl(defaultUrl) && isValidSupabaseKey(defaultKey)) {
    return {
      url: defaultUrl,
      key: defaultKey,
      isConfigured: true,
      source: 'env',
    };
  }

  return {
    url: customUrl || defaultUrl,
    key: customKey || defaultKey,
    isConfigured: false,
    source: 'none',
  };
}

let cachedClient: SupabaseClient | null = null;
let cachedClientKey = '';

export function getSupabaseClient(
  overrideUrl?: string,
  overrideKey?: string
): SupabaseClient | null {
  const config = getSupabaseConfig();
  const url = overrideUrl || config.url;
  const key = overrideKey || config.key;

  if (!isValidSupabaseUrl(url) || !isValidSupabaseKey(key)) {
    return null;
  }

  const clientKey = `${url}:${key}`;
  if (cachedClient && cachedClientKey === clientKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key);
    cachedClientKey = clientKey;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function saveCustomSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pulse_supabase_url', url.trim());
    localStorage.setItem('pulse_supabase_key', key.trim());
    cachedClient = null;
    cachedClientKey = '';
  }
}

export function clearCustomSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pulse_supabase_url');
    localStorage.removeItem('pulse_supabase_key');
    cachedClient = null;
    cachedClientKey = '';
  }
}
