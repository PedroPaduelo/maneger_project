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

    // Check if ID parameter exists
    if (!resolvedParams?.id) {
      console.error("Missing project ID in params:", resolvedParams);
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const projectId = parseInt(resolvedParams.id);
    if (isNaN(projectId)) {
      console.error("Invalid project ID:", resolvedParams.id);
      return NextResponse.json(
        { error: `Invalid project ID: ${resolvedParams.id}` },
        { status: 400 }
      );
    }

    const project = await db.project.findFirst({
      where: {
        id: projectId,
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

    // Check if ID parameter exists
    if (!resolvedParams?.id) {
      console.error("Missing project ID in params:", resolvedParams);
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const projectId = parseInt(resolvedParams.id);
    if (isNaN(projectId)) {
      console.error("Invalid project ID:", resolvedParams.id);
      return NextResponse.json(
        { error: `Invalid project ID: ${resolvedParams.id}` },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Verify that the project belongs to the authenticated user
    const existingProject = await db.project.findFirst({
      where: {
        id: projectId,
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
        id: projectId
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
        tags: body.tags ? JSON.stringify(body.tags) : null,
        gitRepositoryUrl: body.gitRepositoryUrl
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

    // Handle tags association if provided
    if (body.tags !== undefined) {
      // First, delete all existing project-tag associations
      await db.projectTag.deleteMany({
        where: {
          projectId: projectId
        }
      });

      // If new tags are provided, create associations
      if (body.tags && body.tags.length > 0) {
        // First, ensure all tags exist in the database
        const tagPromises = body.tags.map(async (tagName: string) => {
          // Check if tag already exists
          let tag = await db.tag.findFirst({
            where: { name: tagName }
          });

          // If tag doesn't exist, create it
          if (!tag) {
            tag = await db.tag.create({
              data: {
                name: tagName,
                color: null,
                description: null
              }
            });
          }

          return tag;
        });

        const resolvedTags = await Promise.all(tagPromises);

        // Create associations between project and tags
        const projectTagPromises = resolvedTags.map(tag =>
          db.projectTag.create({
            data: {
              projectId: projectId,
              tagId: tag.id
            }
          })
        );

        await Promise.all(projectTagPromises);
      }
    }

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

    // Check if ID parameter exists
    if (!resolvedParams?.id) {
      console.error("Missing project ID in params:", resolvedParams);
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const projectId = parseInt(resolvedParams.id);
    if (isNaN(projectId)) {
      console.error("Invalid project ID:", resolvedParams.id);
      return NextResponse.json(
        { error: `Invalid project ID: ${resolvedParams.id}` },
        { status: 400 }
      );
    }

    // Verify that the project belongs to the authenticated user
    const existingProject = await db.project.findFirst({
      where: {
        id: projectId,
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
        id: projectId
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