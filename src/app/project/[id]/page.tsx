"use client";

import { ProjectDetails } from "@/components/project-details";
import { SidebarLayout } from "@/components/sidebar-layout";

export default function ProjectPage() {
  return (
    <SidebarLayout
      title="Detalhes do Projeto"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Projetos", href: "/projects" },
        { label: "Detalhes" }
      ]}
    >
      <ProjectDetails />
    </SidebarLayout>
  );
}