import { NextResponse } from "next/server";
import { matchmakeRoom, MultiplayerGameType } from "@/lib/multiplayerStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const gameType: MultiplayerGameType = body.gameType || "dots-and-boxes";
    const playerName: string = body.playerName || "Player 1";

    const result = matchmakeRoom(gameType, playerName);

    return NextResponse.json({
      success: true,
      matched: result.matched,
      room: result.room,
      playerToken: result.playerToken,
      playerNumber: result.playerNumber,
    });
  } catch (error: any) {
    console.error("Matchmaking API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
