import * as React from "react"
import { motion } from "framer-motion"
import { GlassCard, GlassCardHeader, GlassCardContent } from "./glass-card"
import { GlassButton } from "./glass-button"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Play,
  Calendar,
  Tag,
  Zap,
  MoreHorizontal,
  Target,
  Code,
  FileText,
  Star
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TaskCardProps {
  task: {
    id: number
    title: string
    description?: string
    status: string
    priority: string
    createdAt: string
    guidancePrompt?: string
    additionalInformation?: string
    todos?: Array<{
      id: number
      description: string
      isCompleted: boolean
      sequence: number
    }>
  }
  onEdit?: (task: any) => void
  onDelete?: (taskId: number) => void
  onStartTask?: (taskId: number) => void
  onCompleteTask?: (taskId: number) => void
  showActions?: boolean
  compact?: boolean
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStartTask,
  onCompleteTask,
  showActions = true,
  compact = false
}: TaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      case 'em progresso':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50'
      case 'concluída':
        return 'bg-green-500/20 text-green-300 border-green-500/50'
      case 'bloqueada':
        return 'bg-red-500/20 text-red-300 border-red-500/50'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'crítica':
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/50'
      case 'média':
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      case 'baixa':
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/50'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'crítica':
        return 'Crítica'
      case 'média':
        return 'Média'
      case 'baixa':
        return 'Baixa'
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Média'
      case 'low':
        return 'Baixa'
      default:
        return priority
    }
  }

  const completedTodos = task.todos?.filter(todo => todo.isCompleted).length || 0
  const totalTodos = task.todos?.length || 0
  const progress = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="cursor-pointer"
      >
        <GlassCard className="p-4 hover:border-white/30 transition-all duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-white truncate">{task.title}</h3>
                <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                  {task.status}
                </Badge>
              </div>
              {task.description && (
                <p className="text-sm text-white/60 line-clamp-2 mb-3">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(task.createdAt), "dd/MM", { locale: ptBR })}
                </span>
                <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                  {getPriorityLabel(task.priority)}
                </Badge>
                {totalTodos > 0 && (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {completedTodos}/{totalTodos}
                  </span>
                )}
              </div>
            </div>
            {showActions && (
              <div className="flex items-center gap-1">
                <GlassButton variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </GlassButton>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <GlassCard className="overflow-hidden hover:border-white/30 transition-all duration-300">
        <GlassCardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <h3 className="font-semibold text-white truncate">{task.title}</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                  <div className="flex items-center gap-1">
                    {task.status.toLowerCase() === 'pendente' && <Clock className="w-3 h-3" />}
                    {task.status.toLowerCase() === 'em progresso' && <Play className="w-3 h-3" />}
                    {task.status.toLowerCase() === 'concluída' && <CheckCircle className="w-3 h-3" />}
                    {task.status.toLowerCase() === 'bloqueada' && <AlertCircle className="w-3 h-3" />}
                    {task.status}
                  </div>
                </Badge>
                <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                  {getPriorityLabel(task.priority)}
                </Badge>
              </div>
            </div>
            {showActions && (
              <div className="flex items-center gap-1">
                <GlassButton variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </GlassButton>
              </div>
            )}
          </div>
        </GlassCardHeader>

        <GlassCardContent className="space-y-4">
          {task.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-white/50" />
                <span className="text-sm font-medium text-white/70">Descrição</span>
              </div>
              <p className="text-sm text-white/60 line-clamp-3">
                {task.description}
              </p>
            </div>
          )}

          {task.guidancePrompt && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-white/50" />
                <span className="text-sm font-medium text-white/70">Instruções Técnicas</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-sm text-white/60 line-clamp-2 font-mono">
                  {task.guidancePrompt}
                </p>
              </div>
            </div>
          )}

          {task.additionalInformation && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-white/50" />
                <span className="text-sm font-medium text-white/70">Informações Adicionais</span>
              </div>
              <p className="text-sm text-white/60 line-clamp-2">
                {task.additionalInformation}
              </p>
            </div>
          )}

          {totalTodos > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-white/50" />
                  <span className="text-sm font-medium text-white/70">
                    Progresso: {completedTodos}/{totalTodos}
                  </span>
                </div>
                <span className="text-sm text-white/50">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Calendar className="w-3 h-3" />
              {format(new Date(task.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>

            {showActions && (
              <div className="flex items-center gap-2">
                {task.status.toLowerCase() === 'pendente' && onStartTask && (
                  <GlassButton
                    variant="outline"
                    size="sm"
                    onClick={() => onStartTask(task.id)}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Iniciar
                  </GlassButton>
                )}
                {task.status.toLowerCase() === 'em progresso' && onCompleteTask && (
                  <GlassButton
                    variant="outline"
                    size="sm"
                    onClick={() => onCompleteTask(task.id)}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Concluir
                  </GlassButton>
                )}
                {onEdit && (
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(task)}
                  >
                    Editar
                  </GlassButton>
                )}
              </div>
            )}
          </div>
        </GlassCardContent>
      </GlassCard>
    </motion.div>
  )
}

export default TaskCard