import { Post, UserProfile, MediaAttachment, Conversation, DirectMessage, PollData } from '../types';

const API_BASE = ''; // proxied via Vite to http://localhost:3001

export async function fetchPosts(userId?: string, tab: string = 'for_you', username?: string): Promise<Post[]> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (tab) params.append('tab', tab);
  if (username) params.append('username', username);

  // cache: 'no-store' evita que el navegador sirva un feed antiguo (con posts ya borrados) al recargar.
  const res = await fetch(`${API_BASE}/api/posts?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar posts');
  return res.json();
}

export async function fetchPostById(id: string, userId?: string): Promise<Post> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);

  const res = await fetch(`${API_BASE}/api/posts/${id}?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Post no encontrado');
  return res.json();
}

export async function createPost(data: {
  user_id: string;
  content: string;
  media?: MediaAttachment[];
  poll?: any;
  reply_to_id?: string | null;
  is_anonymous?: boolean;
  anonymous_name?: string;
  anonymous_avatar?: string;
  is_extalmita?: boolean;
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

/**
 * Elimina un post en el servidor.
 * Devuelve true SOLO si el backend confirmó el borrado; el llamador NO debe
 * quitar el post de la UI cuando devuelve false (antes se hacía y el post
 * reaparecía al recargar).
 */
export async function deletePost(id: string, userId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${id}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function hidePost(id: string, userId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/posts/${id}/hide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
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
  // Strategy 1: Request signed upload URL for direct, unrestricted Supabase Storage upload
  try {
    const signRes = await fetch(`${API_BASE}/api/upload/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
      }),
    });

    if (signRes.ok) {
      const signData = await signRes.json();
      if (signData.signedUrl && signData.publicUrl) {
        // Upload binary directly to Supabase Storage
        const uploadRes = await fetch(signData.signedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: file,
        });

        if (uploadRes.ok) {
          return {
            url: signData.publicUrl,
            type: signData.type || 'image',
            name: file.name,
            size: file.size,
          };
        }
      }
    }
  } catch (signErr) {
    console.warn('Signed upload failed, trying standard upload proxy...', signErr);
  }

  // Strategy 2: Standard multipart form upload proxy
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      return await res.json();
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error subiendo archivo a Supabase Storage');
  } catch (err: any) {
    // Strategy 3: For images under 3MB, fallback to base64 Data URL if network/storage is temporarily unavailable
    if (file.type.startsWith('image/') && file.size < 3 * 1024 * 1024) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            url: reader.result as string,
            type: file.type.includes('gif') ? 'gif' : 'image',
            name: file.name,
            size: file.size,
          });
        };
        reader.readAsDataURL(file);
      });
    }
    throw err;
  }
}

export async function fetchMe(userId: string = 'admin'): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/users/me?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Error al cargar perfil');
  return res.json();
}

export async function fetchUserProfile(username: string, currentUserId?: string): Promise<UserProfile> {
  const params = currentUserId ? `?userId=${encodeURIComponent(currentUserId)}` : '';
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(username)}${params}`);
  if (!res.ok) throw new Error('Usuario no encontrado');
  return res.json();
}

export async function fetchFollowers(userId: string, currentUserId?: string): Promise<UserProfile[]> {
  const params = currentUserId ? `?userId=${encodeURIComponent(currentUserId)}` : '';
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/followers${params}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchFollowing(userId: string, currentUserId?: string): Promise<UserProfile[]> {
  const params = currentUserId ? `?userId=${encodeURIComponent(currentUserId)}` : '';
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/following${params}`);
  if (!res.ok) return [];
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

export async function fetchRegisteredUsers(userId?: string): Promise<UserProfile[]> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  const res = await fetch(`${API_BASE}/api/users?${params.toString()}`);
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

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/api/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, currentPassword, newPassword }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Error al cambiar la contraseña');
  }
  return data;
}

export async function exportUserData(userId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/export`, { cache: 'no-store' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error al exportar datos');
  }
  return res.json();
}

export async function deactivateAccount(userId: string, password: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/deactivate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Error al desactivar la cuenta');
  }
  return data;
}

export async function socialLogin(params: {
  provider: 'google' | 'apple';
  email: string;
  name?: string;
  avatar_url?: string;
}): Promise<{ user: UserProfile; token?: string }> {
  const res = await fetch(`${API_BASE}/api/auth/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Error al iniciar sesión social');
  }
  return data;
}

export async function phoneLogin(params: {
  phone: string;
  code?: string;
  name?: string;
}): Promise<{ user: UserProfile; token?: string }> {
  const res = await fetch(`${API_BASE}/api/auth/phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Error al iniciar sesión con teléfono');
  }
  return data;
}
