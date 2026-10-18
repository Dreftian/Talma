import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db.ts';
import { supabaseAdmin, STORAGE_BUCKET, SUPABASE_URL } from './supabase.ts';

const app = new Hono();

// Enable CORS for frontend requests
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));

// Sub-router containing all Talma API logic
const api = new Hono();

// Health check
api.get('/health', (c) => {
  return c.json({
    status: 'ok',
    app: 'Talma',
    supabaseUrl: SUPABASE_URL,
    storageBucket: STORAGE_BUCKET,
    isSupabaseDbAvailable: db.isSupabaseAvailable(),
    time: new Date().toISOString(),
  });
});

// MEDIA UPLOAD TO SUPABASE STORAGE
api.post('/upload', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No se envió ningún archivo válido' }, 400);
    }

    const mimeType = file.type || 'application/octet-stream';
    const originalName = file.name || 'file';
    const ext = originalName.split('.').pop() || 'bin';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine type
    let mediaType: 'image' | 'video' | 'audio' | 'gif' = 'image';
    if (mimeType.startsWith('video/')) mediaType = 'video';
    else if (mimeType.startsWith('audio/')) mediaType = 'audio';
    else if (mimeType.includes('gif')) mediaType = 'gif';
    else mediaType = 'image';

    // Upload directly to Supabase Storage bucket
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return c.json({ error: error.message }, 500);
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;

    return c.json({
      url: publicUrl,
      type: mediaType,
      name: originalName,
      size: file.size,
      key: data?.path,
    });
  } catch (err: any) {
    console.error('Error in /api/upload:', err);
    return c.json({ error: err.message || 'Error procesando la subida' }, 500);
  }
});

// POSTS ROUTES
api.get('/posts', async (c) => {
  const currentUserId = c.req.query('userId') || 'admin';
  const username = c.req.query('username');
  const tab = c.req.query('tab') || 'for_you';

  let posts = await db.getPosts(currentUserId);

  if (username) {
    const profile = await db.getProfileByUsername(username);
    if (profile) {
      posts = posts.filter((p) => p.user_id === profile.id);
    }
  }

  return c.json(posts);
});

api.get('/posts/:id', async (c) => {
  const id = c.req.param('id');
  const currentUserId = c.req.query('userId') || 'admin';
  const post = await db.getPostById(id, currentUserId);
  if (!post) {
    return c.json({ error: 'Post no encontrado' }, 404);
  }
  return c.json(post);
});

api.post('/posts', async (c) => {
  const body = await c.req.json();
  const userId = body.user_id || 'admin';
  const content = body.content || '';
  const media = body.media || [];
  const poll = body.poll || null;
  const reply_to_id = body.reply_to_id || null;

  if (!content.trim() && (!media || media.length === 0) && !poll) {
    return c.json({ error: 'El post no puede estar vacío' }, 400);
  }

  const newPost = await db.createPost({
    user_id: userId,
    content,
    media,
    poll,
    reply_to_id,
  });

  return c.json(newPost);
});

api.delete('/posts/:id', async (c) => {
  const id = c.req.param('id');
  const userId = c.req.query('userId') || 'admin';
  const success = await db.deletePost(id, userId);
  if (!success) {
    return c.json({ error: 'No se pudo eliminar el post o no tienes permiso' }, 403);
  }
  return c.json({ success: true });
});

