import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const requirementTaskId = parseInt(resolvedParams.id);

    if (isNaN(requirementTaskId)) {
      return NextResponse.json(
        { error: "Invalid requirement task ID" },
        { status: 400 }
      );
    }

    await db.requirementTask.delete({
      where: { id: requirementTaskId }
    });

    return NextResponse.json({ message: "Task unlinked successfully" });
  } catch (error) {
    console.error("Error unlinking task:", error);
    return NextResponse.json(
      { error: "Failed to unlink task" },
      { status: 500 }
    );
  }
}