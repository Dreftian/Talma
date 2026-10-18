import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db.js';
import { supabaseAdmin, STORAGE_BUCKET, SUPABASE_URL } from './supabase.js';
import fs from 'fs';
import path from 'path';

const app = new Hono();

// Enable CORS for frontend requests
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));

// Health check
app.get('/api/health', (c) => {
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
app.post('/api/upload', async (c) => {
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
app.get('/api/posts', async (c) => {
  const currentUserId = c.req.query('userId') || 'usr_dreftian';
  const username = c.req.query('username');
  const tab = c.req.query('tab') || 'for_you'; // 'for_you' | 'following'

  let posts = await db.getPosts(currentUserId);

  if (username) {
    const profile = await db.getProfileByUsername(username);
    if (profile) {
      posts = posts.filter((p) => p.user_id === profile.id);
    }
  }

  return c.json(posts);
});

app.get('/api/posts/:id', async (c) => {
  const id = c.req.param('id');
  const currentUserId = c.req.query('userId') || 'usr_dreftian';
  const post = await db.getPostById(id, currentUserId);
  if (!post) {
    return c.json({ error: 'Post no encontrado' }, 404);
  }
  return c.json(post);
});

app.post('/api/posts', async (c) => {
  const body = await c.req.json();
  const userId = body.user_id || 'usr_dreftian';
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

app.delete('/api/posts/:id', async (c) => {
  const id = c.req.param('id');
  const userId = c.req.query('userId') || 'usr_dreftian';
  const success = await db.deletePost(id, userId);
  if (!success) {
    return c.json({ error: 'No se pudo eliminar el post o no tienes permiso' }, 403);
  }
  return c.json({ success: true });
});

app.post('/api/posts/:id/like', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const userId = body.userId || c.req.query('userId') || 'usr_dreftian';
  try {
    const result = await db.toggleLike(id, userId);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

app.post('/api/posts/:id/repost', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const userId = body.userId || c.req.query('userId') || 'usr_dreftian';
  try {
    const result = await db.toggleRepost(id, userId);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

app.post('/api/posts/:id/bookmark', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const userId = body.userId || c.req.query('userId') || 'usr_dreftian';
  try {
    const result = await db.toggleBookmark(id, userId);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

app.post('/api/posts/:id/poll', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const userId = body.userId || 'usr_dreftian';
  const optionId = body.optionId;
  try {
    const result = await db.votePoll(id, optionId, userId);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// USERS & PROFILES
app.get('/api/users/me', async (c) => {
  const userId = c.req.query('userId') || 'usr_dreftian';
  const profile = await db.getProfileById(userId);
  if (!profile) {
    return c.json({ error: 'Perfil no encontrado' }, 404);
  }
  return c.json(profile);
});

app.get('/api/users/recommendations', async (c) => {
  const currentUserId = c.req.query('userId') || 'usr_dreftian';
  const allProfiles = await db.getProfiles();
  const recommendations = allProfiles
    .filter((p) => p.id !== currentUserId)
    .slice(0, 5);
  return c.json(recommendations);
});

app.get('/api/users/:username', async (c) => {
  const username = c.req.param('username');
  const profile = await db.getProfileByUsername(username);
  if (!profile) {
    return c.json({ error: 'Usuario no encontrado' }, 404);
  }
  return c.json(profile);
});

app.put('/api/users/:id', async (c) => {
  const id = c.req.param('id');
  const updates = await c.req.json();
  const updated = await db.updateProfile(id, updates);
  return c.json(updated);
});

app.post('/api/users/:id/follow', async (c) => {
  const followingId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const followerId = body.followerId || 'usr_dreftian';
  const result = await db.toggleFollow(followerId, followingId);
  return c.json(result);
});

// DIRECT MESSAGES (CHAT)
app.get('/api/messages/conversations', async (c) => {
  const userId = c.req.query('userId') || 'usr_dreftian';
  const conversations = await db.getConversations(userId);
  return c.json(conversations);
});

app.get('/api/messages/:otherUserId', async (c) => {
  const userId = c.req.query('userId') || 'usr_dreftian';
  const otherUserId = c.req.param('otherUserId');
  const messages = await db.getMessagesBetween(userId, otherUserId);
  return c.json(messages);
});

app.post('/api/messages', async (c) => {
  const body = await c.req.json();
  const senderId = body.sender_id || 'usr_dreftian';
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
app.post('/api/auth/signin', async (c) => {
  const { email, password } = await c.req.json();
  // Check in Supabase auth
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data.user) {
      let profile = await db.getProfileById(data.user.id);
      if (!profile) {
        profile = await db.updateProfile(data.user.id, {
          username: email.split('@')[0],
          display_name: email.split('@')[0],
        });
      }
      return c.json({ user: profile, session: data.session });
    }
  } catch (err) {
    console.error('Supabase auth signin error, checking local profiles:', err);
  }

  // Fallback demo account login
  const username = email.split('@')[0].toLowerCase();
  const profiles = await db.getProfiles();
  const match = profiles.find(
    (p) => p.username.toLowerCase() === username || p.id === 'usr_dreftian'
  );

  return c.json({
    user: match || profiles[0],
    token: 'talma_token_' + Date.now(),
  });
});

app.post('/api/auth/signup', async (c) => {
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

  // Fallback profile creation
  const id = 'usr_' + Date.now().toString(36);
  const newProfile = await db.updateProfile(id, {
    username: username || email.split('@')[0],
    display_name: name || 'Usuario Talma',
    bio: '¡Hola! Me acabo de unir a Talma.',
  });

  return c.json({ user: newProfile, token: 'talma_token_' + Date.now() });
});

// SERVE STATIC CLIENT BUILD (SPA)
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use('/*', serveStatic({ root: './dist' }));
  app.get('*', (c) => {
    const htmlPath = path.join(distPath, 'index.html');
    if (fs.existsSync(htmlPath)) {
      return c.html(fs.readFileSync(htmlPath, 'utf-8'));
    }
    return c.text('Not found', 404);
  });
}

// START HTTP SERVER
const port = Number(process.env.PORT) || 3001;
console.log(`🚀 Talma Server running on http://localhost:${port}`);
serve({
  fetch: app.fetch,
  port,
});
