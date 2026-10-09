// Server-side in-memory store for cross-device multiplayer games
// Attached to globalThis to persist across hot reloads in Next.js development

export type MultiplayerGameType =
  | "dots-and-boxes"
  | "nine-mens-morris"
  | "connect-4"
  | "memory-duel"
  | "tic-tac-toe"
  | "reaction-duel"
  | "number-guess";

export interface Player {
  id: string; // unique token for the player
  name: string;
  role: "host" | "guest";
  playerNumber: 1 | 2;
  lastSeen: number;
}

export interface GuessRecord {
  player: 1 | 2;
  playerName: string;
  guess: number;
  hint: string;
  type: "too-high" | "too-low" | "hot" | "warm" | "correct";
  timestamp: number;
}

export interface NumberGuessState {
  targetNumber: number;
  maxAttemptsPerPlayer: number;
  history: GuessRecord[];
  currentTurn: 1 | 2;
  p1Attempts: number;
  p2Attempts: number;
}

export interface TicTacToeState {
  board: (string | null)[]; // 9 cells
  currentTurn: 1 | 2;
  winningLine: number[] | null;
}

export interface ConnectFourState {
  board: (1 | 2 | null)[]; // 42 cells: 6 rows x 7 cols. index = row * 7 + col.
  currentTurn: 1 | 2;
  winningCells: number[] | null;
  lastMove: { row: number; col: number; player: 1 | 2 } | null;
}

export interface MemoryCardItem {
  id: number;
  iconKey: string;
  image?: string;
  isWildcard?: boolean;
  isNullCard?: boolean;
  matched: boolean;
  matchedBy?: 1 | 2;
}

export interface MemoryDuelState {
  cards: MemoryCardItem[];
  flippedIndices: number[]; // indices of currently face-up cards
  flipTimestamp?: number | null; // when non-matching cards were revealed
  currentTurn: 1 | 2;
  p1Score: number;
  p2Score: number;
  totalPairs: number;
  cols: number; // number of columns (e.g. 4, 6, 8, 10, 16)
  gridSize: string; // e.g. "4x4", "6x6", "8x8", "16x16"
}

export interface ReactionDuelState {
  round: number;
  targetScore: number;
  phase: "waiting" | "ready" | "go" | "round-over";
  goTimestamp: number | null;
  scheduledGoTime: number | null;
  p1TapTime: number | null; // reaction time in ms, or -1 for false start
  p2TapTime: number | null;
  roundWinner: 1 | 2 | "draw" | null;
}

export interface DotsAndBoxesState {
  gridSize: number; // 3, 4, 5
  edges: string[]; // ["h-0-0", "v-1-2", ...]
  boxes: Record<string, 1 | 2>; // "r-c": 1 | 2
  currentTurn: 1 | 2;
  p1Score: number;
  p2Score: number;
  lastEdge: string | null;
}

export interface NineMensMorrisState {
  board: (1 | 2 | null)[]; // 24 spots
  p1Hand: number;
  p2Hand: number;
  p1Alive: number;
  p2Alive: number;
  currentTurn: 1 | 2;
  phase: "place" | "move" | "fly";
  millToClaim: boolean;
  flyAllowed: boolean;
}

export interface CustomRoomOptions {
  isPublic?: boolean;
  timerSeconds?: number;
  dotsGridSize?: number;
  memoryGridSize?: string;
  morrisFlyAllowed?: boolean;
  reactionTargetScore?: number;
  numberGuessMaxAttempts?: number;
}

