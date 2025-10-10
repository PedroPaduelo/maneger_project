"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CheckCircle2, Play, AlertCircle, ListChecks } from 'lucide-react'

type SupportedActionType = 'create_project' | 'create_tasks'

type ProposedAction =
  | { type: 'create_project'; payload: any; metadata?: any }
  | { type: 'create_tasks'; payload: any; metadata?: any }

interface ProposedPlan {
  version: number
  summary?: string
  notes?: string[]
  actions: ProposedAction[]
}

interface AgentActionsBarProps {
  message: string
}

export function AgentActionsBar({ message }: AgentActionsBarProps) {
  const [executing, setExecuting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [createdProjectId, setCreatedProjectId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const plan = useMemo<ProposedPlan | null>(() => {
    const start = message.indexOf('<!--AGENT_ACTIONS_START-->')
    const end = message.indexOf('<!--AGENT_ACTIONS_END-->')
    if (start === -1 || end === -1) return null
    try {
      const raw = message.substring(start + '<!--AGENT_ACTIONS_START-->'.length, end)
      const data = JSON.parse(raw)
      if (!data || !Array.isArray(data.actions)) return null
      return data as ProposedPlan
    } catch (e) {
      return null
    }
  }, [message])

  useEffect(() => {
    if (!plan) {
      setExecuting(false)
      setProgress(0)
      setStatus(null)
      setDone(false)
      setError(null)
    }
  }, [plan])

  if (!plan) return null

  const totalSteps = plan.actions.filter((a) => isSupportedAction(a.type)).length

  const handleExecute = async () => {
    if (!plan) return
    if (totalSteps === 0) {
      toast.info('Nenhuma ação executável disponível neste plano.')
      return
    }
    setExecuting(true)
    setError(null)
    setStatus('Iniciando execução do plano...')
    let currentStep = 0
    let createdProjectId: number | null = null

    try {
      for (const action of plan.actions) {
        if (!isSupportedAction(action.type)) {
          console.warn('[AgentActions] Ação ignorada (não suportada):', action.type)
          continue
        }

        currentStep += 1
        setStatus(`Executando etapa ${currentStep}/${totalSteps}: ${labelFromAction(action)}`)
        setProgress(Math.round(((currentStep - 1) / totalSteps) * 100))

        if (action.type === 'create_project') {
          const res = await fetch('/api/architect/create-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.payload)
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Falha ao criar projeto')
          createdProjectId = data.project?.id
          setCreatedProjectId(createdProjectId || null)
          toast.success(`Projeto criado: ${data.project?.name || createdProjectId}`)
        } else if (action.type === 'create_tasks') {
          const targetProjectId = action.payload?.projectId || createdProjectId
          if (!targetProjectId) throw new Error('Projeto alvo não definido para criação de tasks')
          const res = await fetch('/api/architect/create-tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: targetProjectId, tasks: action.payload.tasks || [] })
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Falha ao criar tasks')
          toast.success(`${data.tasks?.length || 0} tasks criadas`)
        }
      }

      setProgress(100)
      setStatus('Plano executado com sucesso')
      setDone(true)
      toast.success('Plano executado com sucesso!')
    } catch (e: any) {
      setError(e?.message || 'Falha ao executar plano')
      toast.error(e?.message || 'Falha ao executar plano')
    } finally {
      setExecuting(false)
    }
  }

  return (
    <Card className="mt-3 border-blue-400/30 bg-blue-400/5 p-3">
      <div className="flex items-start gap-3">
        <ListChecks className="h-5 w-5 text-blue-400 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Plano de ações sugerido</div>
            <Badge variant="outline">{plan.actions.length} etapas</Badge>
          </div>
          {!done ? (
            <div className="mt-2 text-xs text-muted-foreground">
              O agente propõe executar as etapas abaixo. Você pode confirmar para que eu execute agora.
            </div>
          ) : (
            <div className="mt-2 text-xs text-green-600">
              Plano executado com sucesso.
              {createdProjectId && (
                <>
                  {' '}Projeto criado: <a className="underline" href={`/projects/${createdProjectId}`}>#{createdProjectId}</a>
                </>
              )}
            </div>
          )}

          {plan.summary && (
            <div className="mt-3 text-xs text-muted-foreground">
              <strong>Resumo:</strong> {plan.summary}
            </div>
          )}

          {plan.notes && plan.notes.length > 0 && (
            <div className="mt-2 space-y-1">
              {plan.notes.map((note, idx) => (
                <div key={idx} className="text-xs text-muted-foreground">
                  • {note}
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 grid gap-2">
            {plan.actions.map((a, idx) => (
              <div key={idx} className="text-sm">
                <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                <span>{labelFromAction(a)}</span>
              </div>
            ))}
          </div>

          {executing && (
            <div className="mt-3">
              <Progress value={progress} />
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                {error ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span>{error}</span>
                  </>
                ) : status ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    <span>{status}</span>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {!done && (
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" onClick={handleExecute} disabled={executing}>
                <Play className="h-4 w-4 mr-2" /> Executar plano
              </Button>
              {/* Futuro: botão de editar plano */}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function labelFromAction(a: ProposedAction): string {
  if (a.type === 'create_project') {
    return `Criar projeto “${a.payload?.name}” com ${a.payload?.requirements?.length || 0} requisito(s)`
  }
  if (a.type === 'create_tasks') {
    const targetSuffix = a.payload?.projectId ? ` no projeto #${a.payload.projectId}` : ''
    return `Criar ${a.payload?.tasks?.length || 0} task(s)${targetSuffix}`
  }
  return 'Ação'
}

function isSupportedAction(type: string): type is SupportedActionType {
  return type === 'create_project' || type === 'create_tasks'
}
