import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "system";
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

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
    const body = await request.json();
    
    const notification = await db.notification.create({
      data: {
        userId: body.userId || "system",
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