export interface QuickMessage {
  id: string;
  sender: 1 | 2;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface MultiplayerRoom {
  code: string;
  gameType: MultiplayerGameType;
  createdAt: number;
  lastActivity: number;
  status: "waiting" | "playing" | "finished";
  players: Player[];
  scores: { p1: number; p2: number };
  winner: 1 | 2 | "draw" | null;
  winReason?: string;
  startingPlayer: 1 | 2;
  isPublic: boolean;
  customOptions?: CustomRoomOptions;

  // Game specific state
  numberGuess?: NumberGuessState;
  ticTacToe?: TicTacToeState;
  reactionDuel?: ReactionDuelState;
  connectFour?: ConnectFourState;
  memoryDuel?: MemoryDuelState;
  dotsAndBoxes?: DotsAndBoxesState;
  nineMensMorris?: NineMensMorrisState;

  messages: QuickMessage[];
}

export const MORRIS_ADJACENCY: Record<number, number[]> = {
  0: [1, 7],
  1: [0, 2, 9],
  2: [1, 3],
  3: [2, 4, 11],
  4: [3, 5],
  5: [4, 6, 13],
  6: [5, 7],
  7: [0, 6, 15],

  8: [9, 15],
  9: [1, 8, 10, 17],
  10: [9, 11],
  11: [3, 10, 12, 19],
  12: [11, 13],
  13: [5, 12, 14, 21],
  14: [13, 15],
  15: [7, 8, 14, 23],

  16: [17, 23],
  17: [9, 16, 18],
  18: [17, 19],
  19: [11, 18, 20],
  20: [19, 21],
  21: [13, 20, 22],
  22: [21, 23],
  23: [15, 16, 22],
};

export const MORRIS_MILLS: number[][] = [
  // Outer square
  [0, 1, 2],
  [2, 3, 4],
  [4, 5, 6],
  [6, 7, 0],
  // Middle square
  [8, 9, 10],
  [10, 11, 12],
  [12, 13, 14],
  [14, 15, 8],
  // Inner square
  [16, 17, 18],
  [18, 19, 20],
  [20, 21, 22],
  [22, 23, 16],
  // Cross bridges
  [1, 9, 17],
  [3, 11, 19],
  [5, 13, 21],
  [7, 15, 23],
];

export function checkMorrisMillFormed(board: (1 | 2 | null)[], pos: number, player: 1 | 2): boolean {
  for (const mill of MORRIS_MILLS) {
    if (mill.includes(pos)) {
      if (mill.every((p) => board[p] === player)) {
        return true;
      }
    }
  }
  return false;
}

export function isPartOfAnyMill(board: (1 | 2 | null)[], pos: number, player: 1 | 2): boolean {
  return checkMorrisMillFormed(board, pos, player);
}

declare global {
  // eslint-disable-next-line no-var
  var __multiplayerRooms: Map<string, MultiplayerRoom> | undefined;
}

const rooms: Map<string, MultiplayerRoom> =
  globalThis.__multiplayerRooms ?? new Map<string, MultiplayerRoom>();

globalThis.__multiplayerRooms = rooms;

// Generate an easy 4-digit code (e.g. 4829)
export function generateRoomCode(): string {
  let code = "";
  let attempts = 0;
  while (attempts < 100) {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    if (!rooms.has(code)) return code;
    attempts++;
  }
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Clean rooms inactive for > 2 hours
function pruneStaleRooms() {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.lastActivity > 2 * 60 * 60 * 1000) {
      rooms.delete(code);
    }
  }
}

// Initialize specific game state
function initGameState(
  gameType: MultiplayerGameType,
  startingPlayer: 1 | 2 = 1,
  config?: CustomRoomOptions
) {
  const state: Partial<MultiplayerRoom> = {};

  if (gameType === "number-guess") {
    state.numberGuess = {
      targetNumber: Math.floor(Math.random() * 100) + 1,
      maxAttemptsPerPlayer: config?.numberGuessMaxAttempts || 5,
      history: [],
      currentTurn: startingPlayer,
      p1Attempts: 0,
      p2Attempts: 0,
    };
  } else if (gameType === "tic-tac-toe") {
    state.ticTacToe = {
      board: Array(9).fill(null),
      currentTurn: startingPlayer,
      winningLine: null,
    };
  } else if (gameType === "reaction-duel") {
    state.reactionDuel = {
      round: 1,
      targetScore: config?.reactionTargetScore || 3,
      phase: "waiting",
      goTimestamp: null,
      scheduledGoTime: null,
      p1TapTime: null,
      p2TapTime: null,
      roundWinner: null,
    };
  } else if (gameType === "connect-4") {
    state.connectFour = {
      board: Array(42).fill(null),
      currentTurn: startingPlayer,
      winningCells: null,
      lastMove: null,
    };
  } else if (gameType === "memory-duel") {
    const size = config?.memoryGridSize || "4x6";
    let pairs = 12;
    let cols = 6;
    if (size === "3x4") {
      pairs = 6;
      cols = 4;
    } else if (size === "4x4") {
      pairs = 8;
      cols = 4;
    }

    state.memoryDuel = {
      cards: generateMemoryCards(pairs, size),
      flippedIndices: [],
      flipTimestamp: null,
      currentTurn: startingPlayer,
      p1Score: 0,
      p2Score: 0,
      totalPairs: pairs,
      cols,
      gridSize: size,
    };
  } else if (gameType === "dots-and-boxes") {
    const gridSize = config?.dotsGridSize || 3;
    state.dotsAndBoxes = {
      gridSize,
      edges: [],
      boxes: {},
      currentTurn: startingPlayer,
      p1Score: 0,
      p2Score: 0,
      lastEdge: null,
    };
  } else if (gameType === "nine-mens-morris") {
    state.nineMensMorris = {
      board: Array(24).fill(null),
      p1Hand: 9,
      p2Hand: 9,
      p1Alive: 0,
      p2Alive: 0,
      currentTurn: startingPlayer,
      phase: "place",
      millToClaim: false,
      flyAllowed: config?.morrisFlyAllowed ?? true,
    };
  }

  return state;
}

export interface CardImageItem {
  key: string;
  name: string;
  image: string;
}

