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
} from 'lucide-react';
import { UserProfile, Conversation, DirectMessage } from '../types';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  uploadMedia,
  fetchRecommendations,
} from '../lib/api';
import { formatRelativeTime } from '../lib/utils';

interface MessagesViewProps {
  currentUser: UserProfile;
  initialChatUser?: UserProfile | null;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  initialChatUser,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(initialChatUser || null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentType, setAttachmentType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
    fetchRecommendations(currentUser.id).then((users) => setAllUsers(users)).catch(() => {});
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

  return (
    <div className="flex h-screen w-full select-none overflow-hidden">
      {/* Left Column: Conversations List */}
      <div
        className={`w-full md:w-[380px] lg:w-[400px] border-r border-[#2f3336] flex flex-col shrink-0 ${
          activeUser ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#2f3336] flex items-center justify-between">
          <h1 className="font-extrabold text-xl text-white">Mensajes</h1>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 text-[#22c55e] hover:bg-[#22c55e]/10 rounded-full transition-colors"
            title="Nuevo mensaje"
          >
            <Paperclip className="w-5 h-5" />
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
              placeholder="Buscar mensajes directos"
              className="bg-transparent text-sm text-[#e7e9ea] outline-none w-full"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-[#71767b] text-sm">
              No tienes mensajes aún. ¡Comienza una conversación!
            </div>
          ) : (
            conversations.map((conv) => {
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
                    src={conv.participant.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={conv.participant.display_name}
                    className="w-12 h-12 rounded-full object-cover border border-[#2f3336] shrink-0"
                  />
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 truncate">
                        <span className="font-bold text-[15px] text-white truncate">
                          {conv.participant.display_name}
                        </span>
                        {conv.participant.is_verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] fill-[#22c55e] stroke-black shrink-0" />
                        )}
                        <span className="text-xs text-[#71767b]">
                          @{conv.participant.username}
                        </span>
                      </div>
                      <span className="text-xs text-[#71767b]">
                        {formatRelativeTime(conv.last_message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-[#71767b] truncate mt-0.5">
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
          <div className="text-center p-8 max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-2">Selecciona un mensaje</h2>
            <p className="text-sm text-[#71767b]">
              Elige una conversación existente o inicia una nueva para chatear en tiempo real.
            </p>
          </div>
        ) : (
          <>
            {/* Active user header */}
            <div className="p-3 px-4 border-b border-[#2f3336] flex items-center gap-3 backdrop-blur-md bg-black/80 sticky top-0 z-10">
              <button
                onClick={() => setActiveUser(null)}
                className="md:hidden p-1.5 text-white hover:bg-[#181818] rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img
                src={activeUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={activeUser.display_name}
                className="w-10 h-10 rounded-full object-cover border border-[#2f3336]"
              />
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[15px] text-white">
                    {activeUser.display_name}
                  </span>
                  {activeUser.is_verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] fill-[#22c55e] stroke-black" />
                  )}
                </div>
                <span className="text-xs text-[#71767b]">@{activeUser.username}</span>
              </div>
            </div>

            {/* Messages body list */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
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
                            ? 'bg-[#22c55e] text-black font-medium rounded-br-sm'
                            : 'bg-[#2f3336] text-[#e7e9ea] rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}

                    <span className="text-[10px] text-[#71767b] mt-1 px-1">
                      {formatRelativeTime(msg.created_at)}
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
                    className="w-16 h-16 object-cover rounded-lg border border-[#22c55e]"
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
                <div className="flex items-center gap-2 text-xs text-[#22c55e] mb-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Subiendo archivo a Supabase Storage...</span>
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
                  className="p-2 text-[#22c55e] hover:bg-[#22c55e]/10 rounded-full transition-colors"
                  title="Subir archivo a Supabase"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escribe un mensaje"
                  className="flex-1 bg-[#202327] border border-transparent focus:border-[#22c55e] rounded-full px-4 py-2.5 text-sm text-[#e7e9ea] outline-none transition-colors"
                />

                <button
                  type="submit"
                  disabled={!messageText.trim() && !attachmentUrl}
                  className="p-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-black rounded-full disabled:opacity-40 transition-opacity active:scale-95"
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
          <div className="bg-black border border-[#2f3336] rounded-2xl w-full max-w-md p-4 animate-pop-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#2f3336]">
              <h3 className="font-bold text-lg text-white">Nuevo mensaje</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-[#71767b] hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 max-h-80 overflow-y-auto flex flex-col gap-1">
              {allUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    setActiveUser(u);
                    setShowNewChatModal(false);
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-[#16181c] rounded-xl cursor-pointer"
                >
                  <img
                    src={u.avatar_url}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-[#2f3336]"
                  />
                  <div>
                    <span className="font-bold text-sm text-white">{u.display_name}</span>
                    <span className="text-xs text-[#71767b] block">@{u.username}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
