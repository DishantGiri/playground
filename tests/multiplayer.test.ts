import test from "node:test";
import assert from "node:assert/strict";
import {
  createRoom,
  joinRoom,
  getRoom,
  handleRoomAction,
  listOpenRooms,
  matchmakeRoom,
  MORRIS_MILLS,
  checkMorrisMillFormed,
} from "../src/lib/multiplayerStore";

test("Multiplayer: Room creation, custom options, and preferred code", () => {
  const customOptions = {
    isPublic: true,
    timerSeconds: 15,
    dotsGridSize: 4,
  };

  const { room, playerToken } = createRoom(
    "dots-and-boxes",
    "Player Alpha",
    "TESTCODE",
    customOptions
  );

  assert.equal(room.code, "TESTCODE");
  assert.equal(room.gameType, "dots-and-boxes");
  assert.equal(room.status, "waiting");
  assert.equal(room.players.length, 1);
  assert.equal(room.players[0].name, "Player Alpha");
  assert.equal(room.isPublic, true);
  assert.equal(room.customOptions?.timerSeconds, 15);
  assert.equal(room.dotsAndBoxes?.gridSize, 4);

  // Joining the room as Player Beta
  const joinRes = joinRoom("TESTCODE", "Player Beta");
  assert.equal(joinRes.success, true);
  assert.equal(joinRes.room?.status, "playing");
  assert.equal(joinRes.room?.players.length, 2);
  assert.equal(joinRes.room?.players[1].name, "Player Beta");
});

test("Multiplayer: Open rooms list only waiting public rooms", () => {
  // Public room
  createRoom("connect-4", "PublicHost", "PUB01", { isPublic: true });
  // Private room
  createRoom("connect-4", "PrivateHost", "PRIV01", { isPublic: false });

  const openRooms = listOpenRooms();
  const foundPublic = openRooms.find((r) => r.code === "PUB01");
  const foundPrivate = openRooms.find((r) => r.code === "PRIV01");

  assert.ok(foundPublic, "Public room should be in open rooms list");
  assert.equal(foundPrivate, undefined, "Private room should NOT be in open rooms list");
});

test("Multiplayer: Dots and Boxes multiplayer turns, square completion, and bonus turns", () => {
  const { room, playerToken: hostToken } = createRoom(
    "dots-and-boxes",
    "HostP1",
    "DOTS01",
    { dotsGridSize: 3, isPublic: true }
  );

  const guestRes = joinRoom("DOTS01", "GuestP2");
  const guestToken = guestRes.playerToken!;

  // Dots grid 3x3 has 2x2 = 4 boxes: (0,0), (0,1), (1,0), (1,1)
  // Let P1 claim top edge of (0,0): h-0-0
  let res = handleRoomAction("DOTS01", hostToken, "claim_edge", { edge: "h-0-0" });
  assert.equal(res.success, true);
  assert.equal(res.room?.dotsAndBoxes?.currentTurn, 2, "Turn should switch to P2 after no box completed");

  // Let P2 claim bottom edge of (0,0): h-1-0
  res = handleRoomAction("DOTS01", guestToken, "claim_edge", { edge: "h-1-0" });
  assert.equal(res.success, true);
  assert.equal(res.room?.dotsAndBoxes?.currentTurn, 1, "Turn switches back to P1");

  // Let P1 claim left edge of (0,0): v-0-0
  res = handleRoomAction("DOTS01", hostToken, "claim_edge", { edge: "v-0-0" });
  assert.equal(res.success, true);
  assert.equal(res.room?.dotsAndBoxes?.currentTurn, 2, "Turn switches to P2");

  // Let P2 claim right edge of (0,0): v-0-1 -> COMPLETES BOX (0,0)!
  res = handleRoomAction("DOTS01", guestToken, "claim_edge", { edge: "v-0-1" });
  assert.equal(res.success, true);
  assert.equal(res.room?.dotsAndBoxes?.p2Score, 1, "P2 should earn 1 point for closing square");
  assert.equal(res.room?.dotsAndBoxes?.boxes["0-0"], 2, "Box 0-0 belongs to P2");
  assert.equal(res.room?.dotsAndBoxes?.currentTurn, 2, "P2 should keep turn after completing square (bonus turn)");
});

