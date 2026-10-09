import { NextResponse } from "next/server";
import {
  createRoom,
  getRoom,
  listOpenRooms,
  MultiplayerGameType,
  CustomRoomOptions,
} from "@/lib/multiplayerStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const gameType: MultiplayerGameType = body.gameType || "number-guess";
    const hostName: string = body.playerName || "Player 1";
    const customCode: string | undefined = body.preferredCode;
    const customOptions: CustomRoomOptions | undefined = body.customOptions || body.config;

    const { room, playerToken } = createRoom(gameType, hostName, customCode, customOptions);

    return NextResponse.json({
      success: true,
      room,
      playerToken,
      playerNumber: 1,
    });
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create multiplayer room" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const mode = searchParams.get("mode");
  const gameType = searchParams.get("gameType") as MultiplayerGameType | null;

  // Mode "open" or no code returns open public waiting rooms (optionally filtered by specific gameType)
  if (mode === "open" || !code) {
    const openRooms = listOpenRooms(gameType || undefined);
    return NextResponse.json({
      success: true,
      rooms: openRooms,
    });
  }

  const { room, error } = getRoom(code);
  if (error || !room) {
    return NextResponse.json({ error: error || "Room not found" }, { status: 404 });
  }

  return NextResponse.json({
    code: room.code,
    gameType: room.gameType,
    status: room.status,
    playerCount: room.players.length,
    isPublic: room.isPublic,
    customOptions: room.customOptions,
  });
}
