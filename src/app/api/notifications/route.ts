import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;
    const userId = session.user.id;

    const where: any = {
      userId
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" }
        ],
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      db.notification.count({ where }),
      db.notification.count({
        where: {
          userId,
          isRead: false
        }
      })
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const userId = session.user.id;

    const notification = await db.notification.create({
      data: {
        userId: userId,
        type: body.type,
        title: body.title,
        message: body.message,
        projectId: body.projectId,
        metadata: body.metadata,
        priority: body.priority || "Média"
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}