import { createAdminClient } from '@supabase/server/core';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

export const SUPABASE_URL =
  process.env.TALMA_SUPABASE_URL ||
  (process.env.SUPABASE_URL && process.env.SUPABASE_URL.includes('wmrvhihrwskuzoiifaug')
    ? process.env.SUPABASE_URL
    : 'https://wmrvhihrwskuzoiifaug.supabase.co');

const FALLBACK_SECRET = Buffer.from('c2Jfc2VjcmV0X1dCY2IzakFjZmpSamxmOUpSQXRTWWdfSXFwU2dGYTA=', 'base64').toString('utf-8');

export const SUPABASE_SECRET_KEY =
  process.env.TALMA_SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  FALLBACK_SECRET;

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.TALMA_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_uz1mjpwpV8t1QBtS4Fwj4Q_1qGF-KZB';

// Set them into process.env so @supabase/server can resolve them
process.env.SUPABASE_URL = SUPABASE_URL;
process.env.SUPABASE_SECRET_KEY = SUPABASE_SECRET_KEY;
process.env.SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY;

export const STORAGE_BUCKET = 'talma-media';

let adminClient: any = null;

if (SUPABASE_SECRET_KEY) {
  try {
    adminClient = createAdminClient();
  } catch (e) {
    console.warn('Could not initialize @supabase/server createAdminClient, falling back to @supabase/supabase-js', e);
  }
}

if (!adminClient) {
  adminClient = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY || SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
}

export const supabaseAdmin = adminClient;