api.post('/posts/:id/like', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const userId = body.userId || c.req.query('userId') || 'admin';
  try {
    const result = await db.toggleLike(id, userId);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

api.post('/posts/:id/repost', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const userId = body.userId || c.req.query('userId') || 'admin';
  try {
    const result = await db.toggleRepost(id, userId);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

api.post('/posts/:id/bookmark', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const userId = body.userId || c.req.query('userId') || 'admin';
  try {
    const result = await db.toggleBookmark(id, userId);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

api.post('/posts/:id/poll', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const userId = body.userId || 'admin';
  const optionId = body.optionId;
  try {
    const result = await db.votePoll(id, optionId, userId);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// USERS & PROFILES
api.get('/users/me', async (c) => {
  const userId = c.req.query('userId') || 'admin';
  let profile = await db.getProfileById(userId);
  if (!profile) {
    profile = await db.getProfileById('admin');
  }
  if (!profile) {
    return c.json({ error: 'Perfil no encontrado' }, 404);
  }
  return c.json(profile);
});

api.get('/users/recommendations', async (c) => {
  const currentUserId = c.req.query('userId') || 'admin';
  const allProfiles = await db.getProfiles();
  const recommendations = allProfiles
    .filter((p) => p.id !== currentUserId)
    .slice(0, 5);
  return c.json(recommendations);
});

api.get('/users/:username', async (c) => {
  const username = c.req.param('username');
  const profile = await db.getProfileByUsername(username);
  if (!profile) {
    return c.json({ error: 'Usuario no encontrado' }, 404);
  }
  return c.json(profile);
});

api.put('/users/:id', async (c) => {
  const id = c.req.param('id');
  const updates = await c.req.json();
  const updated = await db.updateProfile(id, updates);
  return c.json(updated);
});

api.post('/users/:id/follow', async (c) => {
  const followingId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const followerId = body.followerId || 'admin';
  const result = await db.toggleFollow(followerId, followingId);
  return c.json(result);
});

// DIRECT MESSAGES (CHAT)
api.get('/messages/conversations', async (c) => {
  const userId = c.req.query('userId') || 'admin';
  const conversations = await db.getConversations(userId);
  return c.json(conversations);
});

api.get('/messages/:otherUserId', async (c) => {
  const userId = c.req.query('userId') || 'admin';
  const otherUserId = c.req.param('otherUserId');
  const messages = await db.getMessagesBetween(userId, otherUserId);
  return c.json(messages);
});

api.post('/messages', async (c) => {
  const body = await c.req.json();
  const senderId = body.sender_id || 'admin';
  const receiverId = body.receiver_id;
  const content = body.content || '';
  const mediaUrl = body.media_url;
  const mediaType = body.media_type;

  if (!receiverId || (!content.trim() && !mediaUrl)) {
    return c.json({ error: 'Mensaje inválido' }, 400);
  }

  const message = await db.sendMessage({
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    media_url: mediaUrl,
    media_type: mediaType,
  });

  return c.json(message);
});

// AUTH
api.post('/auth/signin', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const identifier = (body.email || body.id || body.username || '').trim().toLowerCase();
  const password = (body.password || '').trim();

  // Admin login check: id: admin, password: admin
  if ((identifier === 'admin' || identifier === 'admin@talma.app') && password === 'admin') {
    let adminProfile = await db.getProfileById('admin');
    if (!adminProfile) {
      adminProfile = await db.updateProfile('admin', {
        username: 'admin',
        display_name: 'Admin',
        avatar_url: `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/logo-talma.png`,
        banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        bio: 'Cuenta Oficial de Administración de Talma 🚀 Plataforma social en tiempo real sobre Supabase. 100% gratuita y sin suscripciones VIP.',
        location: 'Global',
        website: 'https://talma.app',
        is_verified: true,
      });
    }
    return c.json({
      user: adminProfile,
      token: 'admin_token_' + Date.now(),
    });
  }

  // If wrong password for admin
  if (identifier === 'admin' || identifier === 'admin@talma.app') {
    return c.json({ error: 'Contraseña incorrecta para la cuenta admin' }, 401);
  }

  // Attempt Supabase auth
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });
    if (!error && data.user) {
      let profile = await db.getProfileById(data.user.id);
      if (!profile) {
        profile = await db.updateProfile(data.user.id, {
          username: (body.email || 'user').split('@')[0],
          display_name: (body.email || 'Usuario').split('@')[0],
        });
      }
      return c.json({ user: profile, session: data.session });
    }
  } catch (err) {
    console.error('Supabase auth signin error:', err);
  }

  return c.json({ error: 'Credenciales inválidas. Usa id: admin y contraseña: admin' }, 401);
});

api.post('/auth/signup', async (c) => {
  const { email, password, name, username } = await c.req.json();
  try {
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          username,
        },
      },
    });
    if (!error && data.user) {
      const newProfile = await db.updateProfile(data.user.id, {
        username: username || email.split('@')[0],
        display_name: name || username || 'Usuario Talma',
      });
      return c.json({ user: newProfile, session: data.session });
    }
  } catch (err) {
    console.error('Supabase auth signup error, creating profile locally:', err);
  }

  const id = 'usr_' + Date.now().toString(36);
  const newProfile = await db.updateProfile(id, {
    username: username || email.split('@')[0],
    display_name: name || 'Usuario Talma',
    bio: '¡Hola! Me acabo de unir a Talma.',
  });

  return c.json({ user: newProfile, token: 'talma_token_' + Date.now() });
});

// Mount router on both /api and / to handle all routing environments seamlessly
app.route('/api', api);
app.route('/', api);

export default app;
export { app };