export const CARD_IMAGE_ITEMS: CardImageItem[] = [
  { key: "balmond", name: "Balmond", image: "/images/balmond-card.png" },
  { key: "banana", name: "Banana", image: "/images/banana-card.png" },
  { key: "burger", name: "Burger", image: "/images/burger-card.png" },
  { key: "diamond", name: "Diamond", image: "/images/diamond-card.png" },
  { key: "dragon", name: "Dragon", image: "/images/dragon-card.png" },
  { key: "fox", name: "Fox", image: "/images/fox-card.png" },
  { key: "franco", name: "Franco", image: "/images/franco-card.png" },
  { key: "heart", name: "Heart", image: "/images/heart-card.png" },
  { key: "lightning", name: "Lightning", image: "/images/lightning-card.png" },
  { key: "lion", name: "Lion", image: "/images/lion-card.png" },
  { key: "moon", name: "Moon", image: "/images/moon-card.png" },
  { key: "muzan", name: "Muzan", image: "/images/muzan-card.png" },
  { key: "panda", name: "Panda", image: "/images/panda-card.png" },
  { key: "pizza", name: "Pizza", image: "/images/pizza-card.png" },
  { key: "rocket", name: "Rocket", image: "/images/rocket-card.png" },
  { key: "sun", name: "Sun", image: "/images/sun-card.png" },
];

export const RICH_MEMORY_ITEMS = [
  "🚀", "💎", "⚡", "🔥", "❤️", "⭐", "🛡️", "👑", "🏆", "🔑",
  "🎁", "🎵", "🌙", "☀️", "🧭", "🍕", "🍔", "🍦", "🍩", "🍎",
  "🥑", "🐶", "🐱", "🦊", "🦁", "🐯", "🐼", "🐸", "🐙", "🦋",
  "🦄", "⚽", "🏀", "🎮", "🎲", "🎸", "🎨", "🚗", "✈️", "🛸",
  "🌈", "🌊", "🌋", "🪐", "💡", "🔮", "💣", "🎯", "🏹", "🪄",
  "🏰", "🏝️", "🎪", "🎭", "🧩", "🧸", "⚔️", "🔔", "🧲", "🔦",
  "🔬", "🔭", "📡", "🔋", "💻", "📱", "⌚", "🪙", "💰", "📦",
  "⏰", "⏳", "🔒", "⚙️", "🧪", "🧬", "🎈", "🪩", "🧿", "🍄",
  "🦀", "🦞", "🦐", "🦑", "🐍", "🦎", "🦖", "🦕", "🐬", "🐳",
  "🦈", "🐊", "🐆", "🦓", "🦍", "🐘", "🐪", "🦒", "🦘", "🐎",
  "🐑", "🦌", "🐓", "🦚", "🦜", "🦢", "🕊️", "🐇", "🦝", "🦦",
  "🍇", "🍉", "🍌", "🍒", "🍑", "🍍", "🥥", "🥝", "🌽", "🥕",
  "🥨", "🥞", "🍣", "🌮", "🍿", "🍪", "🍫", "🧁", "🎂", "☕",
];

