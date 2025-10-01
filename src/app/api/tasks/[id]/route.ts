import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const task = await db.task.findFirst({
      where: {
        id: parseInt(params.id),
        project: {
          userId: session.user.id
        }
      },
      include: {
        taskTodos: true,
        requirementTasks: {
          include: {
            requirement: true
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

    if (!task) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Verify that the task belongs to the authenticated user
    const existingTask = await db.task.findFirst({
      where: {
        id: parseInt(params.id),
        project: {
          userId: session.user.id
        }
      }
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
        { status: 404 }
      );
    }

    // Update task and handle todos
    const updatedTask = await db.task.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        title: body.title,
        description: body.description,
        guidancePrompt: body.guidancePrompt,
        additionalInformation: body.additionalInformation,
        status: body.status,
        result: body.result,
        updatedBy: session.user.id,
        taskTodos: body.taskTodos ? {
          deleteMany: {},
          create: body.taskTodos.map((todo: any, index: number) => ({
            description: todo.description,
            isCompleted: todo.isCompleted,
            sequence: index
          }))
        } : undefined
      },
      include: {
        taskTodos: true,
        requirementTasks: {
          include: {
            requirement: true
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

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Verify that the task belongs to the authenticated user
    const existingTask = await db.task.findFirst({
      where: {
        id: parseInt(params.id),
        project: {
          userId: session.user.id
        }
      }
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
        { status: 404 }
      );
    }
    
    await db.task.delete({
      where: {
        id: parseInt(params.id)
      }
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}