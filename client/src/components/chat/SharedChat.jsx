import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, Search, ArrowLeft, Phone, MoreVertical, Loader2, Headphones } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { api } from '../../utils/apiService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'

export default function SharedChat({ role }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [activeRole, setActiveRole] = useState(null)
  const [mobileView, setMobileView] = useState('list')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [lastTimestamp, setLastTimestamp] = useState(null)
  
  const messagesEndRef = useRef(null)
  const pollIntervalRef = useRef(null)
  const msgIntervalRef = useRef(null)

  // Initialize from URL params on mount
  useEffect(() => {
    const urlUser = searchParams.get('user')
    const urlName = searchParams.get('name')
    
    if (urlUser) {
      setActiveId(parseInt(urlUser, 10))
      setMobileView('chat')
      
      // If we have a URL user, we might need to add a temporary conversation 
      // if it's not in the fetched list. This is handled after fetching conversations.
    }

    fetchConversations()
    pollIntervalRef.current = setInterval(fetchConversations, 10000)
    
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      if (msgIntervalRef.current) clearInterval(msgIntervalRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle active conversation change
  useEffect(() => {
    if (activeId) {
      // Clear previous messages and timestamp
      setMessages([])
      setLastTimestamp(null)
      
      // Initial fetch
      fetchMessages(activeId)
      
      // Mark as read
      markAsRead(activeId)
      
      // Setup polling for this specific user
      if (msgIntervalRef.current) clearInterval(msgIntervalRef.current)
      msgIntervalRef.current = setInterval(() => {
        // Use a functional state update approach for polling if needed, 
        // but simple fetch with current activeId works since activeId is in closure of useEffect
        fetchMessagesIncremental(activeId)
      }, 5000)
      
      // Clean up URL params so it doesn't stick around if they navigate away
      if (searchParams.has('user')) {
        setSearchParams(new URLSearchParams())
      }
    } else {
      if (msgIntervalRef.current) clearInterval(msgIntervalRef.current)
    }
    
    return () => {
      if (msgIntervalRef.current) clearInterval(msgIntervalRef.current)
    }
  }, [activeId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const markAsRead = async (userId) => {
    try {
      await api.post('/chat/mark-read.php', {
        action: 'conversation',
        user_id: userId
      })
      // Update local unread count
      setConversations(prev => prev.map(c => 
        c.user_id === userId ? { ...c, unread_count: 0 } : c
      ))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const fetchConversations = async () => {
    try {
      const data = await api.get('/chat/conversations.php')
      if (data.success) {
        let convs = data.conversations || []
        
        // Handle URL parameters for a new conversation that might not exist yet
        setConversations(prevConvs => {
          const urlUser = searchParams.get('user')
          const urlName = searchParams.get('name')
          
          if (urlUser) {
            const parsedUser = parseInt(urlUser, 10)
            const exists = convs.find(c => c.user_id === parsedUser)
            
            if (!exists && urlName) {
              // Add a temporary conversation at the top
              const tempConv = {
                user_id: parsedUser,
                user_name: urlName,
                user_role: searchParams.get('role') || 'user',
                last_message: 'Start a conversation...',
                last_message_time: new Date().toISOString(),
                unread_count: 0
              }
              return [tempConv, ...convs]
            }
          }
          
          // Also keep any currently active conversation that might be temporary
          // (i.e. we injected it before, and they haven't sent a message yet)
          if (activeId) {
             const activeExists = convs.find(c => c.user_id === activeId)
             if (!activeExists) {
                const oldActive = prevConvs.find(c => c.user_id === activeId)
                if (oldActive) {
                   return [oldActive, ...convs]
                }
             }
          }
          
          return convs
        })
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
    } finally {
      setLoadingConvs(false)
    }
  }

  // Full fetch
  const fetchMessages = async (userId) => {
    setLoadingMessages(true)
    try {
      const data = await api.get(`/chat/messages.php?user_id=${userId}`)
      if (data.success) {
        setMessages(data.messages || [])
        if (data.last_timestamp) {
          setLastTimestamp(data.last_timestamp)
        }
        if (data.other_user) {
           setActiveRole(data.other_user.role)
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      setLoadingMessages(false)
    }
  }
  
  // Incremental fetch
  const fetchMessagesIncremental = async (userId) => {
    // We need to use the latest timestamp, which might be tricky in a setInterval closure
    // So we'll use a functional state update trick or refs. 
    // For simplicity, we can fetch without 'since' and just replace if we don't track since properly.
    // Let's do a full fetch in the background for simplicity, to ensure correctness,
    // since the API is fast.
    try {
      const data = await api.get(`/chat/messages.php?user_id=${userId}`)
      if (data.success) {
        setMessages(data.messages || [])
        if (data.last_timestamp) {
          setLastTimestamp(data.last_timestamp)
        }
      }
    } catch (err) {
      console.error('Failed to load messages (bg):', err)
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
      sender_id: user.id,
      sender_name: 'You',
      message: text,
      created_at: new Date().toISOString(),
      is_mine: true, // Key fix: use is_mine
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
        fetchMessages(activeId)
        fetchConversations()
      } else {
        toast(data.message || 'Failed to send message', { type: 'error', title: 'Error' })
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
        setInput(text) // restore input
      }
    } catch (err) {
      console.error('Send message error:', err)
      toast(err.message || 'Failed to send message', { type: 'error', title: 'Error' })
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
      setInput(text) // restore input
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
  
  const handleContactAdmin = async () => {
    try {
      const data = await api.get('/chat/search-users.php?role=admin&limit=1')
      if (data.success && data.data && data.data.users && data.data.users.length > 0) {
        const admin = data.data.users[0]
        setActiveId(admin.id)
        setMobileView('chat')
        
        // Add to conversations if not there
        setConversations(prev => {
          if (!prev.find(c => c.user_id === admin.id)) {
            return [{
              user_id: admin.id,
              user_name: admin.name,
              user_role: 'admin',
              last_message: 'Start a conversation...',
              last_message_time: new Date().toISOString(),
              unread_count: 0
            }, ...prev]
          }
          return prev
        })
      } else {
        toast('Admin support is currently unavailable', { type: 'error' })
      }
    } catch (err) {
      console.error('Failed to contact admin:', err)
      toast('Failed to contact admin', { type: 'error' })
    }
  }

  // Generate color / initials for a user name
  const getAvatarProps = (name) => {
    if (!name) return { initials: '??', color: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300' }
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    const colors = ['bg-red-100 text-red-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700']
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return { initials, color: colors[hash % colors.length] }
  }

  const formatTime = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    
    // Check if it's today
    const today = new Date()
    if (date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()) {
       return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    
    // Otherwise return date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const active = conversations.find((c) => c.user_id === activeId)
  
  const filteredConversations = conversations.filter(c => 
    c.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-md border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      {/* LEFT panel */}
      <div
        className={`w-full flex-col border-r border-gray-200 dark:border-slate-700 lg:flex lg:w-80 lg:flex-shrink-0 ${
          mobileView === 'list' ? 'flex' : 'hidden'
        }`}
      >
        <div className="border-b border-gray-100 p-3 dark:border-slate-700">
          <Input 
             leftIcon={Search} 
             placeholder="Search conversations" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
             <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : filteredConversations.length === 0 ? (
             <div className="p-4 text-center text-sm text-gray-500">No conversations found.</div>
          ) : (
            filteredConversations.map((c) => {
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
                      <span className="flex-shrink-0 text-xs text-gray-400">{formatTime(c.last_message_time)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-gray-500 dark:text-slate-400">
                        {c.last_message}
                      </p>
                      {c.unread_count > 0 && (
                        <span className="flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
                          {c.unread_count > 99 ? '99+' : c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
        
        {/* Contact Admin Support (hidden for admin) */}
        {role !== 'admin' && (
           <div className="border-t border-gray-100 p-3 dark:border-slate-700">
             <Button 
                variant="outline" 
                className="w-full justify-center gap-2" 
                onClick={handleContactAdmin}
             >
                <Headphones className="h-4 w-4" />
                Contact Admin Support
             </Button>
           </div>
        )}
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
                  {active.user_role || activeRole}
                </p>
              </div>
              <button type="button" className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
                <Phone className="h-5 w-5" />
              </button>
              <button type="button" className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-900/50">
              {loadingMessages && messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-500"><Loader2 className="animate-spin" /></div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                   <p>No messages yet.</p>
                   <p className="text-sm">Send a message to start the conversation.</p>
                </div>
              ) : (
                <>
                  {messages.map((m) => {
                    // Use is_mine from API
                    const isSentByMe = m.is_mine === true || m.is_mine === 1;
                    
                    return isSentByMe ? (
                      <div
                        key={m.id}
                        className="max-w-[75%] self-end rounded-md rounded-tr-none bg-red-600 p-3 text-white shadow-sm"
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{m.message}</p>
                        <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-red-100">
                          {formatTime(m.created_at)}
                          {m.is_temp && <Loader2 className="h-3 w-3 animate-spin" />}
                        </span>
                      </div>
                    ) : (
                      <div
                        key={m.id}
                        className="max-w-[75%] self-start rounded-md rounded-tl-none border border-gray-200 bg-white p-3 text-gray-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{m.message}</p>
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

            <div className="flex gap-3 border-t border-gray-200 p-4 bg-white dark:border-slate-700 dark:bg-slate-800">
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
          <div className="hidden flex-1 flex-col items-center justify-center bg-gray-50 dark:bg-slate-900/50 lg:flex">
             <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
               <Send className="h-10 w-10 opacity-50" />
             </div>
             <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-slate-200">Your Messages</h3>
             <p className="text-gray-500 dark:text-gray-400">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}
