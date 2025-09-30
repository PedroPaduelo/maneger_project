import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requirementId = parseInt(params.id);

    if (isNaN(requirementId)) {
      return NextResponse.json(
        { error: "Invalid requirement ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Check if the link already exists
    const existingLink = await db.requirementTask.findFirst({
      where: {
        requirementId,
        taskId
      }
    });

    if (existingLink) {
      return NextResponse.json(
        { error: "Task is already linked to this requirement" },
        { status: 400 }
      );
    }

    const requirementTask = await db.requirementTask.create({
      data: {
        requirementId,
        taskId
      },
      include: {
        requirement: true,
        task: true
      }
    });

    return NextResponse.json(requirementTask, { status: 201 });
  } catch (error) {
    console.error("Error linking task to requirement:", error);
    return NextResponse.json(
      { error: "Failed to link task to requirement" },
      { status: 500 }
    );
  }
}