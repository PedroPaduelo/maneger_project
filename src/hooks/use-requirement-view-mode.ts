"use client";

import { useState, useEffect } from "react";

type ViewMode = "cards" | "table";

const STORAGE_KEY = "requirement-view-mode";

export function useRequirementViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar preferência do localStorage na montagem
  useEffect(() => {
    try {
      const storedViewMode = localStorage.getItem(STORAGE_KEY) as ViewMode;
      if (storedViewMode && (storedViewMode === "cards" || storedViewMode === "table")) {
        setViewMode(storedViewMode);
      }
    } catch (error) {
      console.error("Error loading requirement view mode from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Salvar preferência no localStorage quando mudar
  useEffect(() => {
    if (!isLoaded) return; // Não salvar até que o valor inicial seja carregado

    try {
      localStorage.setItem(STORAGE_KEY, viewMode);
    } catch (error) {
      console.error("Error saving requirement view mode to localStorage:", error);
    }
  }, [viewMode, isLoaded]);

  return { viewMode, setViewMode, isLoaded };
}