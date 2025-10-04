import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions);
    // 
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

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
    // Remove userId filter for development
    // if (session?.user?.id) {
    //   where.userId = session.user.id;
    // }
    
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
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions);
    // 
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json();
    
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
        executionPath: body.executionPath,
        // Remove userId for development
        // userId: session.user.id
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