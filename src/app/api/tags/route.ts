import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const withCount = searchParams.get("withCount") === "true";

    if (withCount) {
      // Get tags with project count
      const tags = await db.tag.findMany({
        include: {
          _count: {
            select: {
              projectTags: true
            }
          }
        },
        orderBy: [
          { name: "asc" }
        ]
      });

      return NextResponse.json({ tags });
    } else {
      // Get tags without count
      const tags = await db.tag.findMany({
        orderBy: [
          { name: "asc" }
        ]
      });

      return NextResponse.json({ tags });
    }
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if tag already exists
    const existingTag = await db.tag.findFirst({
      where: {
        name: body.name
      }
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "Tag already exists" },
        { status: 409 }
      );
    }

    const tag = await db.tag.create({
      data: {
        name: body.name,
        color: body.color,
        description: body.description,
      },
      include: {
        projectTags: {
          include: {
            project: true
          }
        }
      }
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}