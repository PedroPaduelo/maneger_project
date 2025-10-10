"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useArchitectConfig } from '@/hooks/useArchitectConfig'
import { GlassCard, GlassCardHeader, GlassCardContent, GlassCardFooter } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassInput } from '@/components/ui/glass-input'
import { GlassTextarea } from '@/components/ui/glass-textarea'
import { SidebarLayout } from '@/components/sidebar-layout'
import {
  Settings,
  Bot,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Code,
  Zap,
  Target,
  Users
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface ArchitectConfig {
  id: number
  name: string
  prompt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const PRESET_PROMPTS = [
  {
    name: 'Arquiteto Padrão',
    prompt: `Você é um arquiteto de software experiente e especialista em gerenciamento de projetos. Sua missão é ajudar os usuários a criar e estruturar projetos de software completos, desde requisitos iniciais até tasks detalhadas.

Seu papel:
1. Analisar as ideias e requisitos do usuário
2. Sugerir melhorias e identificar possíveis problemas
3. Criar requisitos funcionais e não funcionais detalhados
4. Dividir o projeto em tasks executáveis e bem definidas
5. Estimar prioridades e dependências entre as tasks
6. Garantir que todas as tasks sejam SMART (Específicas, Mensuráveis, Atingíveis, Relevantes, Temporais)

Sempre estruture suas respostas de forma clara e organizada, começando com uma análise da ideia do usuário e então propondo a estrutura do projeto com requisitos e tasks.

Use uma linguagem profissional mas acessível, adaptando-se ao nível técnico do usuário.`
  },
  {
    name: 'Especialista em Startups',
    prompt: `Você é um arquiteto de software especializado em produtos para startups, com foco em MVP (Minimum Viable Product) e crescimento escalável. Sua abordagem prioriza rapidez, validação de mercado e iteracões ágeis.

Sua especialidade:
1. Identificar o core features para um MVP válido
2. Sugerir arquiteturas que permitam evolução rápida
3. Priorizar features por impacto vs esforço
4. Considerar modelos de negócio e monetização
5. Focar em用户体验 e métricas de crescimento
6. Sugerir estratégias de validação de mercado

Sempre comece com "Vamos pensar como uma startup!" e estruture suas respostas em:
- Hipótese central
- MVP sugerido
- Métricas de sucesso
- Roadmap inicial
- Riscos e mitigações

Seja prático, direto e focado em resultados rápidos.`
  },
  {
    name: 'Arquiteto Enterprise',
    prompt: `Você é um arquiteto de software enterprise com 15+ anos de experiência em sistemas corporativos de grande escala. Sua especialidade é criar soluções robustas, seguras e escaláveis para grandes organizações.

Seu foco principal:
1. Segurança e conformidade (LGPD, SOX, etc)
2. Performance e escalabilidade horizontal
3. Alta disponibilidade e disaster recovery
4. Integrações com sistemas legados
5. Governança de TI e best practices
6. Documentação técnica completa

Sempre inclua nas suas análises:
- Requisitos não funcionais (performance, segurança, etc)
- Arquitetura sugerida com diagramas textuais
- Stack tecnológica justificada
- Riscos e mitigações
- Timeline estimada em fases
- Requisitos de infraestrutura

Use linguagem técnica precisa e aborde preocupações típicas de ambientes corporativos.`
  },
  {
    name: 'Especialista em E-commerce',
    prompt: `Você é um arquiteto especializado em plataformas de e-commerce com profundo conhecimento em marketplaces digitais, gestão de produtos, e experiência de compra online.

Suas especialidades:
1. Catálogo de produtos e variações
2. Gestão de estoque e fulfillment
3. Integrações com gateways de pagamento
4. Sistemas de frete e logística
5. Personalização e recomendação de produtos
6. Análise de conversão e funil de vendas

Sempre considere:
- Performance durante picos de vendas
- SEO e experiência mobile
- Integrações com ERPs e sistemas legados
- Estratégias de cross-selling e up-selling
- Análise de concorrência
- Métricas de e-commerce

Foque em criar experiências de compra fluidas que maximizem a conversão.`
  }
]

export default function ArchitectSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [editingConfig, setEditingConfig] = useState<ArchitectConfig | null>(null)
  const [newConfigName, setNewConfigName] = useState('')
  const [newConfigPrompt, setNewConfigPrompt] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const {
    configs,
    activeConfig,
    isLoading,
    error,
    createConfig,
    updateConfig,
    deleteConfig,
    setActive
  } = useArchitectConfig()

  if (status === 'loading') {
    return (
      <SidebarLayout title="Configurações do Arquiteto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50"></div>
        </div>
      </SidebarLayout>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const handleCreateConfig = async () => {
    if (!newConfigName.trim() || !newConfigPrompt.trim()) return

    const success = await createConfig(newConfigName.trim(), newConfigPrompt.trim())
    if (success) {
      setNewConfigName('')
      setNewConfigPrompt('')
      setShowCreateForm(false)
    }
  }

  const handleUpdateConfig = async () => {
    if (!editingConfig) return

    const success = await updateConfig(editingConfig.id, {
      name: editingConfig.name,
      prompt: editingConfig.prompt
    })

    if (success) {
      setEditingConfig(null)
    }
  }

  const handleDeleteConfig = async (configId: number) => {
    if (configs.length <= 1) {
      alert('Você precisa ter pelo menos uma configuração.')
      return
    }

    if (confirm('Tem certeza que deseja excluir esta configuração?')) {
      await deleteConfig(configId)
    }
  }

  const handleSetActive = async (configId: number) => {
    await setActive(configId)
  }

  const usePresetPrompt = (preset: typeof PRESET_PROMPTS[0]) => {
    if (showCreateForm) {
      setNewConfigName(preset.name)
      setNewConfigPrompt(preset.prompt)
    } else if (editingConfig) {
      setEditingConfig({
        ...editingConfig,
        name: preset.name,
        prompt: preset.prompt
      })
    }
  }

  return (
    <SidebarLayout
      title="Configurações do Arquiteto"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Configurações do Arquiteto' }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Configurações do Arquiteto</h1>
            <p className="text-white/70 mt-2">
              Personalize o comportamento do seu assistente de arquitetura de software
            </p>
          </div>
          <GlassButton
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Configuração
          </GlassButton>
        </div>

        {/* Error Message */}
        {error && (
          <GlassCard className="border-red-500/20 bg-red-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </GlassCard>
        )}

        {/* Create New Config Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard>
              <GlassCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-white" />
                    <h2 className="text-xl font-semibold text-white">
                      Criar Nova Configuração
                    </h2>
                  </div>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </GlassButton>
                </div>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nome da Configuração
                  </label>
                  <GlassInput
                    value={newConfigName}
                    onChange={(e) => setNewConfigName(e.target.value)}
                    placeholder="Ex: Arquiteto Especialista em Finanças"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Prompt do Sistema
                  </label>
                  <div className="space-y-3">
                    <GlassTextarea
                      value={newConfigPrompt}
                      onChange={(e) => setNewConfigPrompt(e.target.value)}
                      placeholder="Descreva o comportamento, especialidade e estilo do arquiteto..."
                      rows={8}
                    />

                    {/* Preset Suggestions */}
                    <div>
                      <p className="text-sm text-white/50 mb-2">Comece com um template:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {PRESET_PROMPTS.map((preset, index) => (
                          <GlassButton
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => usePresetPrompt(preset)}
                            className="text-left justify-start"
                          >
                            {preset.name}
                          </GlassButton>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCardContent>
              <GlassCardFooter className="flex justify-between">
                <GlassButton
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancelar
                </GlassButton>
                <GlassButton
                  onClick={handleCreateConfig}
                  disabled={!newConfigName.trim() || !newConfigPrompt.trim() || isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Criar Configuração
                </GlassButton>
              </GlassCardFooter>
            </GlassCard>
          </motion.div>
        )}

        {/* Configs List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {configs.map((config: ArchitectConfig, index: number) => (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className={`
                relative overflow-hidden
                ${config.isActive ? 'border-blue-500/30 ring-2 ring-blue-500/20' : ''}
              `}>
                {config.isActive && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-500/20 to-transparent px-3 py-1">
                    <span className="text-xs text-blue-300 font-medium">Ativo</span>
                  </div>
                )}

                <GlassCardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        {editingConfig?.id === config.id ? (
                          <GlassInput
                            value={editingConfig.name}
                            onChange={(e) => setEditingConfig({
                              ...editingConfig,
                              name: e.target.value
                            })}
                            className="text-lg font-semibold"
                          />
                        ) : (
                          <h3 className="text-lg font-semibold text-white">
                            {config.name}
                          </h3>
                        )}
                        <p className="text-sm text-white/50">
                          Criado em {new Date(config.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassCardHeader>

                <GlassCardContent className="space-y-4">
                  {editingConfig?.id === config.id ? (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-white">Prompt do Sistema</label>
                      <GlassTextarea
                        value={editingConfig.prompt}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig,
                          prompt: e.target.value
                        })}
                        rows={6}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Prompt do Sistema</label>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-sm text-white/70 line-clamp-4">
                          {config.prompt}
                        </p>
                        {config.prompt.length > 300 && (
                          <p className="text-xs text-white/30 mt-2">
                            ...({config.prompt.length - 300} caracteres adicionais)
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </GlassCardContent>

                <GlassCardFooter className="flex justify-between">
                  <div className="flex items-center gap-2">
                    {!config.isActive && (
                      <GlassButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActive(config.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Ativar
                      </GlassButton>
                    )}

                    {editingConfig?.id === config.id ? (
                      <>
                        <GlassButton
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingConfig(null)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          onClick={handleUpdateConfig}
                          disabled={!editingConfig.name.trim() || !editingConfig.prompt.trim() || isLoading}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Salvar
                        </GlassButton>
                      </>
                    ) : (
                      <>
                        <GlassButton
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingConfig(config)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </GlassButton>
                        <GlassButton
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteConfig(config.id)}
                          disabled={configs.length <= 1}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </GlassButton>
                      </>
                    )}
                  </div>
                </GlassCardFooter>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Tips Section */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <h2 className="text-xl font-semibold text-white">Dicas para Configurações</h2>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <h3 className="font-medium text-white">Seja Específico</h3>
                </div>
                <p className="text-sm text-white/60">
                  Defina claramente a especialidade do arquiteto (ex: e-commerce, fintech, saúde)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-green-400" />
                  <h3 className="font-medium text-white">Defina o Estilo</h3>
                </div>
                <p className="text-sm text-white/60">
                  Escolha o tom de comunicação (formal, casual, técnico, etc)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <h3 className="font-medium text-white">Estrutura de Resposta</h3>
                </div>
                <p className="text-sm text-white/60">
                  Indique como você quer que as respostas sejam organizadas
                </p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </SidebarLayout>
  )
}