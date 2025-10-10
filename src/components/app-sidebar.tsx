"use client"

import * as React from "react"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  FileText,
  Settings,
  Tags,
  Bell,
  Users,
  Search,
  Clock,
  TrendingUp,
  Star,
  User,
  LogOut,
  Moon,
  Sun,
  BarChart3,
  Activity,
  Plus,
  Filter,
  RefreshCw,
  Grid3X3,
  Table,
  Bot,
  Sparkles
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  // Dados de navegação baseados nas abas antigas
  const navigationData = [
    {
      title: "Dashboard",
      items: [
        {
          title: "Visão Geral",
          url: "/overview",
          icon: LayoutDashboard,
          description: "Estatísticas e resumo",
          isActive: pathname === "/overview"
        },
        {
          title: "Atividades",
          url: "/activities",
          icon: Clock,
          description: "Histórico recente",
          isActive: pathname === "/activities"
        },
        {
          title: "Performance",
          url: "/performance",
          icon: TrendingUp,
          description: "Métricas e analytics",
          isActive: pathname === "/performance"
        },
      ]
    },
    {
      title: "Projetos",
      items: [
        {
          title: "Todos os Projetos",
          url: "/projects",
          icon: FolderKanban,
          description: "Gerenciar projetos",
          isActive: pathname === "/projects",
          badge: session?.user?.projects?.length || 0
        },
        {
          title: "Tarefas",
          url: "/tasks",
          icon: CheckSquare,
          description: "Lista de tarefas",
          isActive: pathname === "/tasks"
        },
        {
          title: "Requisitos",
          url: "/requirements",
          icon: FileText,
          description: "Especificações",
          isActive: pathname === "/requirements"
        },
      ]
    },
    {
      title: "Arquiteto IA",
      items: [
        {
          title: "Chat com Arquiteto",
          url: "/architect-chat",
          icon: Bot,
          description: "Assistente de projetos",
          isActive: pathname === "/architect-chat"
        },
        {
          title: "Configurações",
          url: "/architect-settings",
          icon: Settings,
          description: "Personalizar assistente",
          isActive: pathname === "/architect-settings"
        },
      ]
    },
    {
      title: "Ferramentas",
      items: [
        {
          title: "Tags",
          url: "/tags",
          icon: Tags,
          description: "Categorização",
          isActive: pathname === "/tags"
        },
        {
          title: "Notificações",
          url: "/notifications",
          icon: Bell,
          description: "Alertas e avisos",
          isActive: pathname === "/notifications",
          badge: 3
        },
        {
          title: "Analytics",
          url: "/analytics",
          icon: BarChart3,
          description: "Análise de dados",
          isActive: pathname === "/analytics"
        },
      ]
    }
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  const handleRefresh = () => {
    router.refresh()
    toast.success("Atualizado", {
      description: "Os dados foram atualizados com sucesso."
    })
  }

  return (
    <Sidebar {...props} variant="inset">
      <SidebarHeader className="bg-gradient-to-b from-sidebar-accent/50 to-transparent">
        {/* Logo */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Activity className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">DevManager</span>
                <span className="text-xs text-muted-foreground">Workspace</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Busca */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 opacity-50" />
            <Input
              placeholder="Buscar projetos..."
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="px-3 py-2">
          <div className="grid grid-cols-2 gap-1">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => router.push('/projects')}>
              <Plus className="h-3 w-3 mr-1" />
              Projeto
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleRefresh}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Atualizar
            </Button>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigationData.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      tooltip={{
                        children: (
                          <div className="flex flex-col gap-1">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                        )
                      }}
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span className="font-medium">{item.title}</span>
                        {item.badge && (
                          <SidebarMenuBadge className="ml-auto">
                            <Badge variant="secondary" className="h-5 text-xs">
                              {item.badge}
                            </Badge>
                          </SidebarMenuBadge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarSeparator />

        {/* Status do Sistema */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Activity className="size-4" />
                  <span className="flex-1">Status</span>
                  <Badge variant="default" className="h-5 text-xs">
                    Online
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Clock className="size-4" />
                  <span className="flex-1">Última atualização</span>
                  <span className="text-xs text-muted-foreground">
                    agora
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer com perfil do usuário */}
      <SidebarFooter className="border-t bg-sidebar-accent/30">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                    <AvatarFallback className="rounded-lg">
                      {session?.user?.firstName?.charAt(0)}
                      {session?.user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none text-left">
                    <p className="font-medium">
                      {session?.user?.firstName} {session?.user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-4 h-4 border-2 border-current rounded-full" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  Alternar tema
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}