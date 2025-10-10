import * as React from "react"
import { motion } from "framer-motion"
import { GlassCard, GlassCardHeader, GlassCardContent } from "./glass-card"
import { GlassButton } from "./glass-button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Settings,
  Zap,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Tag,
  MoreHorizontal,
  Shield,
  Database,
  Smartphone,
  Globe
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RequirementCardProps {
  requirement: {
    id: number
    title: string
    description: string
    type: string
    category?: string
    priority: string
    createdAt: string
    tasks?: Array<{
      id: number
      title: string
      status: string
    }>
  }
  onEdit?: (requirement: any) => void
  onDelete?: (requirementId: number) => void
  onAddTask?: (requirementId: number) => void
  showActions?: boolean
  compact?: boolean
}

export function RequirementCard({
  requirement,
  onEdit,
  onDelete,
  onAddTask,
  showActions = true,
  compact = false
}: RequirementCardProps) {
  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'funcional':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50'
      case 'não funcional':
      case 'nao funcional':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50'
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

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'segurança':
        return <Shield className="w-4 h-4" />
      case 'performance':
        return <Zap className="w-4 h-4" />
      case 'usabilidade':
      case 'ux':
        return <Users className="w-4 h-4" />
      case 'banco de dados':
      case 'database':
        return <Database className="w-4 h-4" />
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      case 'web':
        return <Globe className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getTaskStats = () => {
    const totalTasks = requirement.tasks?.length || 0
    const completedTasks = requirement.tasks?.filter(task =>
      task.status.toLowerCase() === 'concluída' || task.status.toLowerCase() === 'completed'
    ).length || 0
    const inProgressTasks = requirement.tasks?.filter(task =>
      task.status.toLowerCase() === 'em progresso' || task.status.toLowerCase() === 'in progress'
    ).length || 0

    return { totalTasks, completedTasks, inProgressTasks }
  }

  const { totalTasks, completedTasks, inProgressTasks } = getTaskStats()

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
                {getCategoryIcon(requirement.category)}
                <h3 className="font-medium text-white truncate">{requirement.title}</h3>
              </div>
              <p className="text-sm text-white/60 line-clamp-2 mb-3">
                {requirement.description}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs ${getTypeColor(requirement.type)}`}>
                  {requirement.type}
                </Badge>
                <Badge className={`text-xs ${getPriorityColor(requirement.priority)}`}>
                  {getPriorityLabel(requirement.priority)}
                </Badge>
                {totalTasks > 0 && (
                  <span className="text-xs text-white/40">
                    {completedTasks}/{totalTasks} tasks
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
                {getCategoryIcon(requirement.category)}
                <h3 className="font-semibold text-white truncate">{requirement.title}</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs ${getTypeColor(requirement.type)}`}>
                  {requirement.type}
                </Badge>
                <Badge className={`text-xs ${getPriorityColor(requirement.priority)}`}>
                  {getPriorityLabel(requirement.priority)}
                </Badge>
                {requirement.category && (
                  <Badge variant="outline" className="text-xs">
                    {requirement.category}
                  </Badge>
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
        </GlassCardHeader>

        <GlassCardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-white/50" />
              <span className="text-sm font-medium text-white/70">Descrição</span>
            </div>
            <p className="text-sm text-white/60 line-clamp-3">
              {requirement.description}
            </p>
          </div>

          {totalTasks > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-white/50" />
                  <span className="text-sm font-medium text-white/70">
                    Tasks Associadas
                  </span>
                </div>
                <span className="text-sm text-white/50">
                  {completedTasks}/{totalTasks} concluídas
                </span>
              </div>

              <div className="space-y-2 max-h-32 overflow-y-auto">
                {requirement.tasks?.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center gap-2 text-xs">
                    <div className={`
                      w-2 h-2 rounded-full
                      ${task.status.toLowerCase() === 'concluída' ? 'bg-green-500' :
                        task.status.toLowerCase() === 'em progresso' ? 'bg-blue-500' : 'bg-gray-500'}
                    `} />
                    <span className="text-white/60 truncate">{task.title}</span>
                  </div>
                ))}
                {totalTasks > 3 && (
                  <div className="text-xs text-white/40 text-center">
                    +{totalTasks - 3} outras tasks...
                  </div>
                )}
              </div>

              {totalTasks > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Calendar className="w-3 h-3" />
              {format(new Date(requirement.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>

            {showActions && (
              <div className="flex items-center gap-2">
                {onAddTask && (
                  <GlassButton
                    variant="outline"
                    size="sm"
                    onClick={() => onAddTask(requirement.id)}
                  >
                    <Target className="w-3 h-3 mr-1" />
                    Add Task
                  </GlassButton>
                )}
                {onEdit && (
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(requirement)}
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

export default RequirementCard