import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const projectId = parseInt(id);

    // Verify project exists and belongs to user
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    // Get all history summaries for the project
    const historySummaries = await db.historySummary.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(historySummaries);
  } catch (error) {
    console.error("Error fetching history summaries:", error);
    return NextResponse.json(
      { error: "Erro ao buscar sumários históricos" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const projectId = parseInt(id);
    const { summary } = await request.json();

    if (!summary || summary.trim() === "") {
      return NextResponse.json({ error: "Sumário é obrigatório" }, { status: 400 });
    }

    // Verify project exists and belongs to user
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    // Create new history summary
    const newHistorySummary = await db.historySummary.create({
      data: {
        summary: summary,
        projectId: projectId,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(newHistorySummary, { status: 201 });
  } catch (error) {
    console.error("Error creating history summary:", error);
    return NextResponse.json(
      { error: "Erro ao criar sumário histórico" },
      { status: 500 }
    );
  }
}