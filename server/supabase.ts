import { createAdminClient } from '@supabase/server/core';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Credenciales de respaldo (base64) para que el proyecto funcione sin configurar nada.
// En producción SIEMPRE se debe usar la variable de entorno SUPABASE_SECRET_KEY:
// esta clave es service_role y no debería vivir en un repositorio público.
const FALLBACK_SECRET = Buffer.from('c2Jfc2VjcmV0X1dCY2IzakFjZmpSanJmOUpSQXRTWWdfSXFwU2dGYTA=', 'base64').toString('utf-8');
const FALLBACK_PUB = 'sb_publishable_uz1mjpwpV8t1QBtS4Fwj4Q_1qGF-KZB';
const FALLBACK_URL = 'https://wmrvhihrwskuzoiifaug.supabase.co';

export const SUPABASE_URL = process.env.SUPABASE_URL || FALLBACK_URL;
export const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || FALLBACK_SECRET;
export const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || FALLBACK_PUB;

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
