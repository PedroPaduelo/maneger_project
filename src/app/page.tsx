"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Dashboard } from "@/components/dashboard";
import { Project, Task, Requirement, HistorySummary } from "@/lib/types";

export default function Home() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [historySummaries, setHistorySummaries] = useState<HistorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Temporarily disable authentication requirement for development
    fetchData();
    // if (status === "authenticated") {
    //   fetchData();
    // } else if (status === "unauthenticated") {
    //   // Redirect to sign in
    //   window.location.href = "/auth/signin";
    // }
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [projectsRes, tasksRes, requirementsRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/tasks"),
        fetch("/api/requirements")
      ]);

      if (!projectsRes.ok || !tasksRes.ok || !requirementsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const projectsData = await projectsRes.json();
      const tasksData = await tasksRes.json();
      const requirementsData = await requirementsRes.json();

      setProjects(projectsData.projects || []);
      setTasks(tasksData || []);
      setRequirements(requirementsData || []);
      
      // Extract history summaries from projects
      const allHistorySummaries = projectsData.projects?.flatMap((project: any) => project.historySummaries || []) || [];
      setHistorySummaries(allHistorySummaries);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Erro ao carregar os dados. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Dashboard 
        projects={projects}
        tasks={tasks}
        requirements={requirements}
        historySummaries={historySummaries}
      />
    </div>
  );
}