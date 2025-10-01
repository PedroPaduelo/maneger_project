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
    const resolvedParams = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const project = await db.project.findFirst({
      where: {
        id: parseInt(resolvedParams.id),
        userId: session.user.id
      },
      include: {
        tasks: {
          include: {
            taskTodos: true,
            requirementTasks: {
              include: {
                requirement: true
              }
            }
          }
        },
        requirements: {
          include: {
            requirementTasks: {
              include: {
                task: true
              }
            }
          }
        },
        historySummaries: true,
        projectTags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Verify that the project belongs to the authenticated user
    const existingProject = await db.project.findFirst({
      where: {
        id: parseInt(resolvedParams.id),
        userId: session.user.id
      }
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }
    
    const project = await db.project.update({
      where: {
        id: parseInt(resolvedParams.id)
      },
      data: {
        name: body.name,
        description: body.description,
        stack: body.stack,
        notes: body.notes,
        status: body.status,
        priority: body.priority,
        progress: body.progress,
        isFavorite: body.isFavorite,
        color: body.color,
        tags: body.tags
      },
      include: {
        tasks: {
          include: {
            taskTodos: true,
            requirementTasks: {
              include: {
                requirement: true
              }
            }
          }
        },
        requirements: {
          include: {
            requirementTasks: {
              include: {
                task: true
              }
            }
          }
        },
        historySummaries: true,
        projectTags: {
          include: {
            tag: true
          }
        }
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify that the project belongs to the authenticated user
    const existingProject = await db.project.findFirst({
      where: {
        id: parseInt(resolvedParams.id),
        userId: session.user.id
      }
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }
    
    await db.project.delete({
      where: {
        id: parseInt(resolvedParams.id)
      }
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}