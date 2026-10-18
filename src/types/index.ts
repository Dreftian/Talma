export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  email?: string;
  registration_ip?: string;
  avatar_url: string;
  banner_url: string;
  bio: string;
  location: string;
  website: string;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  joined_at: string;
  is_following?: boolean;
}

export interface MediaAttachment {
  id?: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'gif';
  name?: string;
  size?: number;
  duration?: number;
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface PollData {
  id: string;
  question?: string;
  options: PollOption[];
  ends_at: string;
  total_votes: number;
  user_voted_option?: number | null;
}

export interface Post {
  id: string;
  user_id: string;
  author: UserProfile;
  content: string;
  media: MediaAttachment[];
  poll?: PollData | null;
  reply_to_id?: string | null;
  reply_to_user?: string | null;
  quote_id?: string | null;
  quoted_post?: Post | null;
  is_anonymous?: boolean;
  anonymous_name?: string;
  anonymous_avatar?: string;
  author_ip?: string;
  likes_count: number;
  reposts_count: number;
  replies_count: number;
  views_count: number;
  bookmarks_count: number;
  is_liked?: boolean;
  is_reposted?: boolean;
  is_bookmarked?: boolean;
  created_at: string;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  created_at: string;
  is_mine?: boolean;
}

export interface Conversation {
  id: string;
  participant: UserProfile;
  last_message: DirectMessage;
  unread_count: number;
}

export interface NotificationItem {
  id: string;
  actor: UserProfile;
  type: 'like' | 'repost' | 'reply' | 'follow' | 'mention';
  post?: Post;
  read: boolean;
  created_at: string;
}

export interface TrendItem {
  category: string;
  topic: string;
  posts_count: string;
}
