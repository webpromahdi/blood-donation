import { useState, useEffect, useRef } from 'react'
import { Search, Send, ArrowLeft } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { api } from '../../utils/apiService'
import { useToast } from '../../components/ui/Toast'

export default function Chat() {
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [msg, setMsg] = useState('')
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [search, setSearch] = useState('')
  
  const { toast } = useToast()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.user_id)
      const interval = setInterval(() => fetchMessages(activeChat.user_id), 5000)
      return () => clearInterval(interval)
    }
  }, [activeChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const data = await api.get('/messages/list.php')
      if (data.success) {
        setConversations(data.conversations)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingChats(false)
    }
  }

  const fetchMessages = async (userId) => {
    try {
      const data = await api.get(`/messages/conversation.php?user_id=${userId}`)
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!msg.trim() || !activeChat) return

    const tempMsg = {
      id: Date.now(),
      message: msg,
      is_sender: true,
      created_at: new Date().toISOString()
    }
    
    setMessages([...messages, tempMsg])
    setMsg('')

    try {
      const data = await api.post('/messages/send.php', {
        receiver_id: activeChat.user_id,
        message: tempMsg.message
      })
      if (!data.success) {
        toast(data.message || 'Failed to send message', { type: 'error' })
        setMessages(messages.filter(m => m.id !== tempMsg.id))
      } else {
        fetchMessages(activeChat.user_id)
        fetchConversations()
      }
    } catch (err) {
      console.error(err)
      toast('Error sending message', { type: 'error' })
      setMessages(messages.filter(m => m.id !== tempMsg.id))
    }
  }

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="-mx-4 -my-6 sm:-mx-6 h-[calc(100vh-64px)] flex bg-white dark:bg-slate-900">
      {/* Left Sidebar */}
      <div className={`w-full flex-shrink-0 flex-col border-r border-gray-200 dark:border-slate-800 lg:w-80 ${activeChat ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-slate-800">
          <Input icon={Search} placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map(chat => (
              <div 
                key={chat.user_id} 
                onClick={() => setActiveChat(chat)}
                className={`flex cursor-pointer gap-3 border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800/50 ${activeChat?.user_id === chat.user_id ? 'bg-red-50 dark:bg-red-950/30' : ''}`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600 dark:bg-red-900/50 dark:text-red-400">
                  {chat.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="truncate font-semibold text-gray-900 dark:text-slate-200">{chat.name}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(chat.last_message_time)}</span>
                  </div>
                  <p className="truncate text-sm text-gray-600 dark:text-gray-400">{chat.last_message}</p>
                </div>
                {chat.unread_count > 0 && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {chat.unread_count}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Chat Area */}
      {activeChat ? (
        <div className={`flex-1 flex-col ${!activeChat ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button className="lg:hidden" onClick={() => setActiveChat(null)}>
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 font-bold text-red-600 dark:bg-red-900/50 dark:text-red-400">
              {activeChat.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-slate-200">{activeChat.name}</p>
              <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 capitalize">
                {activeChat.role}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-slate-900/50 flex flex-col gap-3">
            {messages.map(m => (
              <div key={m.id} className={`flex max-w-[75%] flex-col ${m.is_sender ? 'self-end' : 'self-start'}`}>
                <div className={`rounded-md p-3 ${m.is_sender ? 'rounded-tr-none bg-red-600 text-white' : 'rounded-tl-none bg-white border border-gray-200 text-gray-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{m.message}</p>
                </div>
                <span className={`mt-1 text-[10px] text-gray-500 ${m.is_sender ? 'text-right' : 'text-left'}`}>{formatTime(m.created_at)}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-3 border-t border-gray-200 p-4 bg-white dark:border-slate-800 dark:bg-slate-900">
            <Input 
              value={msg} 
              onChange={e => setMsg(e.target.value)} 
              placeholder="Type your message..." 
              className="flex-1"
            />
            <Button type="submit" variant="primary" disabled={!msg.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
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
  )
}
