import fs from 'fs';
import path from 'path';
import { supabaseAdmin, STORAGE_BUCKET, SUPABASE_URL } from './supabase.ts';

const DB_PATH = path.resolve(process.cwd(), 'data', 'talma_db.json');

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  banner_url: string;
  bio: string;
  location: string;
  website: string;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
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
}

export interface PostItem {
  id: string;
  user_id: string;
  content: string;
  media: MediaItem[];
  poll?: PollData | null;
  reply_to_id?: string | null;
  quote_id?: string | null;
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

interface DatabaseSchema {
  profiles: UserProfile[];
  posts: PostItem[];
  likes: { user_id: string; post_id: string; created_at: string }[];
  reposts: { user_id: string; post_id: string; created_at: string }[];
  bookmarks: { user_id: string; post_id: string; created_at: string }[];
  follows: { follower_id: string; following_id: string; created_at: string }[];
  messages: MessageItem[];
}

const INITIAL_DB: DatabaseSchema = {
  profiles: [
    {
      id: 'usr_dreftian',
      username: 'dreftian',
      display_name: 'Dreftian',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      bio: 'Arquitecto y Desarrollador Full-Stack 🚀 Construyendo Talma sobre Supabase.',
      location: 'Lima, Perú',
      website: 'https://talma.app',
      is_verified: true,
      followers_count: 1420,
      following_count: 380,
      joined_at: '2026-01-15T00:00:00Z',
    },
    {
      id: 'usr_talma',
      username: 'talma_oficial',
      display_name: 'Talma',
      avatar_url: `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/logo-talma.png`,
      banner_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      bio: 'La red social en tiempo real. Rápida, libre y respaldada por Supabase Storage & Database.',
      location: 'Global',
      website: 'https://talma.app',
      is_verified: true,
      followers_count: 85200,
      following_count: 42,
      joined_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'usr_supabase',
      username: 'supabase',
      display_name: 'Supabase',
      avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      bio: 'The open source Firebase alternative. Postgres, Auth, Realtime, Storage, Functions.',
      location: 'San Francisco, CA',
      website: 'https://supabase.com',
      is_verified: true,
      followers_count: 245000,
      following_count: 120,
      joined_at: '2020-03-01T00:00:00Z',
    },
    {
      id: 'usr_elonmusk',
      username: 'elonmusk',
      display_name: 'Elon Musk',
      avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      bio: 'Occupy Mars. The future will be exciting!',
      location: 'Starbase, TX',
      website: 'https://x.com',
      is_verified: true,
      followers_count: 180000000,
      following_count: 650,
      joined_at: '2009-06-02T00:00:00Z',
    },
  ],
  posts: [
    {
      id: 'post_1',
      user_id: 'usr_talma',
      content: '¡Bienvenidos a Talma! 🚀 La plataforma social conectada 100% con Supabase para almacenamiento de fotos, videos, audios y mensajes en tiempo real. Diseñada al estilo más puro y elegante de X.',
      media: [
        {
          id: 'med_logo',
          url: `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/logo-talma.png`,
          type: 'image',
          name: 'Talma Logo',
        },
      ],
      poll: null,
      reply_to_id: null,
      quote_id: null,
      likes_count: 342,
      reposts_count: 89,
      replies_count: 24,
      views_count: 4890,
      bookmarks_count: 45,
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
    {
      id: 'post_2',
      user_id: 'usr_dreftian',
      content: 'Acabamos de implementar la subida multimedia completa en @supabase. ¡Prueba a subir una foto, un video o un archivo de audio directamente en el compositor!',
      media: [],
      poll: {
        id: 'poll_1',
        question: '¿Qué opinas de la fluidez y diseño de Talma?',
        options: [
          { id: 1, text: '¡Increíble y súper rápida! 🔥', votes: 420 },
          { id: 2, text: 'Idéntica a X pero más limpia ⚡', votes: 310 },
          { id: 3, text: 'El soporte de Supabase es top 🐘', votes: 215 },
        ],
        ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
        total_votes: 945,
        voters: {},
      },
      reply_to_id: null,
      quote_id: null,
      likes_count: 189,
      reposts_count: 45,
      replies_count: 12,
      views_count: 3200,
      bookmarks_count: 18,
      created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: 'post_3',
      user_id: 'usr_supabase',
      content: 'Welcome to the Supabase ecosystem @talma_oficial! Great to see PostgreSQL and Storage powering next-generation social experiences with instant real-time capability.',
      media: [
        {
          id: 'med_supa',
          url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
          type: 'image',
          name: 'Code',
        },
      ],
      poll: null,
      reply_to_id: null,
      quote_id: null,
      likes_count: 852,
      reposts_count: 194,
      replies_count: 38,
      views_count: 12400,
      bookmarks_count: 92,
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ],
  likes: [
    { user_id: 'usr_dreftian', post_id: 'post_1', created_at: new Date().toISOString() },
  ],
  reposts: [],
  bookmarks: [
    { user_id: 'usr_dreftian', post_id: 'post_1', created_at: new Date().toISOString() },
  ],
  follows: [
    { follower_id: 'usr_dreftian', following_id: 'usr_talma', created_at: new Date().toISOString() },
    { follower_id: 'usr_dreftian', following_id: 'usr_supabase', created_at: new Date().toISOString() },
  ],
  messages: [
    {
      id: 'msg_1',
      sender_id: 'usr_talma',
      receiver_id: 'usr_dreftian',
      content: '¡Hola Dreftian! Bienvenido a Talma. Tu espacio está listo y conectado con Supabase.',
      created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
      id: 'msg_2',
      sender_id: 'usr_dreftian',
      receiver_id: 'usr_talma',
      content: '¡Gracias! El bucket de almacenamiento y los posts están funcionando perfecto.',
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
  ],
};

let memoryDb: DatabaseSchema | null = null;

function readDb(): DatabaseSchema {
  if (memoryDb) return memoryDb;
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      memoryDb = JSON.parse(data);
      return memoryDb!;
    }
  } catch (err) {
    console.error('Error reading DB file, using fallback:', err);
  }
  memoryDb = JSON.parse(JSON.stringify(INITIAL_DB));
  writeDb(memoryDb!);
  return memoryDb!;
}

function writeDb(data: DatabaseSchema): void {
  memoryDb = data;
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // In serverless environment (e.g. Vercel read-only FS), keep in memoryDb
  }
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
  isSupabaseAvailable: () => supabaseDbAvailable,

  // PROFILES
  getProfiles: async (): Promise<UserProfile[]> => {
    if (supabaseDbAvailable) {
      const { data } = await supabaseAdmin.from('profiles').select('*');
      if (data && data.length > 0) return data;
    }
    const state = readDb();
    return state.profiles;
  },

  getProfileById: async (id: string): Promise<UserProfile | null> => {
    if (supabaseDbAvailable) {
      const { data } = await supabaseAdmin.from('profiles').select('*').eq('id', id).single();
      if (data) return data;
    }
    const state = readDb();
    return state.profiles.find((p) => p.id === id) || null;
  },

  getProfileByUsername: async (username: string): Promise<UserProfile | null> => {
    const cleanUsername = username.replace('@', '').toLowerCase();
    if (supabaseDbAvailable) {
      const { data } = await supabaseAdmin.from('profiles').select('*').ilike('username', cleanUsername).single();
      if (data) return data;
    }
    const state = readDb();
    return state.profiles.find((p) => p.username.toLowerCase() === cleanUsername) || null;
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
      return newProfile;
    }

    state.profiles[index] = { ...state.profiles[index], ...updates };
    writeDb(state);
    if (supabaseDbAvailable) {
      await supabaseAdmin.from('profiles').update(updates).eq('id', id);
    }
    return state.profiles[index];
  },