export function generateMemoryCards(pairCount = 12, gridSize = "4x6"): MemoryCardItem[] {
  const count = Math.min(pairCount, CARD_IMAGE_ITEMS.length);
  const chosen = [...CARD_IMAGE_ITEMS].sort(() => Math.random() - 0.5).slice(0, count);
  const deck: MemoryCardItem[] = [];
  let idCounter = 1;

  chosen.forEach((c) => {
    deck.push({ id: idCounter++, iconKey: c.key, image: c.image, matched: false });
    deck.push({ id: idCounter++, iconKey: c.key, image: c.image, matched: false });
  });

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

export function createRoom(
  gameType: MultiplayerGameType,
  hostName: string,
  preferredCode?: string,
  customOptions?: CustomRoomOptions
): { room: MultiplayerRoom; playerToken: string } {
  pruneStaleRooms();

  let code = "";
  if (preferredCode && preferredCode.trim().length >= 3) {
    const sanitized = preferredCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    if (sanitized.length >= 3 && !rooms.has(sanitized)) {
      code = sanitized;
    }
  }

  if (!code) {
    code = generateRoomCode();
  }

  const playerToken = "tok_" + Math.random().toString(36).substring(2, 10);
  const host: Player = {
    id: playerToken,
    name: hostName.trim() || "Player 1",
    role: "host",
    playerNumber: 1,
    lastSeen: Date.now(),
  };

  const initialGameData = initGameState(gameType, 1, customOptions);

  const room: MultiplayerRoom = {
    code,
    gameType,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    status: "waiting",
    players: [host],
    scores: { p1: 0, p2: 0 },
    winner: null,
    startingPlayer: 1,
    isPublic: customOptions?.isPublic ?? true,
    customOptions,
    messages: [],
    ...initialGameData,
  };

  rooms.set(code, room);
  return { room, playerToken };
}

export function listOpenRooms(): {
  code: string;
  gameType: MultiplayerGameType;
  hostName: string;
  createdAt: number;
  customOptions?: CustomRoomOptions;
}[] {
  pruneStaleRooms();
  const openRooms: {
    code: string;
    gameType: MultiplayerGameType;
    hostName: string;
    createdAt: number;
    customOptions?: CustomRoomOptions;
  }[] = [];

  for (const room of rooms.values()) {
    if (room.status === "waiting" && room.isPublic !== false && room.players.length === 1) {
      openRooms.push({
        code: room.code,
        gameType: room.gameType,
        hostName: room.players[0]?.name || "Host",
        createdAt: room.createdAt,
        customOptions: room.customOptions,
      });
    }
  }

  return openRooms.sort((a, b) => b.createdAt - a.createdAt);
}

export function joinRoom(
  roomCode: string,
  playerName: string
): { success: boolean; room?: MultiplayerRoom; playerToken?: string; error?: string } {
  pruneStaleRooms();
  const code = roomCode.trim().toUpperCase();
  const room = rooms.get(code);

  if (!room) {
    return { success: false, error: "Game room not found. Please check the code." };
  }

  if (room.players.length >= 2) {
    return { success: false, error: "This game room is already full (2 players max)." };
  }

  const playerToken = "tok_" + Math.random().toString(36).substring(2, 10);
  const guest: Player = {
    id: playerToken,
    name: playerName.trim() || "Player 2",
    role: "guest",
    playerNumber: 2,
    lastSeen: Date.now(),
  };

  room.players.push(guest);
  room.status = "playing";
  room.lastActivity = Date.now();

  // If reaction-duel, schedule first round
  if (room.gameType === "reaction-duel" && room.reactionDuel) {
    scheduleReactionRound(room);
  }

  return { success: true, room, playerToken };
}

export function getRoom(
  roomCode: string,
  playerToken?: string
): { room?: MultiplayerRoom; playerNumber?: 1 | 2; error?: string } {
  const code = roomCode.trim().toUpperCase();
  const room = rooms.get(code);

  if (!room) {
    return { error: "Room not found" };
  }

  // Update reaction duel phase & memory duel auto-hide timer
  checkReactionTimer(room);
  checkMemoryDuelTimer(room);

  let playerNumber: 1 | 2 | undefined;
  if (playerToken) {
    const player = room.players.find((p) => p.id === playerToken);
    if (player) {
      player.lastSeen = Date.now();
      playerNumber = player.playerNumber;
    }
  }

  room.lastActivity = Date.now();
  return { room, playerNumber };
}

function checkMemoryDuelTimer(room: MultiplayerRoom) {
  if (room.gameType !== "memory-duel" || !room.memoryDuel) return;
  const md = room.memoryDuel;
  if (md.flippedIndices.length >= 2 && md.flipTimestamp) {
    if (Date.now() - md.flipTimestamp >= 1200) {
      md.flippedIndices = [];
      md.flipTimestamp = null;
    }
  }
}

function checkReactionTimer(room: MultiplayerRoom) {
  if (room.gameType !== "reaction-duel" || !room.reactionDuel) return;
  const rd = room.reactionDuel;
  const now = Date.now();

  if (rd.phase === "ready" && rd.scheduledGoTime && now >= rd.scheduledGoTime) {
    rd.phase = "go";
    rd.goTimestamp = rd.scheduledGoTime;
  }
}

function scheduleReactionRound(room: MultiplayerRoom) {
  if (!room.reactionDuel) return;
  const rd = room.reactionDuel;
  rd.phase = "ready";
  rd.goTimestamp = null;
  rd.p1TapTime = null;
  rd.p2TapTime = null;
  rd.roundWinner = null;
  // Delay between 2.2s and 5.0s
  const delay = Math.floor(2200 + Math.random() * 2800);
  rd.scheduledGoTime = Date.now() + delay;
}

// Handle in-game actions
export function handleRoomAction(
  roomCode: string,
  playerToken: string,
  action: string,
  payload?: any
): { success: boolean; room?: MultiplayerRoom; error?: string } {
  const code = roomCode.trim().toUpperCase();
  const room = rooms.get(code);

  if (!room) {
    return { success: false, error: "Room not found" };
  }

  const player = room.players.find((p) => p.id === playerToken);
  if (!player) {
    return { success: false, error: "Invalid player token" };
  }

  room.lastActivity = Date.now();
  player.lastSeen = Date.now();

  // 1. Quick Chat / Reaction message
  if (action === "send_message") {
    const text = String(payload?.text || "").trim();
    if (text) {
      const msg: QuickMessage = {
        id: "msg_" + Math.random().toString(36).substring(2, 8),
        sender: player.playerNumber,
        senderName: player.name,
        text: text.slice(0, 60),
        timestamp: Date.now(),
      };
      room.messages.push(msg);
      if (room.messages.length > 15) {
        room.messages.shift();
      }
    }
    return { success: true, room };
  }

  // 2. Rematch
  if (action === "rematch") {
    room.winner = null;
    room.winReason = undefined;
    room.status = "playing";
    room.startingPlayer = room.startingPlayer === 1 ? 2 : 1;

    const config = room.customOptions;
    const newGame = initGameState(room.gameType, room.startingPlayer, config);
    Object.assign(room, newGame);

    if (room.gameType === "reaction-duel" && room.reactionDuel) {
      scheduleReactionRound(room);
    }

    return { success: true, room };
  }

  // 3. Number Guessing Action
  if (room.gameType === "number-guess" && action === "guess") {
    const state = room.numberGuess;
    if (!state) return { success: false, error: "Game not initialized" };
    if (room.status !== "playing") return { success: false, error: "Game is not active" };

    if (state.currentTurn !== player.playerNumber) {
      return { success: false, error: "It is not your turn yet!" };
    }

    const num = parseInt(payload?.guess);
    if (isNaN(num) || num < 1 || num > 100) {
      return { success: false, error: "Guess must be a number between 1 and 100" };
    }

    if (state.history.some((h) => h.guess === num)) {
      return { success: false, error: `Number ${num} was already guessed!` };
    }

    if (player.playerNumber === 1) state.p1Attempts++;
    else state.p2Attempts++;

    if (num === state.targetNumber) {
      // WINNER!
      state.history.unshift({
        player: player.playerNumber,
        playerName: player.name,
        guess: num,
        hint: "Correct! That was the secret number!",
        type: "correct",
        timestamp: Date.now(),
      });
      room.status = "finished";
      room.winner = player.playerNumber;
      room.winReason = `${player.name} guessed the secret number ${num}!`;
      room.scores[player.playerNumber === 1 ? "p1" : "p2"] += 1;
      return { success: true, room };
    }

    // High / Low Evaluation
    const isTooLow = num < state.targetNumber;
    const diff = Math.abs(state.targetNumber - num);
    let hint = "";
    let type: GuessRecord["type"] = isTooLow ? "too-low" : "too-high";

    if (diff <= 5) {
      hint = isTooLow ? "Boiling Hot! (Go slightly higher)" : "Boiling Hot! (Go slightly lower)";
      type = "hot";
    } else if (diff <= 15) {
      hint = isTooLow ? "Warm! (Go higher)" : "Warm! (Go lower)";
      type = "warm";
    } else {
      hint = isTooLow ? "Too Low! (Go much higher)" : "Too High! (Go much lower)";
      type = isTooLow ? "too-low" : "too-high";
    }

    state.history.unshift({
      player: player.playerNumber,
      playerName: player.name,
      guess: num,
      hint,
      type,
      timestamp: Date.now(),
    });

    // Check if both reached max attempts
    if (state.p1Attempts >= state.maxAttemptsPerPlayer && state.p2Attempts >= state.maxAttemptsPerPlayer) {
      room.status = "finished";
      room.winner = "draw";
      room.winReason = `Both players used all attempts! Secret number was ${state.targetNumber}.`;
    } else {
      // Switch turn
      state.currentTurn = state.currentTurn === 1 ? 2 : 1;
    }

    return { success: true, room };
  }

  // 4. Tic-Tac-Toe Action
  if (room.gameType === "tic-tac-toe" && action === "move") {
    const state = room.ticTacToe;
    if (!state) return { success: false, error: "Game not initialized" };
    if (room.status !== "playing") return { success: false, error: "Game is not active" };

    if (state.currentTurn !== player.playerNumber) {
      return { success: false, error: "It is not your turn!" };
    }

    const cellIndex = Number(payload?.index);
    if (cellIndex < 0 || cellIndex > 8 || state.board[cellIndex] !== null) {
      return { success: false, error: "Invalid move" };
    }

    const mark = player.playerNumber === 1 ? "X" : "O";
    state.board[cellIndex] = mark;

    // Check winning conditions
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6],             // Diagonals
    ];

    let hasWon = false;
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
        state.winningLine = pattern;
        hasWon = true;
        break;
      }
    }

    if (hasWon) {
      room.status = "finished";
      room.winner = player.playerNumber;
      room.winReason = `${player.name} (${mark}) lined up 3 in a row!`;
      room.scores[player.playerNumber === 1 ? "p1" : "p2"] += 1;
    } else if (state.board.every((cell) => cell !== null)) {
      room.status = "finished";
      room.winner = "draw";
      room.winReason = "Grid is full! It's a draw.";
    } else {
      state.currentTurn = state.currentTurn === 1 ? 2 : 1;
    }

    return { success: true, room };
  }

  // 5. Reaction Duel Action
  if (room.gameType === "reaction-duel") {
    const rd = room.reactionDuel;
    if (!rd) return { success: false, error: "Game not initialized" };
    checkReactionTimer(room);

    if (action === "start_round") {
      if (rd.phase === "round-over" || rd.phase === "waiting") {
        scheduleReactionRound(room);
      }
      return { success: true, room };
    }

    if (action === "tap") {
      if (rd.phase === "ready") {
        // FALSE START!
        const opponentNum = player.playerNumber === 1 ? 2 : 1;
        rd.phase = "round-over";
        rd.roundWinner = opponentNum;
        if (player.playerNumber === 1) rd.p1TapTime = -1;
        else rd.p2TapTime = -1;

        room.scores[opponentNum === 1 ? "p1" : "p2"] += 1;

        if (room.scores.p1 >= rd.targetScore || room.scores.p2 >= rd.targetScore) {
          room.status = "finished";
          room.winner = room.scores.p1 >= rd.targetScore ? 1 : 2;
          const winnerObj = room.players.find((p) => p.playerNumber === room.winner);
          room.winReason = `${winnerObj?.name || "Player"} won the duel with ${rd.targetScore} points!`;
        }
        return { success: true, room };
      }

      if (rd.phase === "go" && rd.goTimestamp) {
        const reactionMs = Math.max(1, Date.now() - rd.goTimestamp);
        if (player.playerNumber === 1) rd.p1TapTime = reactionMs;
        else rd.p2TapTime = reactionMs;

        rd.phase = "round-over";
        rd.roundWinner = player.playerNumber;
        room.scores[player.playerNumber === 1 ? "p1" : "p2"] += 1;

        if (room.scores.p1 >= rd.targetScore || room.scores.p2 >= rd.targetScore) {
          room.status = "finished";
          room.winner = room.scores.p1 >= rd.targetScore ? 1 : 2;
          const winnerObj = room.players.find((p) => p.playerNumber === room.winner);
          room.winReason = `${winnerObj?.name || "Player"} won the reflex duel with ${rd.targetScore} points!`;
        }

        return { success: true, room };
      }
    }
  }

  // 6. Connect 4 Action
  if (room.gameType === "connect-4" && action === "drop_disc") {
    const state = room.connectFour;
    if (!state) return { success: false, error: "Game not initialized" };
    if (room.status !== "playing") return { success: false, error: "Game is not active" };

    if (state.currentTurn !== player.playerNumber) {
      return { success: false, error: "It is not your turn!" };
    }

    const col = Number(payload?.col);
    if (isNaN(col) || col < 0 || col > 6) {
      return { success: false, error: "Invalid column (must be 0 to 6)" };
    }

    // Find lowest available row in column (from bottom row 5 up to top row 0)
    let targetRow = -1;
    for (let r = 5; r >= 0; r--) {
      if (state.board[r * 7 + col] === null) {
        targetRow = r;
        break;
      }
    }

    if (targetRow === -1) {
      return { success: false, error: "This column is already full!" };
    }

    const cellIndex = targetRow * 7 + col;
    state.board[cellIndex] = player.playerNumber;
    state.lastMove = { row: targetRow, col, player: player.playerNumber };

    // Check 4-in-a-row
    const winInfo = checkConnectFourWinner(state.board);
    if (winInfo) {
      state.winningCells = winInfo.cells;
      room.status = "finished";
      room.winner = player.playerNumber;
      const colorName = player.playerNumber === 1 ? "Red" : "Yellow";
      room.winReason = `${player.name} (${colorName}) connected 4 in a row!`;
      room.scores[player.playerNumber === 1 ? "p1" : "p2"] += 1;
    } else if (state.board.every((cell) => cell !== null)) {
      room.status = "finished";
      room.winner = "draw";
      room.winReason = "The grid is completely full! It's a draw.";
    } else {
      state.currentTurn = state.currentTurn === 1 ? 2 : 1;
    }

    return { success: true, room };
  }

  // 7. Memory Duel Action
  if (room.gameType === "memory-duel") {
    const state = room.memoryDuel;
    if (!state) return { success: false, error: "Game not initialized" };
    if (room.status !== "playing") return { success: false, error: "Game is not active" };

    if (action === "flip_card") {
      if (state.currentTurn !== player.playerNumber) {
        return { success: false, error: "It is not your turn!" };
      }

      const cardIdx = Number(payload?.index);
      if (isNaN(cardIdx) || cardIdx < 0 || cardIdx >= state.cards.length) {
        return { success: false, error: "Invalid card index" };
      }

      if (state.cards[cardIdx].matched || state.cards[cardIdx].isWildcard) {
        return { success: false, error: "Card is already matched" };
      }

      // If already 2 cards face up from a previous non-match, clear them on next flip
      if (state.flippedIndices.length >= 2) {
        state.flippedIndices = [];
        state.flipTimestamp = null;
      }

      if (state.flippedIndices.includes(cardIdx)) {
        return { success: true, room };
      }

      if (state.flippedIndices.length === 0) {
        state.flippedIndices = [cardIdx];
        state.flipTimestamp = null;
      } else if (state.flippedIndices.length === 1) {
        const firstIdx = state.flippedIndices[0];
        state.flippedIndices = [firstIdx, cardIdx];

        if (state.cards[firstIdx].iconKey === state.cards[cardIdx].iconKey) {
          // MATCH!
          state.cards[firstIdx].matched = true;
          state.cards[cardIdx].matched = true;
          state.cards[firstIdx].matchedBy = player.playerNumber;
          state.cards[cardIdx].matchedBy = player.playerNumber;

          if (player.playerNumber === 1) state.p1Score++;
          else state.p2Score++;

          state.flippedIndices = [];
          state.flipTimestamp = null;

          // Check if all 12 pairs are matched
          if (state.cards.every((c) => c.matched)) {
            room.status = "finished";
            if (state.p1Score > state.p2Score) room.winner = 1;
            else if (state.p2Score > state.p1Score) room.winner = 2;
            else room.winner = "draw";

            room.scores.p1 = state.p1Score;
            room.scores.p2 = state.p2Score;
            room.winReason =
              room.winner === "draw"
                ? `Stalemate! Tied at ${state.p1Score} pairs each.`
                : `${player.name} won with ${player.playerNumber === 1 ? state.p1Score : state.p2Score} matched pairs!`;
          }
        } else {
          // NO MATCH: Record flip timestamp so cards auto-hide after 1.2s, turn passes to opponent
          state.flipTimestamp = Date.now();
          state.currentTurn = state.currentTurn === 1 ? 2 : 1;
        }
      }

      return { success: true, room };
    }

    if (action === "clear_flips") {
      state.flippedIndices = [];
      return { success: true, room };
    }
  }

  // 8. Dots and Boxes Action
  if (room.gameType === "dots-and-boxes" && action === "claim_edge") {
    const state = room.dotsAndBoxes;
    if (!state) return { success: false, error: "Game not initialized" };
    if (room.status !== "playing") return { success: false, error: "Game is not active" };

    if (state.currentTurn !== player.playerNumber) {
      return { success: false, error: "It is not your turn!" };
    }

    const edgeKey = String(payload?.edge || "").trim();
    if (!edgeKey || state.edges.includes(edgeKey)) {
      return { success: false, error: "Edge already claimed or invalid" };
    }

    state.edges.push(edgeKey);
    state.lastEdge = edgeKey;

    const edgesSet = new Set(state.edges);
    const gSize = state.gridSize;
    let boxesCompletedThisTurn = 0;

    for (let r = 0; r < gSize - 1; r++) {
      for (let c = 0; c < gSize - 1; c++) {
        const boxKey = `${r}-${c}`;
        if (state.boxes[boxKey]) continue;

        const top = `h-${r}-${c}`;
        const bottom = `h-${r + 1}-${c}`;
        const left = `v-${r}-${c}`;
        const right = `v-${r}-${c + 1}`;

        if (
          edgesSet.has(top) &&
          edgesSet.has(bottom) &&
          edgesSet.has(left) &&
          edgesSet.has(right)
        ) {
          state.boxes[boxKey] = player.playerNumber;
          boxesCompletedThisTurn++;
          if (player.playerNumber === 1) {
            state.p1Score++;
          } else {
            state.p2Score++;
          }
        }
      }
    }

    const totalPossibleBoxes = (gSize - 1) * (gSize - 1);
    const totalClaimedBoxes = Object.keys(state.boxes).length;

    if (totalClaimedBoxes >= totalPossibleBoxes) {
      room.status = "finished";
      room.scores.p1 = state.p1Score;
      room.scores.p2 = state.p2Score;

      if (state.p1Score > state.p2Score) {
        room.winner = 1;
        room.winReason = `${room.players[0]?.name || "Player 1"} won with ${state.p1Score} squares!`;
      } else if (state.p2Score > state.p1Score) {
        room.winner = 2;
        room.winReason = `${room.players[1]?.name || "Player 2"} won with ${state.p2Score} squares!`;
      } else {
        room.winner = "draw";
        room.winReason = `Draw match! Tied at ${state.p1Score} squares each.`;
      }
    } else {
      if (boxesCompletedThisTurn === 0) {
        state.currentTurn = state.currentTurn === 1 ? 2 : 1;
      }
    }

    return { success: true, room };
  }

  // 9. Nine Men's Morris Actions
  if (room.gameType === "nine-mens-morris") {
    const state = room.nineMensMorris;
    if (!state) return { success: false, error: "Game not initialized" };
    if (room.status !== "playing") return { success: false, error: "Game is not active" };

    if (state.currentTurn !== player.playerNumber) {
      return { success: false, error: "It is not your turn!" };
    }

    // A. Remove Piece (when mill was formed)
    if (action === "remove_piece") {
      if (!state.millToClaim) {
        return { success: false, error: "No mill has been formed to claim!" };
      }

      const pos = Number(payload?.pos);
      if (isNaN(pos) || pos < 0 || pos >= 24) {
        return { success: false, error: "Invalid board position" };
      }

      const opponentNum = player.playerNumber === 1 ? 2 : 1;
      if (state.board[pos] !== opponentNum) {
        return { success: false, error: "You can only remove an opponent's piece!" };
      }

      const opponentPieces = state.board
        .map((p, idx) => (p === opponentNum ? idx : -1))
        .filter((idx) => idx !== -1);
      const nonMillOpponentPieces = opponentPieces.filter(
        (idx) => !isPartOfAnyMill(state.board, idx, opponentNum)
      );

      if (nonMillOpponentPieces.length > 0 && isPartOfAnyMill(state.board, pos, opponentNum)) {
        return { success: false, error: "Cannot remove a piece that is part of a mill unless no other pieces are available!" };
      }

      state.board[pos] = null;
      if (opponentNum === 1) state.p1Alive--;
      else state.p2Alive--;
      state.millToClaim = false;

      // Check victory
      if (state.p1Hand === 0 && state.p2Hand === 0 && (opponentNum === 1 ? state.p1Alive : state.p2Alive) < 3) {
        room.status = "finished";
        room.winner = player.playerNumber;
        room.scores[player.playerNumber === 1 ? "p1" : "p2"] += 1;
        room.winReason = `${player.name} reduced opponent to 2 pieces!`;
        return { success: true, room };
      }

      if (state.phase === "place" && state.p1Hand === 0 && state.p2Hand === 0) {
        state.phase = "move";
      }

      state.currentTurn = opponentNum;

      if (state.phase !== "place") {
        const oppAlive = opponentNum === 1 ? state.p1Alive : state.p2Alive;
        const oppCanFly = oppAlive === 3 && state.flyAllowed;
        if (!oppCanFly) {
          const hasLegalMove = state.board.some((p, from) => {
            if (p !== opponentNum) return false;
            const neighbors = MORRIS_ADJACENCY[from] || [];
            return neighbors.some((to) => state.board[to] === null);
          });

          if (!hasLegalMove) {
            room.status = "finished";
            room.winner = player.playerNumber;
            room.scores[player.playerNumber === 1 ? "p1" : "p2"] += 1;
            room.winReason = `${player.name} trapped all of opponent's pieces!`;
            return { success: true, room };
          }
        }
      }

      return { success: true, room };
    }

    // B. Place Piece (Phase 1)
    if (action === "place_piece") {
      if (state.phase !== "place" || state.millToClaim) {
        return { success: false, error: "Cannot place pieces right now" };
      }

      const pos = Number(payload?.pos);
      if (isNaN(pos) || pos < 0 || pos >= 24 || state.board[pos] !== null) {
        return { success: false, error: "Invalid placement position" };
      }

      state.board[pos] = player.playerNumber;
      if (player.playerNumber === 1) {
        state.p1Hand--;
        state.p1Alive++;
      } else {
        state.p2Hand--;
        state.p2Alive++;
      }

      if (checkMorrisMillFormed(state.board, pos, player.playerNumber)) {
        state.millToClaim = true;
        return { success: true, room };
      }

      if (state.p1Hand === 0 && state.p2Hand === 0) {
        state.phase = "move";
      }

      state.currentTurn = player.playerNumber === 1 ? 2 : 1;
      return { success: true, room };
    }

    // C. Move Piece (Phase 2 & 3)
    if (action === "move_piece") {
      if (state.phase === "place" || state.millToClaim) {
        return { success: false, error: "Cannot move pieces right now" };
      }

      const from = Number(payload?.from);
      const to = Number(payload?.to);

      if (isNaN(from) || isNaN(to) || from < 0 || from >= 24 || to < 0 || to >= 24) {
        return { success: false, error: "Invalid move coordinates" };
      }

      if (state.board[from] !== player.playerNumber || state.board[to] !== null) {
        return { success: false, error: "Illegal move destination" };
      }

      const myAlive = player.playerNumber === 1 ? state.p1Alive : state.p2Alive;
      const canFly = myAlive === 3 && state.flyAllowed;

      if (!canFly) {
        const neighbors = MORRIS_ADJACENCY[from] || [];
        if (!neighbors.includes(to)) {
          return { success: false, error: "Destination is not adjacent to source!" };
        }
      }

      state.board[from] = null;
      state.board[to] = player.playerNumber;

      if (checkMorrisMillFormed(state.board, to, player.playerNumber)) {
        state.millToClaim = true;
        return { success: true, room };
      }

      const nextPlayer = player.playerNumber === 1 ? 2 : 1;
      state.currentTurn = nextPlayer;

      const oppAlive = nextPlayer === 1 ? state.p1Alive : state.p2Alive;
      const oppCanFly = oppAlive === 3 && state.flyAllowed;
      if (!oppCanFly) {
        const hasLegalMove = state.board.some((p, f) => {
          if (p !== nextPlayer) return false;
          const neighbors = MORRIS_ADJACENCY[f] || [];
          return neighbors.some((t) => state.board[t] === null);
        });

        if (!hasLegalMove) {
          room.status = "finished";
          room.winner = player.playerNumber;
          room.scores[player.playerNumber === 1 ? "p1" : "p2"] += 1;
          room.winReason = `${player.name} trapped all of opponent's pieces!`;
          return { success: true, room };
        }
      }

      return { success: true, room };
    }
  }

  return { success: false, error: "Unsupported action" };
}

export function checkConnectFourWinner(board: (1 | 2 | null)[]): { winner: 1 | 2; cells: number[] } | null {
  const ROWS = 6;
  const COLS = 7;

  const getCell = (r: number, c: number) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
    return board[r * COLS + c];
  };

  const getIndex = (r: number, c: number) => r * COLS + c;

  const directions = [
    [0, 1],  // Horizontal
    [1, 0],  // Vertical
    [1, 1],  // Diagonal down-right
    [1, -1], // Diagonal down-left
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const val = getCell(r, c);
      if (!val) continue;

      for (const [dr, dc] of directions) {
        const cells: number[] = [getIndex(r, c)];
        let count = 1;

        for (let step = 1; step < 4; step++) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (getCell(nr, nc) === val) {
            cells.push(getIndex(nr, nc));
            count++;
          } else {
            break;
          }
        }

        if (count === 4) {
          return { winner: val, cells };
        }
      }
    }
  }

  return null;
}
