import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const todoId = parseInt(resolvedParams.id);

    if (isNaN(todoId)) {
      return NextResponse.json(
        { error: "Invalid todo ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const todo = await db.taskTodo.update({
      where: { id: todoId },
      data: {
        description: body.description,
        isCompleted: body.isCompleted,
        sequence: body.sequence
      }
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const todoId = parseInt(resolvedParams.id);

    if (isNaN(todoId)) {
      return NextResponse.json(
        { error: "Invalid todo ID" },
        { status: 400 }
      );
    }

    await db.taskTodo.delete({
      where: { id: todoId }
    });

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}