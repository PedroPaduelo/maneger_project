"use client"

import { ReactNode } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Carregando...</div>
  }

  if (!session) {
    redirect("/auth/signin")
  }

  return <>{children}</>
}