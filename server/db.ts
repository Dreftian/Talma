import fs from 'fs';
import path from 'path';
import { supabaseAdmin, STORAGE_BUCKET, SUPABASE_URL } from './supabase.ts';

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
      id: 'admin',
      username: 'admin',
      display_name: 'Admin',
      avatar_url: `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/logo-talma.png`,
      banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      bio: 'Cuenta Oficial de Administración de Talma 🚀 Plataforma social en tiempo real sobre Supabase. 100% gratuita y sin suscripciones VIP.',
      location: 'Global',
      website: 'https://talma.app',
      is_verified: true,
      followers_count: 0,
      following_count: 0,
      joined_at: '2026-01-01T00:00:00Z',
    },
  ],
  posts: [
    {
      id: 'post_1',
      user_id: 'admin',
      content: '¡Bienvenidos a Talma! 🚀 La plataforma social abierta, 100% gratuita y sin suscripciones VIP. Toda la potencia de Supabase para fotos, videos, audios y mensajes en tiempo real. Diseñada al estilo más puro de X.',
      media: [
        {
          id: 'med_logo',
          url: `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/logo-talma.png`,
          type: 'image',
          name: 'Talma Logo',
        },
      ],
      poll: {
        id: 'poll_1',
        question: '¿Qué opinas del diseño 100% fiel a X y la velocidad de Talma?',
        options: [
          { id: 1, text: '¡Increíble y súper rápida! 🔥', votes: 42 },
          { id: 2, text: 'Idéntica a X pero más limpia ⚡', votes: 31 },
          { id: 3, text: 'El soporte de Supabase es top 🐘', votes: 25 },
        ],
        ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        total_votes: 98,
        voters: {},
      },
      reply_to_id: null,
      quote_id: null,
      likes_count: 48,
      reposts_count: 14,
      replies_count: 6,
      views_count: 890,
      bookmarks_count: 12,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ],
  likes: [],
  reposts: [],
  bookmarks: [],
  follows: [],
  messages: [],
};

let memoryDb: DatabaseSchema | null = null;

function readDb(): DatabaseSchema {
  if (memoryDb && memoryDb.profiles && memoryDb.profiles.some((p) => p.id === 'admin')) {
    return memoryDb;
  }
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed.profiles && parsed.profiles.some((p: any) => p.id === 'admin')) {
        memoryDb = parsed;
        return memoryDb!;
      }
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

  getAllUsers: async (currentUserId?: string): Promise<UserProfile[]> => {
    const state = readDb();
    return state.profiles.filter((p) => !currentUserId || p.id !== currentUserId);
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

    return { user: newProfile };
  },

  // POSTS
  getPosts: async (currentUserId?: string): Promise<any[]> => {
    const state = readDb();
    // Return posts with author profile and user reaction states
    const postsWithDetails = state.posts.map((post) => {
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
    is_anonymous?: boolean;
    anonymous_name?: string;
    anonymous_avatar?: string;
    client_ip?: string;
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
