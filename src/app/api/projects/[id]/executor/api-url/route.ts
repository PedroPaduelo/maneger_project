import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const { apiUrl } = await request.json();

    if (!apiUrl || typeof apiUrl !== 'string') {
      return NextResponse.json(
        { error: 'Valid API URL is required' },
        { status: 400 }
      );
    }

    // Atualizar metadata do projeto com a nova API URL
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const metadata = (project.metadata as any) || {};
    metadata.executorApiUrl = apiUrl;

    await db.project.update({
      where: { id: projectId },
      data: {
        metadata,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, apiUrl });
  } catch (error) {
    console.error('Error updating API URL:', error);
    return NextResponse.json(
      { error: 'Failed to update API URL' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { metadata: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const apiUrl = (project.metadata as any)?.executorApiUrl || '';
    return NextResponse.json({ apiUrl });
  } catch (error) {
    console.error('Error fetching API URL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API URL' },
      { status: 500 }
    );
  }
}
