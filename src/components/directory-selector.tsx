'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderIcon, ChevronRightIcon, HomeIcon, ArrowLeftIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Directory {
  name: string;
  path: string;
  isHidden: boolean;
}

interface DirectorySelectorProps {
  value?: string;
  onChange: (path: string) => void;
  placeholder?: string;
}

export function DirectorySelector({
  value,
  onChange,
  placeholder = 'Selecione um diretório...',
}: DirectorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [parentPath, setParentPath] = useState('');
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    if (open) {
      loadDirectories(value || null);
    }
  }, [open, value]);

  async function loadDirectories(dirPath: string | null) {
    setLoading(true);
    try {
      const response = await fetch('/api/filesystem/list-directories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dirPath }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load directories');
      }

      const data = await response.json();
      setCurrentPath(data.currentPath);
      setParentPath(data.parentPath);
      setDirectories(data.directories);
    } catch (error: any) {
      console.error('Error loading directories:', error);
      alert(error.message || 'Erro ao carregar diretórios');
    } finally {
      setLoading(false);
    }
  }

  function handleDirectoryClick(directory: Directory) {
    loadDirectories(directory.path);
  }

  function handleGoUp() {
    if (parentPath) {
      loadDirectories(parentPath);
    }
  }

  function handleSelect() {
    onChange(currentPath);
    setOpen(false);
  }

  const filteredDirectories = showHidden
    ? directories
    : directories.filter(d => !d.isHidden);

  return (
    <div className="space-y-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex gap-2">
          <Input
            readOnly
            value={value || ''}
            placeholder={placeholder}
            className="flex-1 cursor-pointer"
            onClick={() => setOpen(true)}
          />
          <DialogTrigger asChild>
            <Button variant="outline" type="button">
              <FolderIcon className="h-4 w-4 mr-2" />
              Selecionar
            </Button>
          </DialogTrigger>
        </div>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Selecionar Diretório</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Caminho atual */}
            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
              <HomeIcon className="h-4 w-4 text-gray-500" />
              <Input
                value={currentPath}
                onChange={(e) => setCurrentPath(e.target.value)}
                className="flex-1 bg-white"
                placeholder="Digite o caminho..."
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadDirectories(currentPath)}
                disabled={loading}
              >
                Ir
              </Button>
            </div>

            {/* Controles */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGoUp}
                  disabled={loading || !parentPath}
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadDirectories(null)}
                  disabled={loading}
                >
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showHidden}
                  onChange={(e) => setShowHidden(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Mostrar ocultos
              </label>
            </div>

            {/* Lista de diretórios */}
            <ScrollArea className="h-[400px] border rounded-md">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm text-gray-500">Carregando...</div>
                </div>
              ) : filteredDirectories.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm text-gray-500">
                    Nenhum diretório encontrado
                  </div>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredDirectories.map((directory) => (
                    <button
                      key={directory.path}
                      onClick={() => handleDirectoryClick(directory)}
                      className={cn(
                        'w-full flex items-center gap-2 p-2 rounded-md',
                        'hover:bg-gray-100 transition-colors text-left',
                        directory.isHidden && 'opacity-60'
                      )}
                    >
                      <FolderIcon className="h-4 w-4 text-blue-500" />
                      <span className="flex-1 text-sm">{directory.name}</span>
                      <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Ações */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSelect}>
                Selecionar este diretório
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
