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

    const tag = await db.tag.findUnique({
      where: {
        id: parseInt(resolvedParams.id)
      },
      include: {
        _count: {
          select: {
            projectTags: true
          }
        },
        projectTags: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
                progress: true
              }
            }
          }
        }
      }
    });

    if (!tag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tag });
  } catch (error) {
    console.error("Error fetching tag:", error);
    return NextResponse.json(
      { error: "Failed to fetch tag" },
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

    // Check if tag exists
    const existingTag = await db.tag.findUnique({
      where: {
        id: parseInt(resolvedParams.id)
      }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    // Check if another tag with the same name already exists
    if (body.name !== existingTag.name) {
      const duplicateTag = await db.tag.findFirst({
        where: {
          name: body.name,
          id: {
            not: parseInt(resolvedParams.id)
          }
        }
      });

      if (duplicateTag) {
        return NextResponse.json(
          { error: "A tag with this name already exists" },
          { status: 409 }
        );
      }
    }

    const updatedTag = await db.tag.update({
      where: {
        id: parseInt(resolvedParams.id)
      },
      data: {
        name: body.name,
        description: body.description,
        color: body.color
      },
      include: {
        _count: {
          select: {
            projectTags: true
          }
        },
        projectTags: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
                progress: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ tag: updatedTag });
  } catch (error) {
    console.error("Error updating tag:", error);
    return NextResponse.json(
      { error: "Failed to update tag" },
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

    // Check if tag exists and get project count
    const tag = await db.tag.findUnique({
      where: {
        id: parseInt(resolvedParams.id)
      },
      include: {
        _count: {
          select: {
            projectTags: true
          }
        }
      }
    });

    if (!tag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    // Prevent deletion if tag is being used
    if (tag._count.projectTags > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete tag",
          message: `This tag is being used by ${tag._count.projectTags} project${tag._count.projectTags !== 1 ? 's' : ''}`
        },
        { status: 409 }
      );
    }

    // Delete the tag
    await db.tag.delete({
      where: {
        id: parseInt(resolvedParams.id)
      }
    });

    return NextResponse.json({
      message: "Tag deleted successfully",
      tagId: parseInt(resolvedParams.id)
    });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}