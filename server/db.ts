import fs from 'fs';
import path from 'path';
import { supabaseAdmin, STORAGE_BUCKET, SUPABASE_URL, SUPABASE_SECRET_KEY } from './supabase.ts';

const DB_PATH = path.resolve(process.cwd(), 'data', 'talma_db.json');

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  age?: number | null;
  email?: string;
  password_hash?: string;
  registration_ip?: string;
  last_ip?: string;
  posts_history?: string[];
  avatar_url: string;
  banner_url: string;
  bio: string;
  location: string;
  website: string;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  is_following?: boolean;
  joined_at: string;
}

export interface MediaItem {
  id?: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'gif';
  name?: string;
  size?: number;
  duration?: number;
}

export interface PollData {
  id: string;
  question?: string;
  options: { id: number; text: string; votes: number }[];
  ends_at: string;
  total_votes: number;
  voters?: { [userId: string]: number };
  user_voted_option?: number | null;
}

export interface PostItem {
  id: string;
  user_id: string;
  content: string;
  media: MediaItem[];
  poll?: PollData | null;
  reply_to_id?: string | null;
  quote_id?: string | null;
  is_anonymous?: boolean;
  anonymous_name?: string;
  anonymous_avatar?: string;
  author_ip?: string;
  is_extalmita?: boolean;
  likes_count: number;
  reposts_count: number;
  replies_count: number;
  views_count: number;
  bookmarks_count: number;
  created_at: string;
}

export interface MessageItem {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  created_at: string;
}

/**
 * Sanitiza perfiles para evitar filtración de información privilegiada:
 * Elimina password_hash, registration_ip, last_ip y campos internos.
 */
export function sanitizeProfile(profile: any, includePrivate = false): any {
  if (!profile) return profile;
  const clone = { ...profile };
  delete clone.password_hash;
  delete clone.registration_ip;
  delete clone.last_ip;
  if (!includePrivate) {
    delete clone.email;
    delete clone.posts_history;
  }
  return clone;
}

/**
 * Sanitiza publicaciones para no exponer IPs de autores ni datos privilegiados:
 */
export function sanitizePost(post: any): any {
  if (!post) return post;
  const clone = { ...post };
  delete clone.author_ip;
  delete clone.client_ip;
  if (clone.author) {
    clone.author = sanitizeProfile(clone.author, false);
  }
  if (Array.isArray(clone.replies)) {
    clone.replies = clone.replies.map((r: any) => sanitizePost(r));
  }
  if (clone.quoted_post) {
    clone.quoted_post = sanitizePost(clone.quoted_post);
  }
  return clone;
}

interface DatabaseSchema {
  profiles: UserProfile[];
  posts: PostItem[];
  likes: { user_id: string; post_id: string; created_at: string }[];
  reposts: { user_id: string; post_id: string; created_at: string }[];
  bookmarks: { user_id: string; post_id: string; created_at: string }[];
  hidden_posts?: { user_id: string; post_id: string; hidden_at: string }[];
  /** Tombstones: posts eliminados que NUNCA deben resucitar desde un snapshot remoto obsoleto. */
  deleted_posts?: string[];
  follows: { follower_id: string; following_id: string; created_at: string }[];
  messages: MessageItem[];
}

const INITIAL_DB: DatabaseSchema = {
  profiles: [
    {
      id: 'admin',
      username: 'admin',
      display_name: 'Admin',
      avatar_url: '/avatar-plane.png',
      banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      bio: 'Cuenta Oficial de Administración de Talma 🚀 Plataforma social en tiempo real sobre Supabase. 100% gratuita y sin suscripciones VIP.',
      location: 'Global',
      website: 'https://talma.app',
      is_verified: true,
      followers_count: 0,
      following_count: 0,
      joined_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'extalmita',
      username: 'Extalmita',
      display_name: 'Extalmita 🌐',
      avatar_url: '/avatar-plane.png',
      banner_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
      bio: 'Espacio público oficial de Talma 🌐 Todas las publicaciones de la comunidad se comparten aquí para que todos los usuarios puedan verlas e interactuar libremente en tiempo real.',
      location: 'Comunidad Global',
      website: 'https://talma.app/extalmita',
      is_verified: true,
      followers_count: 142,
      following_count: 0,
      joined_at: '2026-01-01T00:00:00Z',
    },
  ],
  posts: [],
  likes: [],
  reposts: [],
  bookmarks: [],
  hidden_posts: [],
  deleted_posts: ['post_1', 'post_mveb32xvw1bd'],
  follows: [],
  messages: [],
};

let memoryDb: DatabaseSchema | null = null;
const CLOUD_DB_KEY = 'system/talma_db.json';
/** Timestamp de la última escritura local: bloquea las lecturas de nube para no pisar cambios recientes. */
let lastLocalWriteAt = 0;
/** Momento de la última sincronización desde la nube. */
let lastCloudFetch = 0;
/** El push se ENCOLA (no se descarta) para no perder borrados cuando hay escrituras concurrentes. */
let pushChain: Promise<void> = Promise.resolve();
const TOMBSTONE_LIMIT = 1000;
const LOCAL_WRITE_GRACE_MS = 8000;
/** true cuando memoryDb se sembró desde INITIAL_DB (no desde un archivo real). */
let seededFromInitial = false;
/** Promesa del bootstrap de nube: se resuelve cuando ya se intentó leer el snapshot remoto. */
let cloudReady: Promise<void> | null = null;

