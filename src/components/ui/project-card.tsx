"use client"

import { motion } from 'framer-motion'
import { GlassCard, GlassCardHeader, GlassCardContent } from './glass-card'
import { GlassButton } from './glass-button'
import {
  Folder,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  ArrowRight,
  Tag,
  Users
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

interface ProjectCardProps {
  project: {
    id: number
    name: string
    description: string
    stack: string
    status: string
    priority: string
    progress: number
    createdAt: string
    tags?: string
  }
  requirementsCount?: number
  tasksCount?: number
  createdByAI?: boolean
}

export function ProjectCard({
  project,
  requirementsCount = 0,
  tasksCount = 0,
  createdByAI = false
}: ProjectCardProps) {
  const router = useRouter()

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'crítica':
      case 'alta':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'média':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'baixa':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      default:
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
      case 'em andamento':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'pausado':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'concluído':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const handleViewProject = () => {
    router.push(`/projects/${project.id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <GlassCard className={`relative overflow-hidden ${createdByAI ? 'border-blue-400/30 bg-blue-400/5' : ''}`}>
        {createdByAI && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
            <span className="text-xs text-blue-300 font-medium">✨ Criado por IA</span>
          </div>
        )}

        <GlassCardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Folder className="w-4 h-4 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">{project.name}</h3>
              </div>

              <p className="text-sm text-white/60 line-clamp-2 mb-3">
                {project.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
            </div>
          </div>
        </GlassCardHeader>

        <GlassCardContent className="space-y-4">
          {/* Stack */}
          <div className="flex items-center gap-2">
            <Tag className="w-3 h-3 text-white/50" />
            <span className="text-xs text-white/50">Stack:</span>
            <div className="flex flex-wrap gap-1">
              {project.stack.split(',').slice(0, 3).map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-xs bg-white/10 border border-white/20 rounded text-white/70"
                >
                  {tech.trim()}
                </span>
              ))}
              {project.stack.split(',').length > 3 && (
                <span className="px-2 py-0.5 text-xs bg-white/10 border border-white/20 rounded text-white/50">
                  +{project.stack.split(',').length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50">Progresso</span>
              <span className="text-white/70">{project.progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                <Target className="w-3 h-3" />
                <span className="text-sm font-medium">{requirementsCount}</span>
              </div>
              <span className="text-xs text-white/50">Requisitos</span>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-sm font-medium">{tasksCount}</span>
              </div>
              <span className="text-xs text-white/50">Tasks</span>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                <Calendar className="w-3 h-3" />
                <span className="text-sm font-medium">
                  {format(new Date(project.createdAt), 'dd/MM', { locale: ptBR })}
                </span>
              </div>
              <span className="text-xs text-white/50">Criado em</span>
            </div>
          </div>

          {/* Action Button */}
          <GlassButton
            onClick={handleViewProject}
            className="w-full justify-center gap-2"
            size="sm"
          >
            Ver Projeto
            <ArrowRight className="w-4 h-4" />
          </GlassButton>
        </GlassCardContent>
      </GlassCard>
    </motion.div>
  )
}