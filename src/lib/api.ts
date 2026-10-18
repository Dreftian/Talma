import { Post, UserProfile, MediaAttachment, Conversation, DirectMessage, PollData } from '../types';

const API_BASE = ''; // proxied via Vite to http://localhost:3001

export async function fetchPosts(userId?: string, tab: string = 'for_you', username?: string): Promise<Post[]> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (tab) params.append('tab', tab);
  if (username) params.append('username', username);

  const res = await fetch(`${API_BASE}/api/posts?${params.toString()}`);
  if (!res.ok) throw new Error('Error al cargar posts');
  return res.json();
}

export async function fetchPostById(id: string, userId?: string): Promise<Post> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);

  const res = await fetch(`${API_BASE}/api/posts/${id}?${params.toString()}`);
  if (!res.ok) throw new Error('Post no encontrado');
  return res.json();
}

export async function createPost(data: {
  user_id: string;
  content: string;
  media?: MediaAttachment[];
  poll?: any;
  reply_to_id?: string | null;
}): Promise<Post> {
  const res = await fetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al publicar');
  }
  return res.json();
}

export async function deletePost(id: string, userId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/posts/${id}?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
  return res.ok;
}

export async function toggleLike(postId: string, userId: string): Promise<{ liked: boolean; count: number }> {
  const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Error al dar like');
  return res.json();
}

export async function toggleRepost(postId: string, userId: string): Promise<{ reposted: boolean; count: number }> {
  const res = await fetch(`${API_BASE}/api/posts/${postId}/repost`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Error al hacer repost');
  return res.json();
}

export async function toggleBookmark(postId: string, userId: string): Promise<{ bookmarked: boolean }> {
  const res = await fetch(`${API_BASE}/api/posts/${postId}/bookmark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Error al guardar');
  return res.json();
}

export async function votePoll(postId: string, optionId: number, userId: string): Promise<PollData> {
  const res = await fetch(`${API_BASE}/api/posts/${postId}/poll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionId, userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al votar');
  }
  return res.json();
}

export async function uploadMedia(file: File): Promise<MediaAttachment> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error subiendo archivo a Supabase Storage');
  }

  return res.json();
}

export async function fetchMe(userId: string = 'usr_dreftian'): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/users/me?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Error al cargar perfil');
  return res.json();
}

export async function fetchUserProfile(username: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error('Usuario no encontrado');
  return res.json();
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Error al actualizar perfil');
  return res.json();
}

export async function toggleFollow(followerId: string, followingId: string): Promise<{ following: boolean }> {
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(followingId)}/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ followerId }),
  });
  if (!res.ok) throw new Error('Error al seguir usuario');
  return res.json();
}

export async function fetchRecommendations(userId: string): Promise<UserProfile[]> {
  const res = await fetch(`${API_BASE}/api/users/recommendations?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/api/messages/conversations?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchMessages(userId: string, otherUserId: string): Promise<DirectMessage[]> {
  const res = await fetch(`${API_BASE}/api/messages/${encodeURIComponent(otherUserId)}?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function sendMessage(data: {
  sender_id: string;
  receiver_id: string;
  content: string;
  media_url?: string;
  media_type?: string;
}): Promise<DirectMessage> {
  const res = await fetch(`${API_BASE}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al enviar mensaje');
  return res.json();
}
