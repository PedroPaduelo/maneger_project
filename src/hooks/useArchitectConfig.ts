import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ArchitectConfig {
  id: number;
  name: string;
  prompt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useArchitectConfig() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configs, setConfigs] = useState<ArchitectConfig[]>([]);
  const [activeConfig, setActiveConfig] = useState<ArchitectConfig | null>(null);

  // Carregar configurações
  const loadConfigs = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/architect-config');
      if (response.ok) {
        const data: ArchitectConfig[] = await response.json();
        setConfigs(data);

        const active = data.find(config => config.isActive);
        setActiveConfig(active || data[0] || null);
      } else {
        setError('Erro ao carregar configurações');
      }
    } catch (err) {
      setError('Erro ao carregar configurações');
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // Criar nova configuração
  const createConfig = useCallback(async (name: string, prompt: string, isActive = false) => {
    if (!session?.user?.id || !name.trim() || !prompt.trim()) return null;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/architect-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          prompt: prompt.trim(),
          isActive
        }),
      });

      if (response.ok) {
        const newConfig: ArchitectConfig = await response.json();

        if (isActive) {
          setConfigs(prev => [
            newConfig,
            ...prev.map(config => ({ ...config, isActive: false }))
          ]);
          setActiveConfig(newConfig);
        } else {
          setConfigs(prev => [newConfig, ...prev]);
        }

        return newConfig;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao criar configuração');
        return null;
      }
    } catch (err) {
      setError('Erro ao criar configuração');
      console.error('Erro ao criar configuração:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // Atualizar configuração
  const updateConfig = useCallback(async (id: number, updates: Partial<ArchitectConfig>) => {
    if (!session?.user?.id) return null;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/architect-config/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedConfig: ArchitectConfig = await response.json();

        setConfigs(prev => prev.map(config =>
          config.id === id ? updatedConfig : config
        ));

        if (updatedConfig.isActive) {
          setConfigs(prev => prev.map(config =>
            config.id === id ? updatedConfig : { ...config, isActive: false }
          ));
          setActiveConfig(updatedConfig);
        } else if (activeConfig?.id === id) {
          setActiveConfig(updatedConfig);
        }

        return updatedConfig;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao atualizar configuração');
        return null;
      }
    } catch (err) {
      setError('Erro ao atualizar configuração');
      console.error('Erro ao atualizar configuração:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, activeConfig]);

  // Excluir configuração
  const deleteConfig = useCallback(async (id: number) => {
    if (!session?.user?.id) return false;

    // Não permitir excluir a configuração ativa se for a única
    if (configs.length === 1) {
      setError('Não é possível excluir a única configuração disponível');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/architect-config/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setConfigs(prev => prev.filter(config => config.id !== id));

        if (activeConfig?.id === id) {
          const remainingConfigs = configs.filter(config => config.id !== id);
          const newActive = remainingConfigs.find(config => config.isActive) || remainingConfigs[0];
          setActiveConfig(newActive || null);

          if (newActive) {
            await updateConfig(newActive.id, { isActive: true });
          }
        }

        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao excluir configuração');
        return false;
      }
    } catch (err) {
      setError('Erro ao excluir configuração');
      console.error('Erro ao excluir configuração:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, configs, activeConfig, updateConfig]);

  // Definir configuração como ativa
  const setActive = useCallback(async (id: number) => {
    if (!session?.user?.id) return false;

    try {
      setIsLoading(true);
      setError(null);

      // Desativar todas as configurações
      await Promise.all(
        configs.map(config =>
          updateConfig(config.id, { isActive: config.id === id })
        )
      );

      return true;
    } catch (err) {
      setError('Erro ao definir configuração ativa');
      console.error('Erro ao definir configuração ativa:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, configs, updateConfig]);

  // Carregar configurações na montagem do componente
  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  return {
    configs,
    activeConfig,
    isLoading,
    error,
    loadConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    setActive,
    setError
  };
}