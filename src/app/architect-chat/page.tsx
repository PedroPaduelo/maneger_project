"use client"

import { useState, useRef, useEffect, useMemo } from 'react'
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
import { AgentActionsBar } from '@/components/agent/AgentActionsBar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
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
  Zap,
  CheckCircle
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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null; count: number | null; title: string }>({ open: false, id: null, count: null, title: '' })
  const [isDeleting, setIsDeleting] = useState(false)

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
    setSessionStatus,
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

  // Garante lista de sessões sem duplicatas por id (previne chaves repetidas)
  const [sessionFilter, setSessionFilter] = useState<'active' | 'archived' | 'completed'>('active')
  const uniqueSessions = useMemo(() => {
    const map = new Map<number, Session>()
    for (const s of sessions) map.set(s.id, s)
    const all = Array.from(map.values())
    return all.filter(s => {
      if (sessionFilter === 'active') return s.status === 'active'
      if (sessionFilter === 'archived') return s.status === 'archived'
      return s.status === 'completed'
    })
  }, [sessions, sessionFilter])

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
    if (!hasEnoughCredits(15)) {
      setError('Coins insuficientes. Adicione coins para continuar.')
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

  const handleOpenDelete = async (sessionItem: Session, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteDialog({ open: true, id: sessionItem.id, count: null, title: sessionItem.title })
    try {
      const res = await fetch(`/api/chat?sessionId=${sessionItem.id}`)
      if (res.ok) {
        const data = await res.json()
        const count = Array.isArray(data.messages) ? data.messages.length : 0
        setDeleteDialog(prev => ({ ...prev, count }))
      }
    } catch (_) {
      // silencioso
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteDialog.id) return
    setIsDeleting(true)
    try {
      await deleteSession(deleteDialog.id)
      toast.success('Conversa excluída com sucesso')
      setDeleteDialog({ open: false, id: null, count: null, title: '' })
    } catch (err) {
      toast.error('Falha ao excluir a conversa')
    } finally {
      setIsDeleting(false)
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
                <span className="text-sm text-white/70">Coins</span>
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
              Cada mensagem custa 🪙 15
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
                <div className="flex items-center gap-2">
                  <div className="text-xs rounded-full bg-white/10 border border-white/10 overflow-hidden">
                    <button
                      className={`px-3 py-1 ${sessionFilter === 'active' ? 'bg-white/20' : ''}`}
                      onClick={() => setSessionFilter('active')}
                    >Ativas</button>
                    <button
                      className={`px-3 py-1 ${sessionFilter === 'archived' ? 'bg-white/20' : ''}`}
                      onClick={() => setSessionFilter('archived')}
                    >Arquivadas</button>
                    <button
                      className={`px-3 py-1 ${sessionFilter === 'completed' ? 'bg-white/20' : ''}`}
                      onClick={() => setSessionFilter('completed')}
                    >Concluídas</button>
                  </div>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={handleNewSession}
                  >
                    <Plus className="w-4 h-4" />
                  </GlassButton>
                </div>
              </div>
            </GlassCardHeader>
            <div className="overflow-y-auto max-h-96 space-y-2 px-4 pb-4">
              {uniqueSessions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-white/30 mx-auto mb-2" />
                  <p className="text-sm text-white/50">Nenhuma conversa ainda</p>
                </div>
              ) : (
                uniqueSessions.map((session: Session) => (
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
                        <h4 className="text-sm font-medium text-white truncate flex items-center gap-2">
                          <span className="truncate">{session.title}</span>
                          {session.status === 'archived' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white/70 shrink-0">Arquivada</span>
                          )}
                          {session.status === 'completed' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-green-400/30 bg-green-400/10 text-green-300 shrink-0">Concluída</span>
                          )}
                        </h4>
                        <p className="text-xs text-white/50 mt-1">
                          {format(new Date(session.updatedAt), 'dd/MM HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleOpenDelete(session, e)}
                          title="Excluir conversa"
                        >
                          <Trash2 className="w-3 h-3" />
                        </GlassButton>
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            const next = session.status === 'archived' ? 'active' : 'archived'
                            setSessionStatus(session.id, next).then((res) => {
                              if (res) {
                                toast.success(next === 'archived' ? 'Conversa arquivada' : 'Conversa restaurada')
                              } else {
                                toast.error('Falha ao atualizar conversa')
                              }
                            })
                          }}
                          title={session.status === 'archived' ? 'Restaurar' : 'Arquivar'}
                        >
                          {session.status === 'archived' ? (
                            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v4H3z"/><path d="M19 7v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7"/><path d="M9 15l3-3 3 3"/></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v4H3z"/><path d="M19 7v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7"/><path d="M9 12l3 3 3-3"/></svg>
                          )}
                        </GlassButton>
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            const next = session.status === 'completed' ? 'active' : 'completed'
                            setSessionStatus(session.id, next).then((res) => {
                              if (res) {
                                toast.success(next === 'completed' ? 'Conversa marcada como concluída' : 'Conversa reaberta')
                              } else {
                                toast.error('Falha ao atualizar conversa')
                              }
                            })
                          }}
                          title={session.status === 'completed' ? 'Reabrir' : 'Marcar como concluída'}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </GlassButton>
                      </div>
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
                  {currentSession && currentSession.status !== 'active' && (
                    <div className="mt-1">
                      {currentSession.status === 'archived' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white/70">Conversa arquivada</span>
                      )}
                      {currentSession.status === 'completed' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-green-400/30 bg-green-400/10 text-green-300">Conversa concluída</span>
                      )}
                    </div>
                  )}
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

                        {message.role === 'assistant' && (
                          <AgentActionsBar message={message.content} />
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
              <span>Custo: 🪙 15 por mensagem</span>
            </div>
          </GlassCard>
      </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conversa?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.count === null
                ? 'Carregando informações da conversa...'
                : `Esta ação excluirá permanentemente ${deleteDialog.count} mensagem(ns) da conversa “${deleteDialog.title}”.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Excluir' }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarLayout>
  )
}
  const [sessionFilter, setSessionFilter] = useState<'active' | 'archived'>('active')
