import { NextResponse } from "next/server";
import * as store from "@/lib/multiplayerStore";
import { MultiplayerGameType } from "@/lib/multiplayerStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const gameType: MultiplayerGameType = body.gameType || "dots-and-boxes";
    const playerName: string = body.playerName || "Player 1";

    let result: {
      matched: boolean;
      room: any;
      playerToken: string;
      playerNumber: 1 | 2;
    };

    if (typeof (store as any).matchmakeRoom === "function") {
      result = (store as any).matchmakeRoom(gameType, playerName);
    } else {
      const openRooms = store
        .listOpenRooms(gameType)
        .filter((r: any) => r.gameType === gameType);
      let joined = false;
      let joinRes: any = null;

      if (openRooms.length > 0) {
        const target = openRooms[0];
        joinRes = store.joinRoom(target.code, playerName);
        if (joinRes.success && joinRes.room && joinRes.playerToken) {
          joined = true;
        }
      }

      if (joined && joinRes) {
        result = {
          matched: true,
          room: joinRes.room,
          playerToken: joinRes.playerToken,
          playerNumber: 2,
        };
      } else {
        const createResult = store.createRoom(gameType, playerName, undefined, { isPublic: true });
        result = {
          matched: false,
          room: createResult.room,
          playerToken: createResult.playerToken,
          playerNumber: 1,
        };
      }
    }

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
