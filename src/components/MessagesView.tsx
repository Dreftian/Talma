import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  Image as ImageIcon,
  Paperclip,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  X,
  MessageSquare,
  Phone,
  Video,
  Info,
  Smile,
  ChevronDown,
} from 'lucide-react';
import { UserProfile, Conversation, DirectMessage } from '../types';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  uploadMedia,
  fetchRegisteredUsers,
} from '../lib/api';
import { formatRelativeTime } from '../lib/utils';
import { getSafeAvatarUrl } from '../lib/avatar';

interface MessagesViewProps {
  currentUser: UserProfile;
  initialChatUser?: UserProfile | null;
  onOpenDrawer?: () => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  initialChatUser,
  onOpenDrawer,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(initialChatUser || null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentType, setAttachmentType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatFilter, setChatFilter] = useState<'all' | 'unread'>('all');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadConversations = async () => {
    try {
      const convs = await fetchConversations(currentUser.id);
      setConversations(convs);
      if (!activeUser && convs.length > 0) {
        setActiveUser(convs[0].participant);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    try {
      const msgs = await fetchMessages(currentUser.id, otherUserId);
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConversations();
    fetchRegisteredUsers(currentUser.id)
      .then((users) => setAllUsers(users.filter((u) => u.id !== currentUser.id)))
      .catch(() => {});
  }, [currentUser.id]);

  useEffect(() => {
    if (activeUser) {
      loadMessages(activeUser.id);
    }
  }, [activeUser]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeUser || (!messageText.trim() && !attachmentUrl)) return;

    try {
      const sent = await sendMessage({
        sender_id: currentUser.id,
        receiver_id: activeUser.id,
        content: messageText.trim(),
        media_url: attachmentUrl || undefined,
        media_type: attachmentType || undefined,
      });

      setMessages((prev) => [...prev, sent]);
      setMessageText('');
      setAttachmentUrl(null);
      setAttachmentType(null);
      loadConversations();

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadMedia(file);
      setAttachmentUrl(uploaded.url);
      setAttachmentType(uploaded.type);
    } catch (err) {
      console.error('Upload error in chat:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const visibleConversations = conversations.filter((conv) => {
    if (chatFilter === 'unread' && conv.unread_count <= 0) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      conv.participant.display_name.toLowerCase().includes(q) ||
      conv.participant.username.toLowerCase().includes(q) ||
      (conv.last_message.content || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen w-full select-none overflow-hidden">
      {/* Left Column: Conversations List */}
      <div
        className={`w-full md:w-[380px] lg:w-[400px] border-r border-[#2f3336] flex flex-col shrink-0 ${
          activeUser ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="px-4 h-[53px] border-b border-[#2f3336] flex items-center justify-between gap-2">
          <button
            onClick={onOpenDrawer}
            className="sm:hidden shrink-0 rounded-full active:scale-95 transition-transform"
            title="Abrir menú"
          >
            <img
              src={getSafeAvatarUrl(currentUser.avatar_url)}
              alt={currentUser.display_name}
              className="w-8 h-8 rounded-full object-cover border border-[#2f3336]"
            />
          </button>

          <h1 className="font-extrabold text-xl text-white sm:static absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto">
            <span className="sm:hidden">Chat</span>
            <span className="hidden sm:inline">Mensajes</span>
          </h1>

          <button
            onClick={() => setShowNewChatModal(true)}
            className="hidden sm:flex p-2 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors cursor-pointer"
            title="Nuevo mensaje"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            onClick={() => setChatFilter((prev) => (prev === 'all' ? 'unread' : 'all'))}
            className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#2f3336] text-[13px] font-bold text-white"
          >
            {chatFilter === 'all' ? 'Todo' : 'No leídos'}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-[#2f3336]">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#202327]">
            <Search className="w-4 h-4 text-[#71767b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar"
              className="bg-transparent text-sm text-[#e7e9ea] outline-none w-full placeholder-[#71767b]"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-[#71767b] text-sm flex flex-col items-center">
              <p>No tienes mensajes aún.</p>
              <button
                type="button"
                onClick={() => setShowNewChatModal(true)}
                className="mt-4 px-4 py-2 bg-[#1d9bf0] text-white font-bold text-xs rounded-full hover:bg-[#1a8cd8] transition-colors cursor-pointer"
              >
                Escribir a un usuario registrado
              </button>
            </div>
          ) : visibleConversations.length === 0 ? (
            <div className="p-8 text-center text-[#71767b] text-sm">
              No hay conversaciones que coincidan.
            </div>
          ) : (
            visibleConversations.map((conv) => {
              const isActive = activeUser?.id === conv.participant.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveUser(conv.participant)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#16181c] transition-colors border-b border-[#2f3336]/40 ${
                    isActive ? 'bg-[#16181c]' : ''
                  }`}
                >
                  <img
                    src={getSafeAvatarUrl(conv.participant.avatar_url)}
                    alt={conv.participant.display_name}
                    className="w-14 h-14 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-bold text-[17px] text-[#e7e9ea] truncate">
                          {conv.participant.display_name}
                        </span>
                        {conv.participant.is_verified && (
                          <CheckCircle2 className="w-[18px] h-[18px] text-[#1d9bf0] fill-[#1d9bf0] stroke-black shrink-0" />
                        )}
                      </div>
                      <span className="text-[13px] text-[#71767b] shrink-0">
                        {formatRelativeTime(conv.last_message.created_at)}
                      </span>
                    </div>
                    <p className="text-[15px] text-[#71767b] truncate mt-0.5">
                      {conv.last_message.content || 'Archivo multimedia adjunto'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Chat messages thread */}
      <div
        className={`flex-1 flex flex-col h-full bg-black ${
          !activeUser ? 'hidden md:flex items-center justify-center' : 'flex'
        }`}
      >
        {!activeUser ? (
          <div className="flex flex-col items-center justify-center p-8 max-w-sm text-center">
            <div className="w-16 h-16 rounded-full bg-[#16181c] border border-[#2f3336] flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-[#1d9bf0]" />
            </div>
            <h2 className="text-[31px] font-extrabold text-[#e7e9ea] leading-tight mb-2">
              Selecciona un mensaje
            </h2>
            <p className="text-[15px] text-[#71767b] leading-normal mb-6">
              Elige entre tus conversaciones existentes o empieza una nueva.
            </p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-6 py-3 bg-white hover:bg-[#e6e6e6] text-black font-bold text-[15px] rounded-full transition-colors cursor-pointer shadow-md active:scale-95"
            >
              Nuevo mensaje
            </button>
          </div>
        ) : (
          <>
            {/* Active user header */}
            <div className="p-3 px-4 border-b border-[#2f3336] flex items-center justify-between backdrop-blur-md bg-black/80 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveUser(null)}
                  className="md:hidden p-1.5 text-white hover:bg-[#181818] rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                  src={getSafeAvatarUrl(activeUser.avatar_url)}
                  alt={activeUser.display_name}
                  className="w-10 h-10 rounded-full object-cover border border-[#2f3336]"
                />
                <div className="flex flex-col leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[15px] text-white">
                      {activeUser.display_name}
                    </span>
                    {activeUser.is_verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1d9bf0] fill-[#1d9bf0] stroke-black" />
                    )}
                  </div>
                  <span className="text-xs text-[#71767b]">@{activeUser.username}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#71767b]">
                <button className="p-2 hover:bg-white/10 hover:text-white rounded-full transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/10 hover:text-white rounded-full transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/10 hover:text-white rounded-full transition-colors">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages body list */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {/* Profile Card at top of thread */}
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center border-b border-[#2f3336]/60 mb-2">
                <img
                  src={getSafeAvatarUrl(activeUser.avatar_url)}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover border border-[#2f3336] mb-2"
                />
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[17px] text-white">{activeUser.display_name}</span>
                  {activeUser.is_verified && (
                    <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0] stroke-black" />
                  )}
                </div>
                <span className="text-[14px] text-[#71767b] mb-1">@{activeUser.username}</span>
                {activeUser.bio && (
                  <p className="text-[13px] text-[#e7e9ea] max-w-sm mb-2 leading-relaxed">{activeUser.bio}</p>
                )}
                <span className="text-[12px] text-[#71767b]">
                  Se unió el {new Date(activeUser.joined_at || Date.now()).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              {messages.map((msg) => {
                const isMine = msg.sender_id === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[75%] ${
                      isMine ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    {/* Media preview */}
                    {msg.media_url && (
                      <div className="mb-1 rounded-2xl overflow-hidden border border-[#2f3336] max-h-60">
                        {msg.media_type === 'video' ? (
                          <video src={msg.media_url} controls className="max-h-60 rounded-2xl" />
                        ) : msg.media_type === 'audio' ? (
                          <audio src={msg.media_url} controls className="p-2" />
                        ) : (
                          <img
                            src={msg.media_url}
                            alt=""
                            className="max-h-60 object-cover rounded-2xl"
                          />
                        )}
                      </div>
                    )}

                    {/* Text bubble */}
                    {msg.content && (
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed break-words ${
                          isMine
                            ? 'bg-[#1d9bf0] text-white font-normal rounded-br-sm'
                            : 'bg-[#2f3336] text-[#e7e9ea] rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}

                    <span className="text-[10px] text-[#71767b] mt-1 px-1 flex items-center gap-1">
                      <span>{formatRelativeTime(msg.created_at)}</span>
                      {isMine && <span className="text-[#1d9bf0]">✓</span>}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <div className="p-3 border-t border-[#2f3336] bg-black">
              {attachmentUrl && (
                <div className="mb-2 relative inline-block">
                  <img
                    src={attachmentUrl}
                    alt="attachment"
                    className="w-16 h-16 object-cover rounded-lg border border-[#1d9bf0]"
                  />
                  <button
                    onClick={() => {
                      setAttachmentUrl(null);
                      setAttachmentType(null);
                    }}
                    className="absolute -top-1 -right-1 bg-black text-white p-0.5 rounded-full border border-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {isUploading && (
                <div className="flex items-center gap-2 text-xs text-[#1d9bf0] mb-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Subiendo archivo...</span>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors cursor-pointer"
                  title="Subir archivo"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Empieza un mensaje nuevo"
                  className="flex-1 bg-[#202327] border border-transparent focus:border-[#1d9bf0] rounded-full px-4 py-2.5 text-sm text-[#e7e9ea] outline-none transition-colors"
                />

                <button
                  type="submit"
                  disabled={!messageText.trim() && !attachmentUrl}
                  className="p-2.5 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white rounded-full disabled:opacity-40 transition-opacity active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-[#2f3336] rounded-2xl w-full max-w-md p-5 animate-pop-in shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2f3336]">
              <div>
                <h3 className="font-extrabold text-lg text-white">Nuevo mensaje</h3>
                <p className="text-xs text-[#71767b]">Usuarios registrados en Talma</p>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-[#71767b] hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 max-h-80 overflow-y-auto flex flex-col gap-1 mt-2">
              {allUsers.length === 0 ? (
                <div className="p-6 text-center text-[#71767b] text-sm">
                  No hay otros usuarios registrados todavía.
                </div>
              ) : (
                allUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setActiveUser(u);
                      setShowNewChatModal(false);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-[#16181c] rounded-xl cursor-pointer transition-colors"
                  >
                    <img
                      src={getSafeAvatarUrl(u.avatar_url)}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-[#2f3336]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-white truncate">{u.display_name}</span>
                        {u.is_verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1d9bf0] fill-[#1d9bf0] stroke-black shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-[#71767b] block truncate">@{u.username}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
