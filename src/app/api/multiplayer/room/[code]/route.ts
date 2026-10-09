import { NextResponse } from "next/server";
import { getRoom, handleRoomAction } from "@/lib/multiplayerStore";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(req.url);
    const playerToken = searchParams.get("token") || undefined;

    const { room, playerNumber, error } = getRoom(code, playerToken);

    if (error || !room) {
      return NextResponse.json({ success: false, error: error || "Room not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      room,
      playerNumber: playerNumber || null,
    });
  } catch (error) {
    console.error("Fetch room error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch room state" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { playerToken, action, payload } = body;

    if (!playerToken || !action) {
      return NextResponse.json(
        { success: false, error: "Missing playerToken or action" },
        { status: 400 }
      );
    }

    const result = handleRoomAction(code, playerToken, action, payload);

    if (!result.success || !result.room) {
      return NextResponse.json(
        { success: false, error: result.error || "Action rejected" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      room: result.room,
    });
  } catch (error) {
    console.error("Handle action error:", error);
    return NextResponse.json(
      { success: false, error: "Server error processing action" },
      { status: 500 }
    );
  }
}
