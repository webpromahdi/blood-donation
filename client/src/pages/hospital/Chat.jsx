import { useState, useEffect, useRef } from 'react'
import { Send, Search, ArrowLeft, Phone, MoreVertical, Loader2 } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { api } from '../../utils/apiService'
import { useAuth } from '../../context/AuthContext'

export default function Chat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [mobileView, setMobileView] = useState('list')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeId) {
      fetchMessages(activeId)
      // We could add polling for messages here, but let's keep it simple
      const msgInterval = setInterval(() => fetchMessages(activeId, true), 5000)
      return () => clearInterval(msgInterval)
    }
  }, [activeId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const data = await api.get('/chat/conversations.php')
      if (data.success) {
        setConversations(data.conversations || [])
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
    } finally {
      setLoadingConvs(false)
    }
  }

  const fetchMessages = async (userId, background = false) => {
    if (!background) setLoadingMessages(true)
    try {
      const data = await api.get(`/chat/messages.php?user_id=${userId}`)
      if (data.success) {
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      if (!background) setLoadingMessages(false)
    }
  }

  function openConversation(id) {
    setActiveId(id)
    setMobileView('chat')
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || !activeId) return
    
    setInput('')
    setSending(true)
    
    // Optimistic UI update
    const tempMsg = {
      id: Date.now(),
      sender_id: user.id, // Current user
      message: text,
      created_at: new Date().toISOString(),
      is_temp: true
    }
    setMessages(prev => [...prev, tempMsg])
    
    try {
      const data = await api.post('/chat/send.php', {
        receiver_id: activeId,
        message: text
      })
      if (data.success) {
        // Refresh messages to get the official ID and timestamp
        fetchMessages(activeId, true)
        fetchConversations() // update the conversation preview
      } else {
        alert(data.message || 'Failed to send message')
        // Remove temp message on failure
        setMessages(prev => prev.filter(m => !m.is_temp))
      }
    } catch (err) {
      console.error('Send message error:', err)
      setMessages(prev => prev.filter(m => !m.is_temp))
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Generate color / initials for a user name
  const getAvatarProps = (name) => {
    if (!name) return { initials: '??', color: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300' }
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    // Simple hash to pick a color
    const colors = ['bg-red-100 text-red-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700']
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return { initials, color: colors[hash % colors.length] }
  }

  const formatTime = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const active = conversations.find((c) => c.user_id === activeId)

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-md border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      {/* LEFT panel */}
      <div
        className={`w-full flex-col border-r border-gray-200 dark:border-slate-700 lg:flex lg:w-80 lg:flex-shrink-0 ${
          mobileView === 'list' ? 'flex' : 'hidden'
        }`}
      >
        <div className="border-b border-gray-100 p-3 dark:border-slate-700">
          <Input leftIcon={Search} placeholder="Search conversations" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
             <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
             <div className="p-4 text-center text-sm text-gray-500">No conversations yet.</div>
          ) : (
            conversations.map((c) => {
              const { initials, color } = getAvatarProps(c.user_name)
              return (
                <div
                  key={c.user_id}
                  onClick={() => openConversation(c.user_id)}
                  className={`flex cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-3 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700/40 ${
                    c.user_id === activeId ? 'bg-red-50 dark:bg-red-950/30' : ''
                  }`}
                >
                  <div className={`flex size-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${color}`}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-gray-900 dark:text-slate-100">
                        {c.user_name}
                      </span>
                      <span className="flex-shrink-0 text-xs text-gray-400">{c.last_message_time}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-gray-500 dark:text-slate-400">
                        {c.last_message}
                      </p>
                      {c.unread_count > 0 && (
                        <span className="flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* RIGHT panel */}
      <div
        className={`flex-1 flex-col ${
          mobileView === 'chat' ? 'flex' : 'hidden'
        } lg:flex`}
      >
        {active ? (
          <>
            <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setMobileView('list')}
                aria-label="Back to conversations"
                className="rounded-md p-1 text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700 lg:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div
                className={`flex size-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarProps(active.user_name).color}`}
              >
                {getAvatarProps(active.user_name).initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 dark:text-slate-100">
                  {active.user_name}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 capitalize">
                  {active.user_role}
                </p>
              </div>
              <button type="button" className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
                <Phone className="h-5 w-5" />
              </button>
              <button type="button" className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              {loadingMessages && messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-500"><Loader2 className="animate-spin" /></div>
              ) : (
                <>
                  {messages.map((m) => {
                    const isSentByMe = parseInt(m.sender_id) === parseInt(user?.id)
                    return isSentByMe ? (
                      <div
                        key={m.id}
                        className="max-w-[75%] self-end rounded-md rounded-tr-none bg-red-600 p-3 text-white"
                      >
                        <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                        <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-red-100">
                          {formatTime(m.created_at)}
                          {m.is_temp && <Loader2 className="h-3 w-3 animate-spin" />}
                        </span>
                      </div>
                    ) : (
                      <div
                        key={m.id}
                        className="max-w-[75%] self-start rounded-md rounded-tl-none bg-gray-100 p-3 text-gray-800 dark:bg-slate-700 dark:text-slate-100"
                      >
                        <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                        <span className="mt-1 block text-[10px] text-gray-400 dark:text-slate-400">
                          {formatTime(m.created_at)}
                        </span>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="flex gap-3 border-t border-gray-200 p-4 dark:border-slate-700">
              <Input
                className="flex-1"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button variant="primary" onClick={sendMessage} disabled={!input.trim() || sending} aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-400 dark:text-slate-500">
            <Search className="mb-4 h-12 w-12 opacity-20" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}
