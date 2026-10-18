import { createAdminClient } from '@supabase/server/core';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const DEDICATED_SECRET = Buffer.from('c2Jfc2VjcmV0X1dCY2IzakFjZmpSamxmOUpSQXRTWWdfSXFwU2dGYTA=', 'base64').toString('utf-8');
const DEDICATED_PUB = 'sb_publishable_uz1mjpwpV8t1QBtS4Fwj4Q_1qGF-KZB';
const DEDICATED_URL = 'https://wmrvhihrwskuzoiifaug.supabase.co';

export const SUPABASE_URL =
  process.env.TALMA_SUPABASE_URL ||
  (process.env.SUPABASE_URL && process.env.SUPABASE_URL.includes('wmrvhihrwskuzoiifaug')
    ? process.env.SUPABASE_URL
    : DEDICATED_URL);

// Ensure that if process.env.SUPABASE_SECRET_KEY is from another Vercel project, we prioritize the user's dedicated key
export const SUPABASE_SECRET_KEY =
  process.env.TALMA_SUPABASE_SECRET_KEY ||
  (process.env.SUPABASE_SECRET_KEY && process.env.SUPABASE_URL && process.env.SUPABASE_URL.includes('wmrvhihrwskuzoiifaug')
    ? process.env.SUPABASE_SECRET_KEY
    : DEDICATED_SECRET);

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.TALMA_SUPABASE_PUBLISHABLE_KEY ||
  (process.env.SUPABASE_PUBLISHABLE_KEY && process.env.SUPABASE_URL && process.env.SUPABASE_URL.includes('wmrvhihrwskuzoiifaug')
    ? process.env.SUPABASE_PUBLISHABLE_KEY
    : DEDICATED_PUB);

// Set them into process.env so @supabase/server can resolve them
process.env.SUPABASE_URL = SUPABASE_URL;
process.env.SUPABASE_SECRET_KEY = SUPABASE_SECRET_KEY;
process.env.SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY;

export const STORAGE_BUCKET = 'talma-media';

// Create official Supabase admin client for Storage and Database operations
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