/** Lista normalizada de ids de posts eliminados. */
function tombstonesOf(state: DatabaseSchema): string[] {
  return Array.isArray(state.deleted_posts) ? state.deleted_posts : [];
}

/**
 * Fusiona un snapshot remoto con el estado local aplicando las tombstones de borrado
 * en ambos sentidos: nunca resucita un post borrado localmente, y absorbe los borrados
 * hechos por otras instancias para que no vuelvan a aparecer.
 */
function mergeRemoteSnapshot(local: DatabaseSchema | null, remote: DatabaseSchema): DatabaseSchema {
  const merged: DatabaseSchema = JSON.parse(JSON.stringify(remote));
  const tombstones = new Set<string>(tombstonesOf(merged));
  if (local) {
    for (const id of tombstonesOf(local)) tombstones.add(id);
  }

  merged.deleted_posts = Array.from(tombstones).slice(-TOMBSTONE_LIMIT);
  merged.posts = (Array.isArray(merged.posts) ? merged.posts : []).filter((p) => !tombstones.has(p.id));
  if (local && !seededFromInitial) {
    // Preserva los posts locales que el remoto todavía no conoce (push pendiente / escritura reciente).
    // Nunca se preserva la semilla INITIAL_DB: si el archivo no existía, la nube es la fuente de verdad.
    const remoteIds = new Set(merged.posts.map((p) => p.id));
    for (const post of local.posts) {
      if (!remoteIds.has(post.id) && !tombstones.has(post.id)) merged.posts.push(post);
    }
  }

  // Preserva los perfiles locales que el remoto todavía no conoce
  if (local && !seededFromInitial && Array.isArray(local.profiles)) {
    merged.profiles = Array.isArray(merged.profiles) ? merged.profiles : [];
    const remoteProfileIds = new Set(merged.profiles.map((p) => p.id));
    for (const profile of local.profiles) {
      if (!remoteProfileIds.has(profile.id)) {
        merged.profiles.push(profile);
      }
    }
  }

  // Preserva los follows locales que el remoto todavía no conoce
  if (local && !seededFromInitial && Array.isArray(local.follows)) {
    merged.follows = Array.isArray(merged.follows) ? merged.follows : [];
    const followKeys = new Set(merged.follows.map((f) => `${f.follower_id}:${f.following_id}`));
    for (const follow of local.follows) {
      const key = `${follow.follower_id}:${follow.following_id}`;
      if (!followKeys.has(key)) {
        merged.follows.push(follow);
        followKeys.add(key);
      }
    }
  }

  // Asegura que las cuentas base (admin y extalmita) existan siempre
  merged.profiles = Array.isArray(merged.profiles) ? merged.profiles : [];
  for (const baseProfile of INITIAL_DB.profiles) {
    if (!merged.profiles.some((p) => p.id === baseProfile.id)) {
      merged.profiles.push({ ...baseProfile });
    }
  }

  // Reconstruye los contadores de interacción a partir de las tablas de relaciones
  // (así un like/repost/bookmark eliminado no queda contado para siempre).
  merged.likes = Array.isArray(merged.likes) ? merged.likes.filter((l) => !tombstones.has(l.post_id)) : [];
  merged.reposts = Array.isArray(merged.reposts) ? merged.reposts.filter((r) => !tombstones.has(r.post_id)) : [];
  merged.bookmarks = Array.isArray(merged.bookmarks) ? merged.bookmarks.filter((b) => !tombstones.has(b.post_id)) : [];
  if (Array.isArray(merged.hidden_posts)) {
    merged.hidden_posts = merged.hidden_posts.filter((h) => !tombstones.has(h.post_id));
  }
  merged.follows = Array.isArray(merged.follows) ? merged.follows : [];

  // Reconcilia contadores canónicos de followers y following a partir de la tabla follows
  const followerCountMap = new Map<string, number>();
  const followingCountMap = new Map<string, number>();
  for (const f of merged.follows) {
    followingCountMap.set(f.follower_id, (followingCountMap.get(f.follower_id) || 0) + 1);
    followerCountMap.set(f.following_id, (followerCountMap.get(f.following_id) || 0) + 1);
  }
  for (const p of merged.profiles) {
    const computedFollowers = followerCountMap.get(p.id) || 0;
    p.followers_count = p.id === 'extalmita' ? Math.max(142, computedFollowers) : computedFollowers;
    p.following_count = followingCountMap.get(p.id) || 0;
  }

  // Si el remoto trae un post que localmente ya estaba borrado, la tombstone gana.
  return merged;
}

/**
 * Carga el snapshot local del disco si aún no está en memoria.
 * Es imprescindible ANTES de fusionar un snapshot remoto: si la nube está obsoleta y
 * memoryDb es null, las tombstones locales se perderían y los posts borrados resucitarían.
 */
