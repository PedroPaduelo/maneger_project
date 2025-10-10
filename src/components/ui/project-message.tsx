"use client"

import { useEffect, useState } from 'react'
import { ProjectCard } from './project-card'
import { motion } from 'framer-motion'

interface Project {
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

interface ProjectMessageProps {
  message: string
  sessionId?: number
}

export function ProjectMessage({ message, sessionId }: ProjectMessageProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Verificar se a mensagem contém indicação de projeto criado
    if (message.includes('✅ **Projeto criado com sucesso!**') ||
        message.includes('🆔 **ID:**')) {

      // Extrair ID do projeto da mensagem
      const idMatch = message.match(/🆔 \*\*ID:\*\* (\d+)/);
      if (idMatch) {
        loadProjectDetails(parseInt(idMatch[1]));
      }
    }
  }, [message]);

  const loadProjectDetails = async (projectId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const projectData = await response.json();
        // Calcular estatísticas para o card
        const requirementsCount = projectData.requirements?.length || 0;
        const tasksCount = projectData.tasks?.length || 0;

        setProjects([{
          ...projectData,
          requirementsCount,
          tasksCount
        }]);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do projeto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center py-4"
      >
        <div className="text-white/50 text-sm">Carregando detalhes do projeto...</div>
      </motion.div>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4 space-y-4"
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          requirementsCount={3} // Você pode buscar esses valores reais
          tasksCount={5}
          createdByAI={true}
        />
      ))}
    </motion.div>
  );
}