"use client"

import { useSocket } from "@/hooks/use-socket"
import { useToast } from "@/hooks/use-toast"

interface RealTimeUpdaterProps {
  onDataUpdate?: (data: any) => void
}

export function RealTimeUpdater({ onDataUpdate }: RealTimeUpdaterProps) {
  const { toast } = useToast()

  const handleSocketMessage = (data: any) => {
    // Handle different types of real-time updates
    switch (data.type) {
      case "project-created":
        toast({
          title: "Novo Projeto",
          description: `O projeto "${data.project.name}" foi criado.`,
        })
        break
      case "project-updated":
        toast({
          title: "Projeto Atualizado",
          description: `O projeto "${data.project.name}" foi atualizado.`,
        })
        break
      case "project-deleted":
        toast({
          title: "Projeto Excluído",
          description: `O projeto "${data.projectName}" foi excluído.`,
          variant: "destructive",
        })
        break
      case "task-created":
        toast({
          title: "Nova Tarefa",
          description: `A tarefa "${data.task.title}" foi criada.`,
        })
        break
      case "task-updated":
        toast({
          title: "Tarefa Atualizada",
          description: `A tarefa "${data.task.title}" foi atualizada.`,
        })
        break
      case "requirement-created":
        toast({
          title: "Novo Requisito",
          description: `O requisito "${data.requirement.title}" foi criado.`,
        })
        break
      case "requirement-updated":
        toast({
          title: "Requisito Atualizado",
          description: `O requisito "${data.requirement.title}" foi atualizado.`,
        })
        break
      default:
        // Generic notification
        if (data.message) {
          toast({
            title: "Atualização",
            description: data.message,
          })
        }
    }

    // Notify parent component of data update
    onDataUpdate?.(data)
  }

  useSocket(process.env.NODE_ENV === "production" ? "" : "http://localhost:3000", handleSocketMessage)

  return null // This component doesn't render anything
}