  // POSTS
  getPosts: async (currentUserId?: string): Promise<any[]> => {
    const state = readDb();
    // Return posts with author profile and user reaction states
    const postsWithDetails = state.posts.map((post) => {
      const author = state.profiles.find((p) => p.id === post.user_id) || {
        id: post.user_id,
        username: 'unknown',
        display_name: 'Usuario Talma',
        avatar_url: '',
        is_verified: false,
      };
      const is_liked = currentUserId ? state.likes.some((l) => l.user_id === currentUserId && l.post_id === post.id) : false;
      const is_reposted = currentUserId ? state.reposts.some((r) => r.user_id === currentUserId && r.post_id === post.id) : false;
      const is_bookmarked = currentUserId ? state.bookmarks.some((b) => b.user_id === currentUserId && b.post_id === post.id) : false;
      
      let pollWithUserVote = post.poll ? { ...post.poll } : null;
      if (pollWithUserVote && currentUserId && pollWithUserVote.voters) {
        pollWithUserVote.user_voted_option = pollWithUserVote.voters[currentUserId] || null;
      }

      return {
        ...post,
        author,
        poll: pollWithUserVote,
        is_liked,
        is_reposted,
        is_bookmarked,
      };
    });

    return postsWithDetails.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getPostById: async (id: string, currentUserId?: string): Promise<any | null> => {
    const state = readDb();
    const post = state.posts.find((p) => p.id === id);
    if (!post) return null;

    const author = state.profiles.find((p) => p.id === post.user_id) || {
      id: post.user_id,
      username: 'unknown',
      display_name: 'Usuario Talma',
      avatar_url: '',
      is_verified: false,
    };

    const is_liked = currentUserId ? state.likes.some((l) => l.user_id === currentUserId && l.post_id === post.id) : false;
    const is_reposted = currentUserId ? state.reposts.some((r) => r.user_id === currentUserId && r.post_id === post.id) : false;
    const is_bookmarked = currentUserId ? state.bookmarks.some((b) => b.user_id === currentUserId && b.post_id === post.id) : false;

    // Replies to this post
    const replies = state.posts
      .filter((p) => p.reply_to_id === id)
      .map((reply) => {
        const replyAuthor = state.profiles.find((p) => p.id === reply.user_id) || author;
        return {
          ...reply,
          author: replyAuthor,
          is_liked: currentUserId ? state.likes.some((l) => l.user_id === currentUserId && l.post_id === reply.id) : false,
        };
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return {
      ...post,
      author,
      is_liked,
      is_reposted,
      is_bookmarked,
      replies,
    };
  },

  createPost: async (data: {
    user_id: string;
    content: string;
    media?: MediaItem[];
    poll?: any;
    reply_to_id?: string | null;
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
      likes_count: 0,
      reposts_count: 0,
      replies_count: 0,
      views_count: 1,
      bookmarks_count: 0,
      created_at: new Date().toISOString(),
    };

    state.posts.unshift(newPost);

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

    const author = state.profiles.find((p) => p.id === newPost.user_id);
    return {
      ...newPost,
      author,
      is_liked: false,
      is_reposted: false,
      is_bookmarked: false,
    };
  },

  deletePost: async (postId: string, userId: string): Promise<boolean> => {
    const state = readDb();
    const index = state.posts.findIndex((p) => p.id === postId && p.user_id === userId);
    if (index === -1) return false;
    state.posts.splice(index, 1);
    writeDb(state);
    if (supabaseDbAvailable) {
      await supabaseAdmin.from('posts').delete().eq('id', postId).eq('user_id', userId);
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
        participant,
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
    const existingIndex = state.follows.findIndex(
      (f) => f.follower_id === followerId && f.following_id === followingId
    );

    const follower = state.profiles.find((p) => p.id === followerId);
    const following = state.profiles.find((p) => p.id === followingId);

    let isFollowing = false;
    if (existingIndex !== -1) {
      state.follows.splice(existingIndex, 1);
      if (follower) follower.following_count = Math.max(0, follower.following_count - 1);
      if (following) following.followers_count = Math.max(0, following.followers_count - 1);
      isFollowing = false;
    } else {
      state.follows.push({
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date().toISOString(),
      });
      if (follower) follower.following_count += 1;
      if (following) following.followers_count += 1;
      isFollowing = true;
    }

    writeDb(state);
    return { following: isFollowing };
  },
};
