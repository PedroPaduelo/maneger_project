'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tag as TagIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  Folder,
  Palette
} from 'lucide-react';
import { useTagsWithCount, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useTags';
import { TagWithCount } from '@/hooks/useTags';
import { TagComponent } from '@/components/tag-component';
import { SidebarLayout } from '@/components/sidebar-layout';

// Color options for tags
const TAG_COLORS = [
  { value: 'red', label: 'Vermelho', preview: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'blue', label: 'Azul', preview: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'green', label: 'Verde', preview: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'yellow', label: 'Amarelo', preview: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'purple', label: 'Roxo', preview: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'pink', label: 'Rosa', preview: 'bg-pink-100 text-pink-800 border-pink-200' },
  { value: 'orange', label: 'Laranja', preview: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'teal', label: 'Ciano', preview: 'bg-teal-100 text-teal-800 border-teal-200' },
];

// Form type for tag creation/editing
interface TagForm {
  name: string;
  description: string;
  color: string;
}

export default function TagsPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagWithCount | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<TagForm>({
    name: '',
    description: '',
    color: 'blue'
  });

  const [editForm, setEditForm] = useState<TagForm>({
    name: '',
    description: '',
    color: 'blue'
  });

  // Hooks
  const { data: tags = [], isLoading, error, refetch } = useTagsWithCount();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      window.location.href = "/auth/signin";
      return;
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-4">Você precisa estar autenticado para acessar esta página.</p>
          <Button onClick={() => window.location.href = "/auth/signin"}>Fazer Login</Button>
        </div>
      </div>
    );
  }

  // Filter tags based on search
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get tag color styling
  const getTagColor = (color?: string) => {
    if (!color) return "bg-gray-100 text-gray-800 border-gray-200";

    const colorMap: Record<string, string> = {
      red: "bg-red-100 text-red-800 border-red-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      pink: "bg-pink-100 text-pink-800 border-pink-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      teal: "bg-teal-100 text-teal-800 border-teal-200",
    };

    return colorMap[color] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Handle tag creation
  const handleCreateTag = async () => {
    if (!createForm.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da tag é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTagMutation.mutateAsync(createForm);
      setCreateForm({ name: '', description: '', color: 'blue' });
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      // Error is already handled by the mutation hook
    }
  };

  // Handle tag editing
  const handleEditTag = async () => {
    if (!editForm.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da tag é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!editingTag) return;

    try {
      await updateTagMutation.mutateAsync({
        id: editingTag.id,
        tagData: editForm
      });
      setIsEditDialogOpen(false);
      setEditingTag(null);
    } catch (error) {
      // Error is already handled by the mutation hook
    }
  };

  // Handle tag deletion
  const handleDeleteTag = async (tagId: number) => {
    try {
      await deleteTagMutation.mutateAsync(tagId);
    } catch (error) {
      // Error is already handled by the mutation hook
    }
  };

  // Open edit dialog with tag data
  const openEditDialog = (tag: TagWithCount) => {
    setEditingTag(tag);
    setEditForm({
      name: tag.name,
      description: tag.description || '',
      color: tag.color || 'blue'
    });
    setIsEditDialogOpen(true);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <TagIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar tags</h2>
          <p className="text-muted-foreground mb-4">Não foi possível carregar as tags. Tente novamente.</p>
          <Button onClick={() => refetch()}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout
      title="Tags"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Tags" }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <TagIcon className="h-8 w-8" />
              Tags
            </h1>
            <p className="text-muted-foreground">
              Gerencie as tags do sistema para organizar seus projetos
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Tag</DialogTitle>
                <DialogDescription>
                  Crie uma nova tag para categorizar seus projetos.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Frontend, Backend, Urgente"
                    disabled={createTagMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o propósito desta tag..."
                    rows={3}
                    disabled={createTagMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Cor</Label>
                  <Select
                    value={createForm.color}
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, color: value }))}
                    disabled={createTagMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cor" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAG_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${color.preview.split(' ')[0]}`} />
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {createForm.color && (
                    <div className="mt-2">
                      <TagComponent
                        tag={{ name: createForm.name || 'Nome da Tag', color: createForm.color } as TagWithCount}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={createTagMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={createTagMutation.isPending}
                >
                  {createTagMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : (
                    'Criar Tag'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-card border-border hover:bg-accent/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Tags</CardTitle>
              <div className="bg-primary/20 p-2 rounded-lg">
                <TagIcon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tags.length}</div>
              <p className="text-xs text-muted-foreground">
                Tags cadastradas no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:bg-accent/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tags em Uso</CardTitle>
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Folder className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tags.filter(tag => tag._count.projectTags > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Tags associadas a projetos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:bg-accent/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Média por Tag</CardTitle>
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Palette className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tags.length > 0
                  ? (tags.reduce((acc, tag) => acc + tag._count.projectTags, 0) / tags.length).toFixed(1)
                  : '0'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Projetos por tag (média)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar tags por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                disabled={!searchTerm}
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tags Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Tags Cadastradas</CardTitle>
            <CardDescription>
              {filteredTags.length} tag{filteredTags.length !== 1 ? 's' : ''} encontrada{filteredTags.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-8 flex-1 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredTags.length === 0 ? (
              <div className="text-center py-12">
                <TagIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? 'Nenhuma tag encontrada' : 'Nenhuma tag cadastrada'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? 'Tente ajustar seus termos de busca.'
                    : 'Comece criando sua primeira tag para organizar seus projetos.'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Tag
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border hover:bg-muted/30">
                      <TableHead className="text-muted-foreground font-semibold">Tag</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Descrição</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Cor</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Projetos</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Criada em</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTags.map((tag) => (
                      <TableRow key={tag.id} className="border-border hover:bg-accent/50 transition-colors">
                        <TableCell>
                          <TagComponent
                            tag={tag}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {tag.description || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded border-2 ${
                                tag.color ? getTagColor(tag.color).split(' ')[0] : 'bg-gray-100'
                              }`}
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium capitalize">
                                {tag.color || 'Padrão'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {tag.color
                                  ? TAG_COLORS.find(c => c.value === tag.color)?.label || tag.color
                                  : 'Sem cor definida'
                                }
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {tag._count.projectTags} projeto{tag._count.projectTags !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(tag.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(tag)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={tag._count.projectTags > 0}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Tag</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a tag "{tag.name}"?
                                    {tag._count.projectTags > 0 && (
                                      <span className="text-destructive block mt-2">
                                        Esta tag não pode ser excluída pois está sendo usada em {tag._count.projectTags} projeto{tag._count.projectTags !== 1 ? 's' : ''}.
                                      </span>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTag(tag.id)}
                                    disabled={tag._count.projectTags > 0}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Tag</DialogTitle>
              <DialogDescription>
                Atualize as informações da tag "{editingTag?.name}".
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Frontend, Backend, Urgente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o propósito desta tag..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Cor</Label>
                <Select
                  value={editForm.color}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, color: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.preview.split(' ')[0]}`} />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editForm.color && (
                  <div className="mt-2">
                    <TagComponent
                      tag={{ name: editForm.name || 'Nome da Tag', color: editForm.color } as TagWithCount}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleEditTag}
                disabled={updateTagMutation.isPending}
              >
                {updateTagMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  );
}