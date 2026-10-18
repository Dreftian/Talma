import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { Header } from './components/Header';
import { TweetComposer } from './components/TweetComposer';
import { TweetCard } from './components/TweetCard';
import { TweetDetailModal } from './components/TweetDetailModal';
import { ProfileView } from './components/ProfileView';
import { MessagesView } from './components/MessagesView';
import { ExploreView } from './components/ExploreView';
import { NotificationsView } from './components/NotificationsView';
import { AuthModal } from './components/AuthModal';
import { Post, UserProfile } from './types';
import { fetchPosts, fetchMe, deletePost } from './lib/api';
import {
  X,
  Sparkles,
  AlertCircle,
  Home,
  Search,
  Bell,
  Mail,
  User,
  Feather,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>({
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
  });

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [homeFeedTab, setHomeFeedTab] = useState<'for_you' | 'following'>('for_you');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedProfileUsername, setSelectedProfileUsername] = useState<string | null>(null);
  const [chatWithUser, setChatWithUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showComposerModal, setShowComposerModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Initial load
  useEffect(() => {
    fetchMe(currentUser.id)
      .then((user) => setCurrentUser(user))
      .catch(() => {});
  }, []);

  const loadFeed = async () => {
    try {
      setLoadingPosts(true);
      const data = await fetchPosts(currentUser.id, homeFeedTab);
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [homeFeedTab, currentUser.id]);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    setShowComposerModal(false);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId, currentUser.id);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (selectedPostId === postId) {
        setSelectedPostId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    setSelectedPostId(null);
    setSelectedProfileUsername(null);
    if (tab === 'home') {
      loadFeed();
    }
  };

  const handleSelectProfile = (username: string) => {
    setSelectedProfileUsername(username);
    setSelectedPostId(null);
    setCurrentTab('profile');
  };

  const handleOpenChat = (user: UserProfile) => {
    setChatWithUser(user);
    setCurrentTab('messages');
    setSelectedPostId(null);
    setSelectedProfileUsername(null);
  };

  // Filter posts if search query is present
  const displayPosts = searchFilter
    ? posts.filter(
        (p) =>
          p.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
          p.author.username.toLowerCase().includes(searchFilter.toLowerCase()) ||
          p.author.display_name.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : posts;

  return (
    <div className="min-h-screen bg-black text-[#e7e9ea] flex justify-center">
      <div className="flex w-full max-w-[1280px]">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          currentUser={currentUser}
          onOpenComposer={() => setShowComposerModal(true)}
          onOpenAuth={() => setShowAuthModal(true)}
          onSelectProfile={handleSelectProfile}
        />

        {/* Center Main Content Area */}
        <main
          className={`flex-1 min-h-screen border-r border-[#2f3336] border-r-0 sm:border-r ${
            currentTab === 'messages' ? 'max-w-[990px]' : 'max-w-[600px]'
          } w-full pb-16 sm:pb-0`}
        >
          {/* Post Detail View */}
          {selectedPostId ? (
            <TweetDetailModal
              postId={selectedPostId}
              currentUser={currentUser}
              onBack={() => setSelectedPostId(null)}
              onSelectProfile={handleSelectProfile}
            />
          ) : currentTab === 'profile' ? (
            <ProfileView
              username={selectedProfileUsername || currentUser.username}
              currentUser={currentUser}
              onBack={() => handleSelectTab('home')}
              onPostClick={(p) => setSelectedPostId(p.id)}
              onSelectProfile={handleSelectProfile}
              onProfileUpdated={(updated) => setCurrentUser(updated)}
            />
          ) : currentTab === 'messages' ? (
            <MessagesView currentUser={currentUser} initialChatUser={chatWithUser} />
          ) : currentTab === 'explore' ? (
            <ExploreView
              onSearch={(q) => {
                setSearchFilter(q);
                handleSelectTab('home');
              }}
            />
          ) : currentTab === 'notifications' ? (
            <NotificationsView
              currentUser={currentUser}
              onSelectProfile={handleSelectProfile}
            />
          ) : currentTab === 'bookmarks' ? (
            <div className="flex flex-col min-h-screen">
              <Header
                activeTab={homeFeedTab}
                onTabChange={setHomeFeedTab}
                title="Guardados"
                onBack={() => handleSelectTab('home')}
                currentUser={currentUser}
                onSelectProfile={handleSelectProfile}
              />
              <div className="flex flex-col">
                {posts.filter((p) => p.is_bookmarked).length === 0 ? (
                  <div className="p-12 text-center text-[#71767b]">
                    Aún no has guardado ningún post. Haz clic en el ícono de guardar en cualquier post para leerlo más tarde.
                  </div>
                ) : (
                  posts
                    .filter((p) => p.is_bookmarked)
                    .map((post) => (
                      <TweetCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        onPostClick={(p) => setSelectedPostId(p.id)}
                        onSelectProfile={handleSelectProfile}
                        onDelete={handleDeletePost}
                      />
                    ))
                )}
              </div>
            </div>
          ) : (
            /* Home Feed View */
            <div className="flex flex-col min-h-screen">
              <Header
                activeTab={homeFeedTab}
                onTabChange={setHomeFeedTab}
                currentUser={currentUser}
                onSelectProfile={handleSelectProfile}
              />

              {/* Active Search Filter Banner */}
              {searchFilter && (
                <div className="px-4 py-2.5 bg-[#16181c] border-b border-[#2f3336] flex items-center justify-between">
                  <span className="text-sm text-[#71767b]">
                    Resultados para:{' '}
                    <span className="font-bold text-[#22c55e]">"{searchFilter}"</span>
                  </span>
                  <button
                    onClick={() => setSearchFilter('')}
                    className="text-xs text-[#71767b] hover:text-white"
                  >
                    Limpiar
                  </button>
                </div>
              )}

              {/* Tweet Composer */}
              <TweetComposer
                currentUser={currentUser}
                onPostCreated={handlePostCreated}
              />

              {/* Feed Stream */}
              <div className="flex flex-col pb-20">
                {loadingPosts ? (
                  <div className="p-12 text-center text-[#71767b] flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Cargando posts de Talma...</span>
                  </div>
                ) : displayPosts.length === 0 ? (
                  <div className="p-12 text-center text-[#71767b]">
                    No hay publicaciones disponibles en esta sección.
                  </div>
                ) : (
                  displayPosts.map((post) => (
                    <TweetCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      onPostClick={(p) => setSelectedPostId(p.id)}
                      onSelectProfile={handleSelectProfile}
                      onDelete={handleDeletePost}
                      onReply={(p) => setSelectedPostId(p.id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar (Search, Premium, Trends, Recommendations) */}
        {currentTab !== 'messages' && (
          <RightSidebar
            currentUserId={currentUser.id}
            onSelectProfile={handleSelectProfile}
            onSearch={(q) => {
              setSearchFilter(q);
              handleSelectTab('home');
            }}
          />
        )}
      </div>

      {/* Mobile Floating Action Button (FAB) for Compose */}
      {currentTab !== 'messages' && (
        <button
          onClick={() => setShowComposerModal(true)}
          className="fixed bottom-18 right-4 sm:hidden bg-[#00ba7c] hover:bg-[#00a36d] text-white p-3.5 rounded-full shadow-2xl z-30 active:scale-90 transition-transform duration-150 flex items-center justify-center cursor-pointer border border-[#22c55e]/40"
          title="Nuevo post"
        >
          <Feather className="w-6 h-6 stroke-[2.2]" />
        </button>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-t border-[#2f3336] flex sm:hidden justify-around items-center h-14 px-2">
        <button
          onClick={() => handleSelectTab('home')}
          className={`p-2.5 rounded-full relative transition-colors ${
            currentTab === 'home' ? 'text-white' : 'text-[#71767b]'
          }`}
          title="Inicio"
        >
          <Home className={`w-6 h-6 ${currentTab === 'home' ? 'stroke-[2.5]' : ''}`} />
        </button>

        <button
          onClick={() => handleSelectTab('explore')}
          className={`p-2.5 rounded-full transition-colors ${
            currentTab === 'explore' ? 'text-white' : 'text-[#71767b]'
          }`}
          title="Explorar"
        >
          <Search className={`w-6 h-6 ${currentTab === 'explore' ? 'stroke-[2.5]' : ''}`} />
        </button>

        <button
          onClick={() => handleSelectTab('notifications')}
          className={`p-2.5 rounded-full relative transition-colors ${
            currentTab === 'notifications' ? 'text-white' : 'text-[#71767b]'
          }`}
          title="Notificaciones"
        >
          <Bell className={`w-6 h-6 ${currentTab === 'notifications' ? 'stroke-[2.5]' : ''}`} />
          <span className="absolute top-2 right-2 bg-[#22c55e] text-black text-[10px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black">
            3
          </span>
        </button>

        <button
          onClick={() => handleSelectTab('messages')}
          className={`p-2.5 rounded-full relative transition-colors ${
            currentTab === 'messages' ? 'text-white' : 'text-[#71767b]'
          }`}
          title="Mensajes"
        >
          <Mail className={`w-6 h-6 ${currentTab === 'messages' ? 'stroke-[2.5]' : ''}`} />
          <span className="absolute top-2 right-2 bg-[#22c55e] text-black text-[10px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black">
            1
          </span>
        </button>

        <button
          onClick={() => handleSelectProfile(currentUser.username)}
          className={`p-2.5 rounded-full transition-colors ${
            currentTab === 'profile' ? 'text-white' : 'text-[#71767b]'
          }`}
          title="Perfil"
        >
          <img
            src={currentUser.avatar_url}
            alt={currentUser.display_name}
            className={`w-6 h-6 rounded-full object-cover border ${
              currentTab === 'profile'
                ? 'border-[#22c55e] ring-1 ring-[#22c55e]'
                : 'border-[#2f3336]'
            }`}
          />
        </button>
      </nav>

      {/* Floating Composer Modal (Triggered by Sidebar "Postear" button or Mobile FAB) */}
      {showComposerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-0 sm:p-4 sm:pt-16">
          <div className="bg-black border-0 sm:border border-[#2f3336] rounded-none sm:rounded-2xl w-full sm:max-w-lg min-h-screen sm:min-h-0 p-4 shadow-2xl animate-pop-in flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#2f3336]">
              <button
                onClick={() => setShowComposerModal(false)}
                className="p-1.5 text-white hover:bg-[#181818] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-[#22c55e]">TALMA · POST</span>
            </div>
            <div className="pt-3 flex-1">
              <TweetComposer
                currentUser={currentUser}
                onPostCreated={handlePostCreated}
              />
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
            loadFeed();
          }}
        />
      )}
    </div>
  );
}
