"use client"

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@/hooks/useChat'
import { useCredits } from '@/hooks/useCredits'
import { useArchitectConfig } from '@/hooks/useArchitectConfig'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassTextarea } from '@/components/ui/glass-textarea'
import { SidebarLayout } from '@/components/sidebar-layout'
import { ProjectMessage } from '@/components/ui/project-message'
import {
  Send,
  Bot,
  User,
  Settings,
  CreditCard,
  MessageSquare,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  cost?: number
  createdAt: string
}

interface Session {
  id: number
  title: string
  updatedAt: string
  messages?: Message[]
}

export default function ArchitectChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const {
    currentSession,
    sessions,
    messages,
    isLoading,
    error,
    sendMessage,
    loadSession,
    createNewSession,
    deleteSession,
    setError
  } = useChat()

  const {
    balance,
    formatBalance,
    addCredits,
    hasEnoughCredits,
    error: creditsError
  } = useCredits()

  const {
    activeConfig,
    createConfig,
    updateConfig,
    isLoading: configLoading
  } = useArchitectConfig()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || isTyping) return

    // Verificar créditos
    if (!hasEnoughCredits(0.01)) {
      setError('Créditos insuficientes. Adicione créditos para continuar.')
      return
    }

    const message = inputValue.trim()
    setInputValue('')
    setIsTyping(true)

    try {
      await sendMessage(message, activeConfig?.prompt)
    } catch (err) {
      // Erro já é tratado no hook useChat
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSessionSelect = (sessionId: number) => {
    loadSession(sessionId)
  }

  const handleNewSession = () => {
    createNewSession()
  }

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Tem certeza que deseja excluir esta conversa?')) {
      await deleteSession(sessionId)
    }
  }

  if (status === 'loading') {
    return (
      <SidebarLayout title="Arquiteto de Projetos">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-white/50" />
        </div>
      </SidebarLayout>
    )
  }

  if (!session) {
    return null
  }

  return (
    <SidebarLayout
      title="Arquiteto de Projetos"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Arquiteto de Projetos' }
      ]}
    >
      <div className="flex h-[calc(100vh-180px)] gap-6">
        {/* Sidebar com sessões */}
        <div className="w-80 flex flex-col gap-4">
          {/* Card de créditos */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/70">Créditos</span>
              </div>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </GlassButton>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {formatBalance()}
            </div>
            <div className="text-xs text-white/50">
              Cada mensagem consome créditos baseado no uso
            </div>
          </GlassCard>

          {/* Lista de sessões */}
          <GlassCard className="flex-1 overflow-hidden">
            <GlassCardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-white/70" />
                  <span className="text-sm text-white/70">Conversas</span>
                </div>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={handleNewSession}
                >
                  <Plus className="w-4 h-4" />
                </GlassButton>
              </div>
            </GlassCardHeader>
            <div className="overflow-y-auto max-h-96 space-y-2 px-4 pb-4">
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-white/30 mx-auto mb-2" />
                  <p className="text-sm text-white/50">Nenhuma conversa ainda</p>
                </div>
              ) : (
                sessions.map((session: Session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      relative group cursor-pointer p-3 rounded-xl border transition-all duration-200
                      ${currentSession?.id === session.id
                        ? 'bg-white/10 border-white/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }
                    `}
                    onClick={() => handleSessionSelect(session.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {session.title}
                        </h4>
                        <p className="text-xs text-white/50 mt-1">
                          {format(new Date(session.updatedAt), 'dd/MM HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </GlassButton>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Área principal de chat */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Header */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {activeConfig?.name || 'Arquiteto de Projetos'}
                  </h2>
                  <p className="text-sm text-white/50">
                    Seu assistente especializado em arquitetura de software
                  </p>
                </div>
              </div>
              {isTyping && (
                <div className="flex items-center gap-2 text-white/50">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Digitando...</span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Área de mensagens */}
          <GlassCard className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Bem-vindo ao Arquiteto de Projetos
                  </h3>
                  <p className="text-white/50 max-w-md">
                    Sou seu assistente especializado em arquitetura de software.
                    Me diga sobre o projeto que você quer criar e vou ajudá-lo a
                    estruturar requisitos, definir tasks e criar um plano completo.
                  </p>
                  <div className="mt-6 space-y-2">
                    <p className="text-sm text-white/30">Tente perguntar:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        "Quero criar um e-commerce",
                        "App de delivery de comida",
                        "Sistema de gestão escolar",
                        "Plataforma de cursos online"
                      ].map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setInputValue(suggestion)}
                          className="px-3 py-1 text-xs bg-white/10 border border-white/20 rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((message: Message, index: number) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`
                        flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}
                      `}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div className={`
                        max-w-2xl px-4 py-3 rounded-2xl
                        ${message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20'
                          : 'bg-white/10 border border-white/10'
                        }
                      `}>
                        <div className="text-white whitespace-pre-wrap">
                          {message.content}
                        </div>

                        {/* Mostrar card do projeto se for criado pelo agente */}
                        {message.role === 'assistant' && (
                          <ProjectMessage
                            message={message.content}
                            sessionId={currentSession?.id}
                          />
                        )}

                        {message.cost && message.cost > 0 && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-white/30">
                            <Zap className="w-3 h-3" />
                            <span>{formatBalance(message.cost)}</span>
                          </div>
                        )}
                      </div>

                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-white/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/10 border border-white/10 px-4 py-3 rounded-2xl">
                    <div className="flex items-center gap-2 text-white/50">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando sua mensagem...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </GlassCard>

          {/* Área de input */}
          <GlassCard className="p-4">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            {creditsError && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">{creditsError}</span>
              </div>
            )}

            <div className="flex gap-3">
              <GlassTextarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Descreva o projeto que você quer criar..."
                className="flex-1 resize-none"
                rows={2}
                disabled={isLoading || isTyping}
              />
              <GlassButton
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || isTyping || !hasEnoughCredits(0.01)}
                size="lg"
                className="px-6"
              >
                {isLoading || isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </GlassButton>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-white/30">
              <span>Pressione Enter para enviar, Shift+Enter para nova linha</span>
              <span>Custo estimado: ~$0.01-0.05 por mensagem</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </SidebarLayout>
  )
}