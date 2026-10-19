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
import { RegisterModal } from './components/RegisterModal';
import { MobileDrawer } from './components/MobileDrawer';
import { SettingsView } from './components/SettingsView';
import { LandingView } from './components/LandingView';
import { ArticlesModal } from './components/ArticlesModal';
import { CommunitiesModal } from './components/CommunitiesModal';
import { FollowRequestsModal } from './components/FollowRequestsModal';
import { Post, UserProfile } from './types';
import { fetchPosts, fetchMe, deletePost, hidePost, fetchConversations } from './lib/api';
import {
  X,
  Home,
  Search,
  Bell,
  MessageCircle,
  Plus,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('talma_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (!parsed.avatar_url || parsed.avatar_url.includes('logo-talma.png'))) {
          parsed.avatar_url = '/avatar-plane.png';
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [homeFeedTab, setHomeFeedTab] = useState<'for_you' | 'following' | 'extalmita'>('for_you');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedProfileUsername, setSelectedProfileUsername] = useState<string | null>(null);
  const [chatWithUser, setChatWithUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showComposerModal, setShowComposerModal] = useState(false);
  const [showArticlesModal, setShowArticlesModal] = useState(false);
  const [showCommunitiesModal, setShowCommunitiesModal] = useState(false);
  const [showFollowRequestsModal, setShowFollowRequestsModal] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [showAiSheet, setShowAiSheet] = useState(false);

  // Contadores dinámicos del bottom nav (solo se pintan cuando son > 0).
  // - Mensajes: suma de conversaciones no leídas que ya expone la API.
  // - Notificaciones: todavía no hay contador en la API, queda en 0.
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const notificationsCount = 0;

  // Initial load
  useEffect(() => {
    if (currentUser?.id) {
      fetchMe(currentUser.id)
        .then((user) => {
          setCurrentUser(user);
          try {
            localStorage.setItem('talma_current_user', JSON.stringify(user));
          } catch {}
        })
        .catch(() => {});
    }
  }, [currentUser?.id]);

  const loadFeed = async () => {
    if (!currentUser) return;
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
    if (currentUser) {
      loadFeed();
    }
  }, [homeFeedTab, currentUser?.id]);

  // Mantiene el badge de mensajes del bottom nav sincronizado con las conversaciones.
  useEffect(() => {
    if (!currentUser?.id) {
      setUnreadMessagesCount(0);
      return;
    }
    let cancelled = false;
    fetchConversations(currentUser.id)
      .then((convs) => {
        if (cancelled) return;
        setUnreadMessagesCount(
          convs.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, currentTab]);

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('talma_current_user');
    } catch {}
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    setShowComposerModal(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;
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

  const handleHidePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      await hidePost(postId, currentUser.id);
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

  if (!currentUser) {
    return (
      <LandingView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          try {
            localStorage.setItem('talma_current_user', JSON.stringify(user));
          } catch {}
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#e7e9ea] flex justify-center">
      <div className="flex w-full max-w-[1280px]">
        {/* Left Sidebar - Exact X Web Desktop Experience */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          currentUser={currentUser}
          onOpenComposer={() => setShowComposerModal(true)}
          onOpenAuth={() => setShowAuthModal(true)}
          onLogout={handleLogout}
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
              onDelete={handleDeletePost}
              onHide={handleHidePost}
            />
          ) : currentTab === 'profile' ? (
            <ProfileView
              username={selectedProfileUsername || currentUser.username}
              currentUser={currentUser}
              onBack={() => handleSelectTab('home')}
              onPostClick={(p) => setSelectedPostId(p.id)}
              onSelectProfile={handleSelectProfile}
              onProfileUpdated={(updated) => setCurrentUser(updated)}
              onDelete={handleDeletePost}
              onHide={handleHidePost}
              onOpenChat={handleOpenChat}
              onOpenArticles={() => setShowArticlesModal(true)}
              onOpenAi={() => setShowAiSheet(true)}
            />
          ) : currentTab === 'messages' ? (
            <MessagesView
              currentUser={currentUser}
              initialChatUser={chatWithUser}
              onOpenDrawer={() => setIsMobileDrawerOpen(true)}
            />
          ) : currentTab === 'explore' ? (
            <ExploreView
              onSearch={(q) => {
                setSearchFilter(q);
                handleSelectTab('home');
              }}
              currentUser={currentUser}
              onOpenDrawer={() => setIsMobileDrawerOpen(true)}
            />
          ) : currentTab === 'notifications' ? (
            <NotificationsView
              currentUser={currentUser}
              onSelectProfile={handleSelectProfile}
              onOpenDrawer={() => setIsMobileDrawerOpen(true)}
            />
          ) : currentTab === 'settings' ? (
            <SettingsView
              currentUser={currentUser}
              onBack={() => handleSelectTab('home')}
              onLogout={handleLogout}
              onProfileUpdated={(updated) => setCurrentUser(updated)}
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
                onOpenDrawer={() => setIsMobileDrawerOpen(true)}
              />
              <div className="flex flex-col">
                {posts.filter((p) => p.is_bookmarked).length === 0 ? (
                  <div className="flex flex-col items-start justify-center p-8 max-w-sm mx-auto text-left mt-8">
                    <h2 className="text-[31px] font-extrabold text-[#e7e9ea] leading-tight mb-2">
                      Guarda publicaciones para verlas más tarde
                    </h2>
                    <p className="text-[15px] text-[#71767b] leading-normal">
                      ¡No dejes que se te escapen las buenas! Guarda publicaciones para volver a encontrarlas fácilmente en el futuro.
                    </p>
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
                        onHide={handleHidePost}
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
                onOpenDrawer={() => setIsMobileDrawerOpen(true)}
              />

              {/* Active Search Filter Banner */}
              {searchFilter && (
                <div className="px-4 py-2.5 bg-[#16181c] border-b border-[#2f3336] flex items-center justify-between">
                  <span className="text-sm text-[#71767b]">
                    Resultados para:{' '}
                    <span className="font-bold text-[#1d9bf0]">"{searchFilter}"</span>
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
                    <div className="w-6 h-6 border-2 border-[#1d9bf0] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Cargando publicaciones...</span>
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
                      onHide={handleHidePost}
                      onReply={(p) => setSelectedPostId(p.id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar (Search, Free Info, Trends, Recommendations) - Desktop only */}
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

      {/* Mobile Floating Action Button (FAB) for Compose - Exact X Mobile App Style.
          Se oculta al abrir el detalle de un post para no tapar el composer fijo. */}
      {currentTab !== 'messages' && currentTab !== 'settings' && !selectedPostId && (
        <button
          onClick={() => setShowComposerModal(true)}
          className="fixed bottom-20 right-4 sm:hidden w-14 h-14 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white rounded-full shadow-2xl z-30 active:scale-90 transition-transform duration-150 flex items-center justify-center cursor-pointer border border-[#1d9bf0]/50 shadow-[#1d9bf0]/40"
          title="Nuevo post"
        >
          <Plus className="w-7 h-7 stroke-[2.4]" />
        </button>
      )}

      {/* Mobile Bottom Navigation Bar - Exact X Mobile App UI (hidden in full-screen settings) */}
      {currentTab !== 'settings' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-t border-[#2f3336] flex sm:hidden justify-around items-center min-h-[52px] pb-[env(safe-area-inset-bottom)] px-2 select-none">
          <button
            onClick={() => handleSelectTab('home')}
            className={`flex-1 flex justify-center py-2 relative transition-colors ${
              currentTab === 'home' ? 'text-white' : 'text-[#71767b]'
            }`}
            title="Inicio"
          >
            <Home className={`w-6 h-6 ${currentTab === 'home' ? 'stroke-[2.5] text-white fill-white' : ''}`} />
          </button>

          <button
            onClick={() => handleSelectTab('explore')}
            className={`flex-1 flex justify-center py-2 transition-colors ${
              currentTab === 'explore' ? 'text-white' : 'text-[#71767b]'
            }`}
            title="Explorar"
          >
            <Search className={`w-6 h-6 ${currentTab === 'explore' ? 'stroke-[2.5] text-white' : ''}`} />
          </button>

          {/* Centro: Talma AI (equivalente al icono Grok/destello de las refs) */}
          <button
            onClick={() => setShowAiSheet(true)}
            className={`flex-1 flex justify-center py-2 transition-colors ${
              showAiSheet ? 'text-white' : 'text-[#71767b]'
            }`}
            title="Talma AI"
          >
            <Sparkles
              className={`w-6 h-6 ${showAiSheet ? 'stroke-[2.5] text-white' : ''}`}
            />
          </button>

          <button
            onClick={() => handleSelectTab('notifications')}
            className={`flex-1 flex justify-center py-2 relative transition-colors ${
              currentTab === 'notifications' ? 'text-white' : 'text-[#71767b]'
            }`}
            title="Notificaciones"
          >
            <div className="relative">
              <Bell className={`w-6 h-6 ${currentTab === 'notifications' ? 'stroke-[2.5] text-white fill-white' : ''}`} />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#1d9bf0] text-white text-[10px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black">
                  {notificationsCount > 9 ? '9+' : notificationsCount}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => handleSelectTab('messages')}
            className={`flex-1 flex justify-center py-2 relative transition-colors ${
              currentTab === 'messages' ? 'text-white' : 'text-[#71767b]'
            }`}
            title="Mensajes"
          >
            <div className="relative">
              <MessageCircle className={`w-6 h-6 ${currentTab === 'messages' ? 'stroke-[2.5] text-white fill-white' : ''}`} />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#1d9bf0] text-white text-[10px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black">
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </span>
              )}
            </div>
          </button>
        </nav>
      )}

      {/* Talma AI sheet (mobile bottom nav center icon, mirrors the Grok entry in the refs) */}
      {showAiSheet && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setShowAiSheet(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black border-t border-[#2f3336] rounded-t-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] animate-pop-in">
            <div className="w-9 h-1 rounded-full bg-[#2f3336] mx-auto mb-4" />
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#1d9bf0]" />
              <h2 className="text-[17px] font-extrabold text-white">Talma AI</h2>
            </div>
            <p className="text-[13px] text-[#71767b] leading-normal mb-4">
              Resúmenes, ideas y contexto sobre lo que está pasando en Talma.
            </p>
            <div className="flex flex-col gap-2">
              {[
                'Resume las tendencias de hoy',
                'Explícame este post',
                'Sugiéreme ideas para postear',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setShowAiSheet(false)}
                  className="w-full text-left px-4 py-3 rounded-2xl bg-[#16181c] hover:bg-[#1d1f23] text-[15px] text-[#e7e9ea] transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Slide-Out Drawer Navigation (Triggered by mobile header avatar) */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentUser={currentUser}
        onSelectTab={handleSelectTab}
        onSelectProfile={handleSelectProfile}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onOpenArticles={() => setShowArticlesModal(true)}
        onOpenCommunities={() => setShowCommunitiesModal(true)}
        onOpenFollowRequests={() => setShowFollowRequestsModal(true)}
        onOpenAi={() => setShowAiSheet(true)}
      />

      {/* Articles Modal (matches 13.jpeg) */}
      {showArticlesModal && (
        <ArticlesModal
          isOpen={showArticlesModal}
          onClose={() => setShowArticlesModal(false)}
          currentUser={currentUser}
          onPublishArticle={(art) => {
            handlePostCreated({
              id: 'art_post_' + Date.now(),
              user_id: currentUser.id,
              author: currentUser,
              content: `📰 Nuevo artículo publicado:\n\n**${art.title}**\n\n${art.content.slice(0, 180)}...`,
              media: [],
              created_at: new Date().toISOString(),
              likes_count: 0,
              reposts_count: 0,
              replies_count: 0,
              bookmarks_count: 0,
              views_count: 1,
              is_liked: false,
              is_reposted: false,
              is_bookmarked: false,
            });
            setShowArticlesModal(false);
          }}
        />
      )}

      {/* Communities Modal (matches WhatsApp Image 2026-10-18 at 5.58.26 21312PM.jpeg) */}
      {showCommunitiesModal && (
        <CommunitiesModal
          isOpen={showCommunitiesModal}
          onClose={() => setShowCommunitiesModal(false)}
          currentUser={currentUser}
        />
      )}

      {/* Follow Requests Modal (matches 4.jpeg & 5.jpeg) */}
      {showFollowRequestsModal && (
        <FollowRequestsModal
          isOpen={showFollowRequestsModal}
          onClose={() => setShowFollowRequestsModal(false)}
          currentUser={currentUser}
        />
      )}

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
              <span className="text-xs font-bold text-[#1d9bf0]">TALMA</span>
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
          onSwitchToRegister={() => {
            setShowAuthModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            setShowRegisterModal(false);
            loadFeed();
          }}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowAuthModal(true);
          }}
        />
      )}
    </div>
  );
}
