import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";
    const tagsParam = searchParams.get("tags") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (session?.user?.id) {
      where.userId = session.user.id;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (priority && priority !== "all") {
      where.priority = priority;
    }

    if (tagsParam) {
      const tagIds = tagsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (tagIds.length > 0) {
        where.projectTags = {
          some: {
            tagId: {
              in: tagIds
            }
          }
        };
      }
    }

    // Get projects with pagination
    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isFavorite: "desc" },
          { updatedAt: "desc" }
        ],
        include: {
          tasks: {
            select: {
              id: true,
              status: true,
              createdAt: true
            }
          },
          requirements: {
            select: {
              id: true,
              priority: true,
              createdAt: true
            }
          },
          projectTags: {
            include: {
              tag: true
            }
          }
        }
      }),
      db.project.count({ where })
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Check if this is a duplicate request
    if (body.duplicateFrom) {
      return await duplicateProject(body.duplicateFrom, body.includeTasks, session.user.id);
    }

    const project = await db.project.create({
      data: {
        name: body.name,
        description: body.description,
        stack: body.stack || "",
        notes: body.notes,
        status: body.status || "Ativo",
        priority: body.priority || "Média",
        progress: body.progress || 0,
        isFavorite: body.isFavorite || false,
        color: body.color,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        metadata: body.metadata,
        gitRepositoryUrl: body.gitRepositoryUrl,
        userId: session.user.id
      },
      include: {
        tasks: true,
        requirements: true,
        projectTags: {
          include: {
            tag: true
          }
        }
      }
    });

    // Handle tags association if provided
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
        db.projectTag.upsert({
          where: {
            projectId_tagId: {
              projectId: project.id,
              tagId: tag.id
            }
          },
          update: {},
          create: {
            projectId: project.id,
            tagId: tag.id
          }
        })
      );

      await Promise.all(projectTagPromises);
    }


    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

async function duplicateProject(sourceProjectId: number, includeTasks: boolean, userId: string) {
  try {
    // Get the source project with all related data
    const sourceProject = await db.project.findUnique({
      where: { id: sourceProjectId },
      include: {
        tasks: {
          include: {
            taskTodos: true,
            requirementTasks: true
          }
        },
        requirements: true,
        projectTags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!sourceProject) {
      return NextResponse.json(
        { error: "Source project not found" },
        { status: 404 }
      );
    }

    // Check if user owns the source project
    if (sourceProject.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to duplicate this project" },
        { status: 403 }
      );
    }

    // Create the duplicated project
    const duplicatedProject = await db.project.create({
      data: {
        name: `${sourceProject.name} (Cópia)`,
        description: sourceProject.description,
        stack: sourceProject.stack,
        notes: sourceProject.notes,
        status: "Ativo", // Reset status to active
        priority: sourceProject.priority,
        progress: 0, // Reset progress
        isFavorite: false, // Reset favorite
        color: sourceProject.color,
        tags: sourceProject.tags,
        metadata: sourceProject.metadata,
        gitRepositoryUrl: sourceProject.gitRepositoryUrl,
        userId: userId
      }
    });

    // Copy requirements
    if (sourceProject.requirements && sourceProject.requirements.length > 0) {
      const requirementPromises = sourceProject.requirements.map(async (req) => {
        return await db.requirement.create({
          data: {
            title: req.title,
            description: req.description,
            type: req.type,
            category: req.category,
            priority: req.priority,
            projectId: duplicatedProject.id
          }
        });
      });

      const newRequirements = await Promise.all(requirementPromises);

      // If including tasks, create requirement-task associations
      if (includeTasks && sourceProject.tasks) {
        for (const sourceTask of sourceProject.tasks) {
          if (sourceTask.requirementTasks && sourceTask.requirementTasks.length > 0) {
            const taskRequirementPromises = sourceTask.requirementTasks.map(rt => {
              const newRequirement = newRequirements.find(nr => nr.title === sourceProject.requirements.find(r => r.id === rt.requirementId)?.title);
              if (newRequirement) {
                return db.requirementTask.create({
                  data: {
                    taskId: rt.taskId, // This will be updated later
                    requirementId: newRequirement.id
                  }
                });
              }
            });
            await Promise.all(taskRequirementPromises.filter(Boolean));
          }
        }
      }
    }

    // Copy tags associations
    if (sourceProject.projectTags && sourceProject.projectTags.length > 0) {
      const tagPromises = sourceProject.projectTags.map(pt =>
        db.projectTag.create({
          data: {
            projectId: duplicatedProject.id,
            tagId: pt.tagId
          }
        })
      );
      await Promise.all(tagPromises);
    }

    // Copy tasks if requested
    if (includeTasks && sourceProject.tasks && sourceProject.tasks.length > 0) {
      const taskPromises = sourceProject.tasks.map(async (task) => {
        const newTask = await db.task.create({
          data: {
            title: task.title,
            guidancePrompt: task.guidancePrompt,
            additionalInformation: task.additionalInformation,
            description: task.description,
            status: "Pendente", // Reset task status
            createdBy: "system", // Update as needed
            updatedBy: "system", // Update as needed
            projectId: duplicatedProject.id,
            result: task.result
          }
        });

        // Copy task todos
        if (task.taskTodos && task.taskTodos.length > 0) {
          const todoPromises = task.taskTodos.map(todo =>
            db.taskTodo.create({
              data: {
                taskId: newTask.id,
                description: todo.description,
                isCompleted: false, // Reset todo status
                sequence: todo.sequence
              }
            })
          );
          await Promise.all(todoPromises);
        }

        return newTask;
      });

      await Promise.all(taskPromises);
    }

    // Get the complete duplicated project
    const completeDuplicatedProject = await db.project.findUnique({
      where: { id: duplicatedProject.id },
      include: {
        tasks: {
          include: {
            taskTodos: true,
            requirementTasks: true
          }
        },
        requirements: true,
        projectTags: {
          include: {
            tag: true
          }
        }
      }
    });

    return NextResponse.json(completeDuplicatedProject, { status: 201 });
  } catch (error) {
    console.error("Error duplicating project:", error);
    return NextResponse.json(
      { error: "Failed to duplicate project" },
      { status: 500 }
    );
  }
}