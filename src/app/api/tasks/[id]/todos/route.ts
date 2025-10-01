import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const taskId = parseInt(resolvedParams.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const todos = await db.taskTodo.findMany({
      where: { taskId },
      orderBy: { sequence: "asc" }
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error("Error fetching task todos:", error);
    return NextResponse.json(
      { error: "Failed to fetch task todos" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const taskId = parseInt(resolvedParams.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Get the highest sequence number for this task
    const lastTodo = await db.taskTodo.findFirst({
      where: { taskId },
      orderBy: { sequence: "desc" }
    });

    const nextSequence = lastTodo ? lastTodo.sequence + 1 : 0;

    const todo = await db.taskTodo.create({
      data: {
        taskId,
        description: body.description,
        isCompleted: body.isCompleted || false,
        sequence: body.sequence !== undefined ? body.sequence : nextSequence
      }
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("Error creating task todo:", error);
    return NextResponse.json(
      { error: "Failed to create task todo" },
      { status: 500 }
    );
  }
}