function hydrateFromDisk(): DatabaseSchema | null {
  try {
    if (!fs.existsSync(DB_PATH)) return null;
    const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    if (parsed && Array.isArray(parsed.profiles) && parsed.profiles.some((p: any) => p.id === 'admin')) {
      if (!Array.isArray(parsed.deleted_posts)) parsed.deleted_posts = [];
      return parsed as DatabaseSchema;
    }
  } catch {
    // Archivo corrupto o ilegible: se ignora y se sigue con la nube.
  }
  return null;
}

// Async function to load cloud DB from Supabase Storage
async function syncFromCloud(): Promise<DatabaseSchema | null> {
  // Nunca fusionar contra un estado vacío: el local es la fuente de las tombstones.
  if (!memoryDb) {
    const local = hydrateFromDisk();
    if (local) memoryDb = local;
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${CLOUD_DB_KEY}?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.profiles) && Array.isArray(data.posts)) {
        // Nunca pisar una escritura local reciente con un snapshot potencialmente obsoleto.
        if (Date.now() - lastLocalWriteAt < LOCAL_WRITE_GRACE_MS) {
          lastCloudFetch = Date.now();
          return memoryDb;
        }
        const merged = mergeRemoteSnapshot(memoryDb, data as DatabaseSchema);
        memoryDb = merged;
        lastCloudFetch = Date.now();
        try {
          fs.writeFileSync(DB_PATH, JSON.stringify(merged, null, 2), 'utf-8');
        } catch {}
        return merged;
      }
    }
  } catch (err) {
    console.warn('Sync from Supabase Storage notice:', err);
  }
  return null;
}

