import { createAdminClient } from '@supabase/server/core';
import dotenv from 'dotenv';
dotenv.config();

export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wmrvhihrwskuzoiifaug.supabase.co';
export const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';
export const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_uz1mjpwpV8t1QBtS4Fwj4Q_1qGF-KZB';

// Set them into process.env so @supabase/server can resolve them
process.env.SUPABASE_URL = SUPABASE_URL;
process.env.SUPABASE_SECRET_KEY = SUPABASE_SECRET_KEY;
process.env.SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY;

export const supabaseAdmin = createAdminClient();
export const STORAGE_BUCKET = 'talma-media';
