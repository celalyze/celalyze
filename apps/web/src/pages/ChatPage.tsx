import { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Sparkles,
  Send,
  User,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import { DEFAULT_MENTO_ADDRESS } from '../services/celoService'
import { ask9RouterAgent, type ChatMessage } from '../services/aiAgentService'
import { ChatMessageSkeleton } from '../components/Skeleton'

function FormattedChatMessage({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-1.5 leading-relaxed font-sans">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />

        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-dark">
                {part.slice(2, -2)}
              </strong>
            )
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={pIdx} className="px-1.5 py-0.5 bg-dark/10 text-dark font-mono text-2xs rounded">
                {part.slice(1, -1)}
              </code>
            )
          }
          return part
        })

        return <p key={idx}>{renderedLine}</p>
      })}
    </div>
  )
}

export function ChatPage() {
  const { address: connectedAddress } = useWallet()
  const activeAddress = connectedAddress || DEFAULT_MENTO_ADDRESS

  const [inputQuery, setInputQuery] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am **Celalyze AI Agent** (connected to Celo Mainnet RPC).\n\nI automatically audit your **Tax Reports**, **Capital Gains (PnL)**, **Taxable Income**, and **Portfolio Balances** using real-time onchain data.\n\nWhat would you like to ask today?`,
      timestamp: new Date(),
      sources: ['Celo Mainnet RPC', 'Celalyze Onchain Tax Engine'],
    },
  ])

  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim()
    if (!query || isLoading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputQuery('')
    setIsLoading(true)

    try {
      const response = await ask9RouterAgent(query, activeAddress, messages)

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
        sources: response.sources,
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry, an error occurred while connecting to the AI agent: ${err?.message || 'Unknown error'}.`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedPrompts = [
    'What is my Net Capital Gains (PnL) for 2026?',
    'How much Gas Fee can be claimed as a tax deduction?',
    'Display my current Celo token portfolio balance breakdown.',
    'Explain the FIFO tax accounting method used in Celalyze.',
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark/15 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary text-dark text-xs font-semibold rounded-full border border-dark whitespace-nowrap">
              <Bot className="w-3.5 h-3.5" />
              <span>AI Engine Active</span>
            </span>
          </div>
          <h1 className="hero-title text-3xl sm:text-4xl text-dark">
            Interactive AI Chat Agent
          </h1>
          <p className="text-xs text-dark/70 font-mono mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="whitespace-nowrap">Context Address:</span>
            <span className="font-bold text-dark break-all">{activeAddress}</span>
            <a
              href={`https://celo.blockscout.com/address/${activeAddress}`}
              target="_blank"
              rel="noreferrer"
              className="text-dark hover:underline inline-flex items-center gap-0.5 flex-shrink-0"
              title="View on Celo Explorer"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-dark/70 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-dark" />
          <span>Quick Prompts:</span>
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            className="px-3 py-1 bg-card border border-dark text-dark text-xs rounded-full hover:bg-primary transition-all cursor-pointer whitespace-nowrap shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Thread Container */}
      <div className="bg-card border-2 border-dark rounded-none flex flex-col h-[520px] shadow-xs">
        {/* Chat Thread Area */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary border border-dark flex items-center justify-center text-dark flex-shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-none p-4 text-xs space-y-2 border border-dark ${
                  msg.role === 'user'
                    ? 'bg-primary text-dark font-medium shadow-2xs'
                    : 'bg-secondary text-dark shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 border-b border-dark/15 pb-1">
                  <span className="font-bold text-2xs uppercase tracking-wider text-dark/70">
                    {msg.role === 'user' ? 'You' : 'Celalyze AI Agent'}
                  </span>
                  <span className="text-2xs text-dark/50 font-mono">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <FormattedChatMessage content={msg.content} />

                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-dark/15 flex items-center gap-1.5 flex-wrap text-2xs text-dark/70 font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    <span>Onchain Grounding:</span>
                    {msg.sources.map((src, i) => (
                      <span key={i} className="px-2 py-0.5 bg-card border border-dark/20 rounded-full">
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-card border border-dark flex items-center justify-center text-dark flex-shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && <ChatMessageSkeleton />}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t-2 border-dark bg-secondary flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI agent about your Celo portfolio, tax liabilities, or capital gains..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-card border border-dark rounded-full text-xs text-dark focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isLoading}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-dark text-xs font-semibold rounded-full border border-dark hover:bg-primary/90 transition-all enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 shadow-xs"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
