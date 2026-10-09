import { NextResponse } from "next/server";
import { joinRoom } from "@/lib/multiplayerStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const roomCode: string = body.roomCode || "";
    const playerName: string = body.playerName || "Player 2";

    if (!roomCode) {
      return NextResponse.json(
        { success: false, error: "Please provide a room code" },
        { status: 400 }
      );
    }

    const result = joinRoom(roomCode, playerName);

    if (!result.success || !result.room) {
      return NextResponse.json(
        { success: false, error: result.error || "Could not join room" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      room: result.room,
      playerToken: result.playerToken,
      playerNumber: 2,
    });
  } catch (error) {
    console.error("Join room error:", error);
    return NextResponse.json(
      { success: false, error: "Server error while joining room" },
      { status: 500 }
    );
  }
}
