import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Server } from "socket.io";

// Get Socket.IO server instance
let io: Server | null = null;

// This is a workaround to get the Socket.IO instance
// In a real app, you would properly inject this
if (typeof global !== 'undefined') {
  io = (global as any).io;
}

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
    const projectId = searchParams.get("projectId");
    
    const where: any = {};
    if (projectId) {
      where.projectId = parseInt(projectId);
      // Ensure the project belongs to the authenticated user
      // const project = await db.project.findFirst({
      //   where: {
      //     id: parseInt(projectId),
      //     userId: session.user.id
      //   }
      // });
      
      // if (!project) {
      //   return NextResponse.json(
      //     { error: "Project not found or access denied" },
      //     { status: 404 }
      //   );
      // }
    } else {
      // If no projectId specified, get all requirements from user's projects
      // where.project = {
      //   userId: session.user.id
      // };
    }

    const requirements = await db.requirement.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ],
      include: {
        requirementTasks: {
          include: {
            task: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(requirements);
  } catch (error) {
    console.error("Error fetching requirements:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
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
    
    // Verify that the project belongs to the authenticated user
    // const project = await db.project.findFirst({
    //   where: {
    //     id: body.projectId,
    //     userId: session.user.id
    //   }
    // });
    
    // if (!project) {
    //   return NextResponse.json(
    //     { error: "Project not found or access denied" },
    //     { status: 404 }
    //   );
    // }
    
    const requirement = await db.requirement.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type || "Funcional",
        category: body.category,
        priority: body.priority || "Média",
        projectId: body.projectId
      },
      include: {
        requirementTasks: {
          include: {
            task: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Emit WebSocket event for real-time update
    if (io) {
      io.emit('requirement-update', {
        type: 'requirement-created',
        requirement,
        message: `Novo requisito "${requirement.title}" foi criado`
      });
    }

    return NextResponse.json(requirement, { status: 201 });
  } catch (error) {
    console.error("Error creating requirement:", error);
    return NextResponse.json(
      { error: "Failed to create requirement" },
      { status: 500 }
    );
  }
}