import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationIds, userId } = body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: "Notification IDs are required" },
        { status: 400 }
      );
    }

    const where: any = {
      id: {
        in: notificationIds
      }
    };

    if (userId) {
      where.userId = userId;
    }

    const result = await db.notification.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return NextResponse.json({
      message: "Notifications marked as read",
      count: result.count
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}