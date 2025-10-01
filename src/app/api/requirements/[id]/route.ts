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

    const requirement = await db.requirement.findFirst({
      where: {
        id: parseInt(resolvedParams.id),
        project: {
          userId: session.user.id
        }
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

    if (!requirement) {
      return NextResponse.json(
        { error: "Requirement not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(requirement);
  } catch (error) {
    console.error("Error fetching requirement:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirement" },
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

    // Verify that the requirement belongs to the authenticated user
    const existingRequirement = await db.requirement.findFirst({
      where: {
        id: parseInt(resolvedParams.id),
        project: {
          userId: session.user.id
        }
      }
    });
    
    if (!existingRequirement) {
      return NextResponse.json(
        { error: "Requirement not found or access denied" },
        { status: 404 }
      );
    }
    
    const requirement = await db.requirement.update({
      where: {
        id: parseInt(resolvedParams.id)
      },
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        category: body.category,
        priority: body.priority
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

    return NextResponse.json(requirement);
  } catch (error) {
    console.error("Error updating requirement:", error);
    return NextResponse.json(
      { error: "Failed to update requirement" },
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

    // Verify that the requirement belongs to the authenticated user
    const existingRequirement = await db.requirement.findFirst({
      where: {
        id: parseInt(resolvedParams.id),
        project: {
          userId: session.user.id
        }
      }
    });
    
    if (!existingRequirement) {
      return NextResponse.json(
        { error: "Requirement not found or access denied" },
        { status: 404 }
      );
    }
    
    await db.requirement.delete({
      where: {
        id: parseInt(resolvedParams.id)
      }
    });

    return NextResponse.json({ message: "Requirement deleted successfully" });
  } catch (error) {
    console.error("Error deleting requirement:", error);
    return NextResponse.json(
      { error: "Failed to delete requirement" },
      { status: 500 }
    );
  }
}