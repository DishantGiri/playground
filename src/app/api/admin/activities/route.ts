import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ activities });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, slug, description, category, type, thumbnail, difficulty, estimatedTime, points } = body;

    const activity = await prisma.activity.create({
      data: {
        title,
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
        description,
        category,
        type,
        thumbnail: thumbnail || "game",
        difficulty: difficulty || "EASY",
        estimatedTime: estimatedTime || "2 min",
        points: parseInt(points) || 20,
      },
    });

    return NextResponse.json({ success: true, activity });
  } catch (error: any) {
    console.error("Create activity error:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, active, title, description, points } = body;

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        ...(active !== undefined && { active }),
        ...(title && { title }),
        ...(description && { description }),
        ...(points !== undefined && { points: parseInt(points) }),
      },
    });

    return NextResponse.json({ success: true, activity: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.activity.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