test("Multiplayer: Nine Men's Morris mill formation and piece capture", () => {
  const { room, playerToken: hostToken } = createRoom(
    "nine-mens-morris",
    "P1",
    "MORR01",
    { isPublic: true }
  );

  const guestRes = joinRoom("MORR01", "P2");
  const guestToken = guestRes.playerToken!;

  // Phase 1: P1 places at 0
  let res = handleRoomAction("MORR01", hostToken, "place_piece", { pos: 0 });
  assert.equal(res.success, true);
  assert.equal(res.room?.nineMensMorris?.board[0], 1);
  assert.equal(res.room?.nineMensMorris?.currentTurn, 2);

  // P2 places at 8
  res = handleRoomAction("MORR01", guestToken, "place_piece", { pos: 8 });
  assert.equal(res.success, true);
  assert.equal(res.room?.nineMensMorris?.currentTurn, 1);

  // P1 places at 1
  res = handleRoomAction("MORR01", hostToken, "place_piece", { pos: 1 });
  assert.equal(res.success, true);
  assert.equal(res.room?.nineMensMorris?.currentTurn, 2);

  // P2 places at 9
  res = handleRoomAction("MORR01", guestToken, "place_piece", { pos: 9 });
  assert.equal(res.success, true);
  assert.equal(res.room?.nineMensMorris?.currentTurn, 1);

  // P1 places at 2 -> Forms outer mill [0, 1, 2]!
  res = handleRoomAction("MORR01", hostToken, "place_piece", { pos: 2 });
  assert.equal(res.success, true);
  assert.equal(res.room?.nineMensMorris?.millToClaim, true, "Mill should be flagged to claim");
  assert.equal(res.room?.nineMensMorris?.currentTurn, 1, "P1 keeps turn to remove piece");

  // P1 removes P2's piece at 8
  res = handleRoomAction("MORR01", hostToken, "remove_piece", { pos: 8 });
  assert.equal(res.success, true);
  assert.equal(res.room?.nineMensMorris?.board[8], null, "P2's piece at 8 should be removed");
  assert.equal(res.room?.nineMensMorris?.millToClaim, false);
  assert.equal(res.room?.nineMensMorris?.currentTurn, 2, "Turn passes to P2");
});

test("Multiplayer: Scoped random matchmaking pairs players strictly for the selected game", () => {
  // Player 1 queues for Memory Duel
  const memQueue = matchmakeRoom("memory-duel", "MemoryMaster");
  assert.equal(memQueue.matched, false);
  assert.equal(memQueue.playerNumber, 1);
  assert.equal(memQueue.room.gameType, "memory-duel");

  // Player 2 queues for Reaction Duel -> should NOT match with Memory Duel room!
  const reflexQueue = matchmakeRoom("reaction-duel", "SpeedDemon");
  assert.equal(reflexQueue.matched, false);
  assert.equal(reflexQueue.playerNumber, 1);
  assert.equal(reflexQueue.room.gameType, "reaction-duel");
  assert.notEqual(memQueue.room.code, reflexQueue.room.code);

  // Player 3 queues for Memory Duel -> MUST match with Player 1's Memory Duel room!
  const memChallenger = matchmakeRoom("memory-duel", "MemoryChallenger");
  assert.equal(memChallenger.matched, true);
  assert.equal(memChallenger.playerNumber, 2);
  assert.equal(memChallenger.room.code, memQueue.room.code);
  assert.equal(memChallenger.room.status, "playing");
  assert.equal(memChallenger.room.players.length, 2);
});

test("Multiplayer: Temporary in-game chat messages are ephemeral and stay in session memory", () => {
  const { room, playerToken: hostToken } = createRoom(
    "tic-tac-toe",
    "SenderP1",
    "CHAT01",
    { isPublic: true }
  );

  const guestRes = joinRoom("CHAT01", "ReceiverP2");
  const guestToken = guestRes.playerToken!;

  // P1 sends a chat message
  let res = handleRoomAction("CHAT01", hostToken, "send_chat", { text: "Good luck! 🔥" });
  assert.equal(res.success, true);
  assert.equal(res.room?.messages.length, 1);
  assert.equal(res.room?.messages[0].text, "Good luck! 🔥");
  assert.equal(res.room?.messages[0].sender, 1);
  assert.equal(res.room?.messages[0].senderName, "SenderP1");

  // P2 replies
  res = handleRoomAction("CHAT01", guestToken, "send_chat", { text: "You too! 👏" });
  assert.equal(res.success, true);
  assert.equal(res.room?.messages.length, 2);
  assert.equal(res.room?.messages[1].text, "You too! 👏");
  assert.equal(res.room?.messages[1].sender, 2);

  // Clearing chat works
  res = handleRoomAction("CHAT01", hostToken, "clear_chat");
  assert.equal(res.success, true);
  assert.equal(res.room?.messages.length, 0);
});

