import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; summaryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, summaryId } = await params;
    const projectId = parseInt(id);
    const summaryIdNum = parseInt(summaryId);
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

    // Verify history summary exists and belongs to project
    const existingSummary = await db.historySummary.findFirst({
      where: {
        id: summaryIdNum,
        projectId: projectId,
      },
    });

    if (!existingSummary) {
      return NextResponse.json({ error: "Sumário não encontrado" }, { status: 404 });
    }

    // Update history summary
    const updatedHistorySummary = await db.historySummary.update({
      where: {
        id: summaryIdNum,
      },
      data: {
        summary: summary,
      },
    });

    return NextResponse.json(updatedHistorySummary);
  } catch (error) {
    console.error("Error updating history summary:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar sumário histórico" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; summaryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, summaryId } = await params;
    const projectId = parseInt(id);
    const summaryIdNum = parseInt(summaryId);

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

    // Verify history summary exists and belongs to project
    const existingSummary = await db.historySummary.findFirst({
      where: {
        id: summaryIdNum,
        projectId: projectId,
      },
    });

    if (!existingSummary) {
      return NextResponse.json({ error: "Sumário não encontrado" }, { status: 404 });
    }

    // Delete history summary
    await db.historySummary.delete({
      where: {
        id: summaryIdNum,
      },
    });

    return NextResponse.json({ message: "Sumário excluído com sucesso" });
  } catch (error) {
    console.error("Error deleting history summary:", error);
    return NextResponse.json(
      { error: "Erro ao excluir sumário histórico" },
      { status: 500 }
    );
  }
}