// Async function to push updated DB to Supabase Storage
async function pushToCloud(data: DatabaseSchema): Promise<void> {
  // Se ENCOLA en serie: los pushes concurrentes ya no se descartan (antes un borrado se perdía).
  const snapshot = JSON.parse(JSON.stringify(data)) as DatabaseSchema;
  pushChain = pushChain
    .catch(() => {})
    .then(async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${CLOUD_DB_KEY}`, {
          method: 'POST',
          headers: {
            // Supabase Storage exige AMBOS headers: apikey y Authorization (Bearer).
            // Sin Authorization responde 400 "headers must have required property 'authorization'"
            // y el push se perdía en silencio.
            'apikey': SUPABASE_SECRET_KEY,
            'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
            'Content-Type': 'application/json',
            'x-upsert': 'true',
          },
          body: JSON.stringify(snapshot),
        });
        if (!res.ok) {
          console.error('Failed to push DB to Supabase Storage:', res.status, await res.text().catch(() => ''));
        }
      } catch (err) {
        console.error('Failed to push DB to Supabase Storage:', err);
      }
    });
  return pushChain;
}

/**
 * Bootstrap de la nube: se ejecuta UNA vez y debe completarse antes de atender la
 * primera petición, para que una instancia fría (Vercel) nunca arranque con el
 * snapshot semilla e intente subirlo pisando los datos reales.
 */
function ensureCloudReady(): Promise<void> {
  if (!cloudReady) {
    cloudReady = syncFromCloud().then(() => undefined).catch(() => undefined);
  }
  return cloudReady;
}

// Se lanza en cuanto se importa el módulo (no bloquea).
ensureCloudReady();

function readDb(): DatabaseSchema {
  if (memoryDb && memoryDb.profiles && memoryDb.profiles.some((p) => p.id === 'admin')) {
    if (Date.now() - lastCloudFetch > 2500 && Date.now() - lastLocalWriteAt > LOCAL_WRITE_GRACE_MS) {
      syncFromCloud().catch(() => {});
    }
    return memoryDb;
  }
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed.profiles && parsed.profiles.some((p: any) => p.id === 'admin')) {
        if (!Array.isArray(parsed.deleted_posts)) parsed.deleted_posts = [];
        if (!Array.isArray(parsed.follows)) parsed.follows = [];
        for (const baseProfile of INITIAL_DB.profiles) {
          if (!parsed.profiles.some((p: any) => p.id === baseProfile.id)) {
            parsed.profiles.push({ ...baseProfile });
          }
        }
        memoryDb = parsed;
        syncFromCloud().catch(() => {});
        return memoryDb!;
      }
    }
  } catch (err) {
    console.error('Error reading DB file, using fallback:', err);
  }
  // Sin archivo local: arranca con la semilla pero NO la sube a la nube (podría pisar datos reales).
  const seed: DatabaseSchema = JSON.parse(JSON.stringify(INITIAL_DB));
  seed.deleted_posts = [];
  memoryDb = seed;
  seededFromInitial = true;
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), 'utf-8');
  } catch {
    // FS de solo lectura (serverless): el estado vive solo en memoria + nube.
  }
  syncFromCloud().catch(() => {});
  return seed;
}

function writeDb(data: DatabaseSchema): void {
  memoryDb = data;
  lastLocalWriteAt = Date.now();
  lastCloudFetch = Date.now();
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // In serverless environment (e.g. Vercel read-only FS), keep in memoryDb
  }
  // Immediately persist to cloud storage so all devices stay in sync
  pushToCloud(data).catch(() => {});
}

// Check if Supabase Postgres table is available
let supabaseDbAvailable = false;
async function checkSupabaseDb() {
  try {
    const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (!error) {
      supabaseDbAvailable = true;
      console.log('✓ Supabase Postgres tables connected and active!');
    } else {
      supabaseDbAvailable = false;
    }
  } catch {
    supabaseDbAvailable = false;
  }
}
checkSupabaseDb();

export const db = {
  /** Espera a que el bootstrap desde la nube termine (la primera petición no debe
   *  arrancar con el snapshot semilla). */
  ready: (): Promise<void> => ensureCloudReady(),

  isSupabaseAvailable: () => supabaseDbAvailable,

  // PROFILES (Sanitizados contra filtración de información privilegiada)
  getProfiles: async (currentUserId?: string): Promise<UserProfile[]> => {
    let list: UserProfile[] = [];
    if (supabaseDbAvailable) {
      const { data } = await supabaseAdmin.from('profiles').select('*');
      if (data && data.length > 0) list = data;
    }
    const state = readDb();
    if (list.length === 0) {
      list = state.profiles;
    }
    const followedSet = currentUserId
      ? new Set(state.follows.filter((f) => f.follower_id === currentUserId).map((f) => f.following_id))
      : null;
    return list.map((p) => {
      const sanitized = sanitizeProfile(p, false);
      if (followedSet) {
        sanitized.is_following = followedSet.has(p.id);
      }
      return sanitized;
    });
  },

  getProfileById: async (id: string, includePrivate = false, currentUserId?: string): Promise<UserProfile | null> => {
    let profile: UserProfile | null = null;
    if (supabaseDbAvailable) {
      const { data } = await supabaseAdmin.from('profiles').select('*').eq('id', id).single();
      if (data) profile = data;
    }
    const state = readDb();
    if (!profile) {
      profile = state.profiles.find((p) => p.id === id || p.username.toLowerCase() === id.toLowerCase()) || null;
    }
    if (!profile) return null;
    const sanitized = sanitizeProfile(profile, includePrivate);
    if (currentUserId && currentUserId !== profile.id) {
      sanitized.is_following = state.follows.some((f) => f.follower_id === currentUserId && f.following_id === profile.id);
    }
    return sanitized;
  },

  getProfileByUsername: async (username: string, currentUserId?: string): Promise<UserProfile | null> => {
    const cleanUsername = username.replace('@', '').toLowerCase();
    let profile: UserProfile | null = null;
    if (supabaseDbAvailable) {
      const { data } = await supabaseAdmin.from('profiles').select('*').ilike('username', cleanUsername).single();
      if (data) profile = data;
    }
    const state = readDb();
    if (!profile) {
      profile = state.profiles.find((p) => p.username.toLowerCase() === cleanUsername || p.id === cleanUsername) || null;
    }
    if (!profile) return null;
    const sanitized = sanitizeProfile(profile, false);
    if (currentUserId && currentUserId !== profile.id) {
      sanitized.is_following = state.follows.some((f) => f.follower_id === currentUserId && f.following_id === profile.id);
    }
    return sanitized;
  },

  updateProfile: async (id: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
    const state = readDb();
    const index = state.profiles.findIndex((p) => p.id === id);
    if (index === -1) {
      const newProfile: UserProfile = {
        id,
        username: updates.username || 'user_' + Date.now().toString(36),
        display_name: updates.display_name || 'Nuevo Usuario',
        avatar_url: updates.avatar_url || '',
        banner_url: updates.banner_url || '',
        bio: updates.bio || '',
        location: updates.location || '',
        website: updates.website || '',
        is_verified: true,
        followers_count: 0,
        following_count: 0,
        joined_at: new Date().toISOString(),
        ...updates,
      };
      state.profiles.push(newProfile);
      writeDb(state);
      if (supabaseDbAvailable) {
        await supabaseAdmin.from('profiles').insert(newProfile);
      }
      return sanitizeProfile(newProfile, false);
    }

    state.profiles[index] = { ...state.profiles[index], ...updates };
    writeDb(state);
    if (supabaseDbAvailable) {
      await supabaseAdmin.from('profiles').update(updates).eq('id', id);
    }
    return sanitizeProfile(state.profiles[index], false);
  },

  getAllUsers: async (currentUserId?: string): Promise<UserProfile[]> => {
    const state = readDb();
    const followedSet = currentUserId
      ? new Set(state.follows.filter((f) => f.follower_id === currentUserId).map((f) => f.following_id))
      : null;
    return state.profiles
      .filter((p) => !currentUserId || p.id !== currentUserId)
      .map((p) => {
        const sanitized = sanitizeProfile(p, false);
        if (followedSet) {
          sanitized.is_following = followedSet.has(p.id);
        }
        return sanitized;
      });
  },

  /** Uso estrictamente interno para autenticación segura en el servidor */
  getUserForAuth: async (identifier: string): Promise<UserProfile | null> => {
    const state = readDb();
    const clean = identifier.trim().toLowerCase();
    return (
      state.profiles.find(
        (u) =>
          u.username.toLowerCase() === clean ||
          (u.email && u.email.toLowerCase() === clean) ||
          u.id === clean
      ) || null
    );
  },

  registerUser: async (data: {
    username: string;
    display_name: string;
    first_name?: string;
    last_name?: string;
    age?: number | null;
    email: string;
    password: string;
    avatar_url?: string;
    client_ip?: string;
  }): Promise<{ user: UserProfile; error?: string }> => {
    const state = readDb();
    const cleanUsername = data.username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (state.profiles.some((p) => p.username.toLowerCase() === cleanUsername)) {
      return { user: null as any, error: 'El nombre de usuario ya está en uso' };
    }

    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newProfile: UserProfile = {
      id: userId,
      username: cleanUsername,
      display_name: data.display_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || cleanUsername,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      age: data.age ? Number(data.age) : null,
      email: data.email || '',
      password_hash: data.password,
      registration_ip: data.client_ip || '',
      last_ip: data.client_ip || '',
      posts_history: [],
      avatar_url:
        data.avatar_url ||
        `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
      banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      bio: '¡Hola! Me acabo de unir a Talma 🚀',
      location: '',
      website: '',
      is_verified: false,
      followers_count: 0,
      following_count: 0,
      joined_at: new Date().toISOString(),
    };

    state.profiles.push(newProfile);
    writeDb(state);

    if (supabaseDbAvailable) {
      await supabaseAdmin.from('profiles').insert(newProfile);
    }

    return { user: sanitizeProfile(newProfile, true) };
  },

  // POSTS
  getPosts: async (currentUserId?: string): Promise<any[]> => {
    const state = readDb();
    const hiddenSet = new Set(
      (state.hidden_posts || [])
        .filter((h) => h.user_id === currentUserId)
        .map((h) => h.post_id)
    );
    const tombstoneSet = new Set(tombstonesOf(state));
    const visiblePosts = state.posts.filter((p) => !hiddenSet.has(p.id) && !tombstoneSet.has(p.id));
    const followedAuthors = currentUserId
      ? new Set(state.follows.filter((f) => f.follower_id === currentUserId).map((f) => f.following_id))
      : null;

    // Return posts with author profile and user reaction states
    const postsWithDetails = visiblePosts.map((post) => {
      const realAuthor = state.profiles.find((p) => p.id === post.user_id) || {
        id: post.user_id,
        username: 'unknown',
        display_name: 'Usuario Talma',
        avatar_url: '',
        is_verified: false,
      };

      const author = post.is_anonymous
        ? {
            id: post.user_id,
            username: 'anonimo',
            display_name: post.anonymous_name || 'Anónimo',
            avatar_url:
              post.anonymous_avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            banner_url: '',
            bio: 'Publicación realizada en Modo Anónimo 🎭',
            location: 'Secreto',
            website: '',
            is_verified: false,
            followers_count: 0,
            following_count: 0,
            joined_at: post.created_at,
          }
        : realAuthor;

      const is_liked = currentUserId ? state.likes.some((l) => l.user_id === currentUserId && l.post_id === post.id) : false;
      const is_reposted = currentUserId ? state.reposts.some((r) => r.user_id === currentUserId && r.post_id === post.id) : false;
      const is_bookmarked = currentUserId ? state.bookmarks.some((b) => b.user_id === currentUserId && b.post_id === post.id) : false;
      
      let pollWithUserVote = post.poll ? { ...post.poll } : null;
      if (pollWithUserVote && currentUserId && pollWithUserVote.voters) {
        pollWithUserVote.user_voted_option = pollWithUserVote.voters[currentUserId] || null;
      }

      const authorWithFollow = {
        ...author,
        is_following: Boolean(currentUserId && currentUserId !== author.id && followedAuthors?.has(author.id)),
      };

      return {
        ...post,
        author: authorWithFollow,
        poll: pollWithUserVote,
        is_liked,
        is_reposted,
        is_bookmarked,
      };
    });

    return postsWithDetails
      .map((p) => sanitizePost(p))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getPostById: async (id: string, currentUserId?: string): Promise<any | null> => {
    const state = readDb();
    const post = state.posts.find((p) => p.id === id);
    if (!post) return null;

    const realAuthor = state.profiles.find((p) => p.id === post.user_id) || {
      id: post.user_id,
      username: 'unknown',
      display_name: 'Usuario Talma',
      avatar_url: '',
      is_verified: false,
    };

    const author = post.is_anonymous
      ? {
          id: post.user_id,
          username: 'anonimo',
          display_name: post.anonymous_name || 'Anónimo',
          avatar_url:
            post.anonymous_avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          banner_url: '',
          bio: 'Publicación realizada en Modo Anónimo 🎭',
          location: 'Secreto',
          website: '',
          is_verified: false,
          followers_count: 0,
          following_count: 0,
          joined_at: post.created_at,
        }
      : realAuthor;

    const is_liked = currentUserId ? state.likes.some((l) => l.user_id === currentUserId && l.post_id === post.id) : false;
    const is_reposted = currentUserId ? state.reposts.some((r) => r.user_id === currentUserId && r.post_id === post.id) : false;
    const is_bookmarked = currentUserId ? state.bookmarks.some((b) => b.user_id === currentUserId && b.post_id === post.id) : false;

    // Replies to this post
    const replies = state.posts
      .filter((p) => p.reply_to_id === id)
      .map((reply) => {
        const replyAuthor = reply.is_anonymous
          ? {
              id: reply.user_id,
              username: 'anonimo',
              display_name: reply.anonymous_name || 'Anónimo',
              avatar_url:
                reply.anonymous_avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
              is_verified: false,
            }
          : state.profiles.find((p) => p.id === reply.user_id) || author;
        return {
          ...reply,
          author: replyAuthor,
          is_liked: currentUserId ? state.likes.some((l) => l.user_id === currentUserId && l.post_id === reply.id) : false,
        };
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const authorWithFollow = {
      ...author,
      is_following: Boolean(
        currentUserId && currentUserId !== author.id &&
        state.follows.some((f) => f.follower_id === currentUserId && f.following_id === author.id)
      ),
    };

    return sanitizePost({
      ...post,
      author: sanitizeProfile(authorWithFollow, false),
      is_liked,
      is_reposted,
      is_bookmarked,
      replies: replies.map((r) => sanitizePost(r)),
    });
  },

  createPost: async (data: {
    user_id: string;
    content: string;
    media?: MediaItem[];
    poll?: any;
    reply_to_id?: string | null;
    is_anonymous?: boolean;
    anonymous_name?: string;
    anonymous_avatar?: string;
    client_ip?: string;
    is_extalmita?: boolean;
  }): Promise<any> => {
    const state = readDb();
    const newPost: PostItem = {
      id: 'post_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      user_id: data.user_id,
      content: data.content,
      media: data.media || [],
      poll: data.poll
        ? {
            id: 'poll_' + Date.now().toString(36),
            question: data.poll.question || '',
            options: (data.poll.options || []).map((opt: string, i: number) => ({
              id: i + 1,
              text: typeof opt === 'string' ? opt : (opt as any).text,
              votes: 0,
            })),
            ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
            total_votes: 0,
            voters: {},
          }
        : null,
      reply_to_id: data.reply_to_id || null,
      quote_id: null,
      is_anonymous: Boolean(data.is_anonymous),
      anonymous_name: data.anonymous_name || (data.is_anonymous ? 'Anónimo' : undefined),
      anonymous_avatar: data.anonymous_avatar,
      author_ip: data.client_ip || '',
      is_extalmita: Boolean(data.is_extalmita),
      likes_count: 0,
      reposts_count: 0,
      replies_count: 0,
      views_count: 1,
      bookmarks_count: 0,
      created_at: new Date().toISOString(),
    };

    state.posts.unshift(newPost);

    // Track in user profile ("registro de lo que publicaron")
    const authorProfile = state.profiles.find((p) => p.id === data.user_id);
    if (authorProfile) {
      if (!authorProfile.posts_history) authorProfile.posts_history = [];
      authorProfile.posts_history.unshift(newPost.id);
      if (data.client_ip) authorProfile.last_ip = data.client_ip;
    }

    // If it's a reply, increment parent's replies_count
    if (data.reply_to_id) {
      const parent = state.posts.find((p) => p.id === data.reply_to_id);
      if (parent) {
        parent.replies_count = (parent.replies_count || 0) + 1;
      }
    }

    writeDb(state);

    if (supabaseDbAvailable) {
      await supabaseAdmin.from('posts').insert(newPost);
    }

    const author = newPost.is_anonymous
      ? {
          id: newPost.user_id,
          username: 'anonimo',
          display_name: newPost.anonymous_name || 'Anónimo',
          avatar_url:
            newPost.anonymous_avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          banner_url: '',
          bio: 'Publicación realizada en Modo Anónimo 🎭',
          location: 'Secreto',
          website: '',
          is_verified: false,
          followers_count: 0,
          following_count: 0,
          joined_at: newPost.created_at,
        }
      : authorProfile;

    return sanitizePost({
      ...newPost,
      author: sanitizeProfile(author, false),
      is_liked: false,
      is_reposted: false,
      is_bookmarked: false,
    });
  },

  deletePost: async (postId: string, userId: string): Promise<boolean> => {
    const state = readDb();
    const isAdmin = userId === 'admin' || userId === 'user-admin';
    const index = state.posts.findIndex((p) => p.id === postId && (isAdmin || p.user_id === userId));
    if (index === -1) return false;

    // Elimina el post y todos sus descendientes (respuestas anidadas).
    const toDelete = new Set<string>([postId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const post of state.posts) {
        if (post.reply_to_id && toDelete.has(post.reply_to_id) && !toDelete.has(post.id)) {
          toDelete.add(post.id);
          changed = true;
        }
      }
    }

    // Decrementa replies_count del post padre si se está borrando una respuesta.
    const target = state.posts[index];
    if (target && target.reply_to_id) {
      const parent = state.posts.find((p) => p.id === target.reply_to_id);
      if (parent && typeof parent.replies_count === 'number') {
        parent.replies_count = Math.max(0, parent.replies_count - 1);
      }
    }

    state.posts = state.posts.filter((p) => !toDelete.has(p.id));
    if (state.hidden_posts) {
      state.hidden_posts = state.hidden_posts.filter((h) => !toDelete.has(h.post_id));
    }
    state.likes = state.likes.filter((l) => !toDelete.has(l.post_id));
    state.reposts = state.reposts.filter((r) => !toDelete.has(r.post_id));
    state.bookmarks = state.bookmarks.filter((b) => !toDelete.has(b.post_id));

    // TOMBSTONES: los ids borrados se recuerdan para que ningún snapshot remoto obsoleto
    // (o el archivo data/talma_db.json commiteado en el deploy) pueda resucitarlos.
    const tombstones = new Set<string>(tombstonesOf(state));
    for (const id of toDelete) tombstones.add(id);
    state.deleted_posts = Array.from(tombstones).slice(-TOMBSTONE_LIMIT);

    writeDb(state);

    // Persistencia en la nube: espera explícita para que el borrado no se pierda si la
    // función serverless se congela justo después de responder.
    try {
      await pushToCloud(state);
    } catch {}

    if (supabaseDbAvailable) {
      const ids = Array.from(toDelete);
      try {
        if (isAdmin) {
          await supabaseAdmin.from('posts').delete().in('id', ids);
        } else {
          await supabaseAdmin.from('posts').delete().in('id', ids).eq('user_id', userId);
        }
      } catch (err) {
        console.error('Supabase delete notice:', err);
      }
    }
    return true;
  },

  hidePost: async (postId: string, userId: string): Promise<boolean> => {
    const state = readDb();
    if (!state.hidden_posts) state.hidden_posts = [];
    if (!state.hidden_posts.some((h) => h.user_id === userId && h.post_id === postId)) {
      state.hidden_posts.push({ user_id: userId, post_id: postId, hidden_at: new Date().toISOString() });
      writeDb(state);
    }
    return true;
  },

  toggleLike: async (postId: string, userId: string): Promise<{ liked: boolean; count: number }> => {
    const state = readDb();
    const post = state.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    const existingIndex = state.likes.findIndex((l) => l.user_id === userId && l.post_id === postId);
    let liked = false;
    if (existingIndex !== -1) {
      state.likes.splice(existingIndex, 1);
      post.likes_count = Math.max(0, (post.likes_count || 0) - 1);
      liked = false;
    } else {
      state.likes.push({ user_id: userId, post_id: postId, created_at: new Date().toISOString() });
      post.likes_count = (post.likes_count || 0) + 1;
      liked = true;
    }

    writeDb(state);
    return { liked, count: post.likes_count };
  },

  toggleRepost: async (postId: string, userId: string): Promise<{ reposted: boolean; count: number }> => {
    const state = readDb();
    const post = state.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    const existingIndex = state.reposts.findIndex((r) => r.user_id === userId && r.post_id === postId);
    let reposted = false;
    if (existingIndex !== -1) {
      state.reposts.splice(existingIndex, 1);
      post.reposts_count = Math.max(0, (post.reposts_count || 0) - 1);
      reposted = false;
    } else {
      state.reposts.push({ user_id: userId, post_id: postId, created_at: new Date().toISOString() });
      post.reposts_count = (post.reposts_count || 0) + 1;
      reposted = true;
    }

    writeDb(state);
    return { reposted, count: post.reposts_count };
  },

  toggleBookmark: async (postId: string, userId: string): Promise<{ bookmarked: boolean }> => {
    const state = readDb();
    const post = state.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    const existingIndex = state.bookmarks.findIndex((b) => b.user_id === userId && b.post_id === postId);
    let bookmarked = false;
    if (existingIndex !== -1) {
      state.bookmarks.splice(existingIndex, 1);
      post.bookmarks_count = Math.max(0, (post.bookmarks_count || 0) - 1);
      bookmarked = false;
    } else {
      state.bookmarks.push({ user_id: userId, post_id: postId, created_at: new Date().toISOString() });
      post.bookmarks_count = (post.bookmarks_count || 0) + 1;
      bookmarked = true;
    }

    writeDb(state);
    return { bookmarked };
  },

  votePoll: async (postId: string, optionId: number, userId: string): Promise<PollData> => {
    const state = readDb();
    const post = state.posts.find((p) => p.id === postId);
    if (!post || !post.poll) throw new Error('Poll not found');

    if (!post.poll.voters) post.poll.voters = {};
    if (post.poll.voters[userId]) {
      throw new Error('Ya has votado en esta encuesta');
    }

    const opt = post.poll.options.find((o) => o.id === optionId);
    if (!opt) throw new Error('Opción no válida');

    opt.votes += 1;
    post.poll.total_votes += 1;
    post.poll.voters[userId] = optionId;

    writeDb(state);
    return {
      ...post.poll,
      user_voted_option: optionId,
    };
  },

  // MESSAGES
  getConversations: async (userId: string) => {
    const state = readDb();
    const userMessages = state.messages.filter(
      (m) => m.sender_id === userId || m.receiver_id === userId
    );

    // Group by other user
    const conversationMap = new Map<string, MessageItem>();
    userMessages.forEach((msg) => {
      const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      const existing = conversationMap.get(otherId);
      if (!existing || new Date(msg.created_at) > new Date(existing.created_at)) {
        conversationMap.set(otherId, msg);
      }
    });

    const conversations = [];
    for (const [otherId, lastMsg] of conversationMap.entries()) {
      const participant = state.profiles.find((p) => p.id === otherId) || {
        id: otherId,
        username: 'usuario',
        display_name: 'Usuario Talma',
        avatar_url: '',
        is_verified: false,
      };
      conversations.push({
        id: otherId,
        participant: sanitizeProfile(participant, false),
        last_message: lastMsg,
        unread_count: 0,
      });
    }

    return conversations.sort(
      (a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime()
    );
  },

  getMessagesBetween: async (userId: string, otherUserId: string) => {
    const state = readDb();
    const messages = state.messages.filter(
      (m) =>
        (m.sender_id === userId && m.receiver_id === otherUserId) ||
        (m.sender_id === otherUserId && m.receiver_id === userId)
    );
    return messages.map((m) => ({
      ...m,
      is_mine: m.sender_id === userId,
    })).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  sendMessage: async (data: {
    sender_id: string;
    receiver_id: string;
    content: string;
    media_url?: string;
    media_type?: string;
  }) => {
    const state = readDb();
    const newMsg: MessageItem = {
      id: 'msg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      content: data.content,
      media_url: data.media_url,
      media_type: data.media_type,
      created_at: new Date().toISOString(),
    };

    state.messages.push(newMsg);
    writeDb(state);
    return { ...newMsg, is_mine: true };
  },

  // FOLLOWS
  toggleFollow: async (followerId: string, followingId: string): Promise<{ following: boolean }> => {
    const state = readDb();
    const follower = state.profiles.find(
      (p) => p.id === followerId || p.username.toLowerCase() === followerId.toLowerCase()
    );
    const following = state.profiles.find(
      (p) => p.id === followingId || p.username.toLowerCase() === followingId.toLowerCase()
    );

    const actualFollowerId = follower ? follower.id : followerId;
    const actualFollowingId = following ? following.id : followingId;

    if (actualFollowerId === actualFollowingId) {
      return { following: false };
    }

    const existingIndex = state.follows.findIndex(
      (f) => f.follower_id === actualFollowerId && f.following_id === actualFollowingId
    );

    let isFollowing = false;
    if (existingIndex !== -1) {
      state.follows.splice(existingIndex, 1);
      isFollowing = false;
    } else {
      state.follows.push({
        follower_id: actualFollowerId,
        following_id: actualFollowingId,
        created_at: new Date().toISOString(),
      });
      isFollowing = true;
    }

    if (follower) {
      follower.following_count = state.follows.filter((f) => f.follower_id === actualFollowerId).length;
    }
    if (following) {
      const computedFollowers = state.follows.filter((f) => f.following_id === actualFollowingId).length;
      following.followers_count = following.id === 'extalmita' ? Math.max(142, computedFollowers) : computedFollowers;
    }

    writeDb(state);
    return { following: isFollowing };
  },

  getFollowers: async (userId: string, currentUserId?: string): Promise<UserProfile[]> => {
    const state = readDb();
    const user = state.profiles.find((p) => p.id === userId || p.username.toLowerCase() === userId.toLowerCase());
    const targetId = user ? user.id : userId;
    const followerIds = state.follows.filter((f) => f.following_id === targetId).map((f) => f.follower_id);
    const followedSet = currentUserId
      ? new Set(state.follows.filter((f) => f.follower_id === currentUserId).map((f) => f.following_id))
      : null;

    return followerIds
      .map((id) => state.profiles.find((p) => p.id === id))
      .filter((p): p is UserProfile => Boolean(p))
      .map((p) => {
        const sanitized = sanitizeProfile(p, false);
        if (followedSet) sanitized.is_following = followedSet.has(p.id);
        return sanitized;
      });
  },

  getFollowing: async (userId: string, currentUserId?: string): Promise<UserProfile[]> => {
    const state = readDb();
    const user = state.profiles.find((p) => p.id === userId || p.username.toLowerCase() === userId.toLowerCase());
    const targetId = user ? user.id : userId;
    const followingIds = state.follows.filter((f) => f.follower_id === targetId).map((f) => f.following_id);
    const followedSet = currentUserId
      ? new Set(state.follows.filter((f) => f.follower_id === currentUserId).map((f) => f.following_id))
      : null;

    return followingIds
      .map((id) => state.profiles.find((p) => p.id === id))
      .filter((p): p is UserProfile => Boolean(p))
      .map((p) => {
        const sanitized = sanitizeProfile(p, false);
        if (followedSet) sanitized.is_following = followedSet.has(p.id);
        return sanitized;
      });
  },

  getFollowingIds: async (userId: string): Promise<string[]> => {
    const state = readDb();
    const user = state.profiles.find((p) => p.id === userId || p.username.toLowerCase() === userId.toLowerCase());
    const targetId = user ? user.id : userId;
    return state.follows.filter((f) => f.follower_id === targetId).map((f) => f.following_id);
  },

  isFollowing: async (followerId: string, followingId: string): Promise<boolean> => {
    const state = readDb();
    const follower = state.profiles.find((p) => p.id === followerId || p.username.toLowerCase() === followerId.toLowerCase());
    const following = state.profiles.find((p) => p.id === followingId || p.username.toLowerCase() === followingId.toLowerCase());
    const fId = follower ? follower.id : followerId;
    const fgId = following ? following.id : followingId;
    return state.follows.some((f) => f.follower_id === fId && f.following_id === fgId);
  },
};
