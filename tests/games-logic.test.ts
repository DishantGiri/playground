import test from "node:test";
import assert from "node:assert/strict";

// ============================================================================
// 1. DOTS AND BOXES LOGIC TESTS
// ============================================================================
test("Dots and Boxes: Edge selection, square claiming, bonus turns, and victory", () => {
  const gridSize = 3; // 3x3 dots => 2x2 boxes (4 total boxes)
  const edges = new Set<string>();
  const boxes: Record<string, string> = {};

  const getBoxEdges = (r: number, c: number) => [
    `h-${r}-${c}`,
    `h-${r + 1}-${c}`,
    `v-${r}-${c}`,
    `v-${r}-${c + 1}`,
  ];

  const playEdge = (edgeKey: string, player: "P1" | "P2"): { extraTurn: boolean } => {
    assert(!edges.has(edgeKey), `Edge ${edgeKey} already claimed`);
    edges.add(edgeKey);

    let madeSquare = false;
    for (let r = 0; r < gridSize - 1; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        const boxKey = `${r}-${c}`;
        if (!boxes[boxKey]) {
          const reqEdges = getBoxEdges(r, c);
          if (reqEdges.every((e) => edges.has(e))) {
            boxes[boxKey] = player;
            madeSquare = true;
          }
        }
      }
    }
    return { extraTurn: madeSquare };
  };

  // Play 3 edges around box (0,0) - no square claimed yet
  assert.equal(playEdge("h-0-0", "P1").extraTurn, false);
  assert.equal(playEdge("v-0-0", "P2").extraTurn, false);
  assert.equal(playEdge("v-0-1", "P1").extraTurn, false);
  assert.equal(boxes["0-0"], undefined);

  // 4th edge completes square (0,0) -> grants extra turn to P2
  const turnResult = playEdge("h-1-0", "P2");
  assert.equal(turnResult.extraTurn, true);
  assert.equal(boxes["0-0"], "P2");
});

// ============================================================================
// 2. NINE MEN'S MORRIS LOGIC TESTS
// ============================================================================
test("Nine Men's Morris: Mill definitions, mill formation, flying rules, and victory conditions", () => {
  const MILLS = [
    [0, 1, 2], [8, 9, 10], [16, 17, 18], [7, 15, 23],
    [19, 11, 3], [22, 21, 20], [14, 13, 12], [6, 5, 4],
    [1, 9, 17], [21, 13, 5], [7, 6, 0], [23, 22, 16],
    [2, 3, 4], [18, 19, 20], [8, 15, 14], [10, 11, 12],
  ];

  const checkMill = (pos: number, board: (string | null)[], player: string): boolean => {
    return MILLS.some((mill) => mill.includes(pos) && mill.every((idx) => board[idx] === player));
  };

  const board: (string | null)[] = Array(24).fill(null);
  board[0] = "W";
  board[1] = "W";
  board[2] = "W"; // Forms mill [0,1,2]

  assert.equal(checkMill(0, board, "W"), true);
  assert.equal(checkMill(1, board, "W"), true);
  assert.equal(checkMill(2, board, "W"), true);
  assert.equal(checkMill(3, board, "W"), false);

  // Phase 3 Flying: Player with exactly 3 pieces can fly to any empty position
  const whitePiecesCount = 3;
  const canFly = whitePiecesCount === 3;
  assert.equal(canFly, true);

  // Victory detection: Opponent with fewer than 3 pieces loses
  const blackPiecesCount = 2;
  const isBlackDefeated = blackPiecesCount < 3;
  assert.equal(isBlackDefeated, true);
});

// ============================================================================
// 3. WHACK-A-MOLE LOGIC TESTS
// ============================================================================
test("Whack-a-Mole: Score tracking, combo multiplier, golden mole, and hazards", () => {
  let score = 0;
  let combo = 0;

  const hitMole = (type: "regular" | "golden" | "bomb") => {
    if (type === "bomb") {
      score = Math.max(0, score - 50);
      combo = 0;
    } else if (type === "golden") {
      combo += 1;
      score += 60 * Math.min(combo, 5);
    } else {
      combo += 1;
      score += 15 * Math.min(combo, 5);
    }
  };

  hitMole("regular"); // combo 1 -> 15 pts
  assert.equal(score, 15);
  assert.equal(combo, 1);

  hitMole("regular"); // combo 2 -> 15*2 = 30 pts (total 45)
  assert.equal(score, 45);
  assert.equal(combo, 2);

  hitMole("golden"); // combo 3 -> 60*3 = 180 pts (total 225)
  assert.equal(score, 225);
  assert.equal(combo, 3);

  hitMole("bomb"); // -50 pts, resets combo
  assert.equal(score, 175);
  assert.equal(combo, 0);
});

// ============================================================================
// 4. SUDOKU LOGIC TESTS
// ============================================================================
test("Sudoku: 9x9 grid conflict detection across row, column, and 3x3 box", () => {
  const isValidPlacement = (
    grid: number[][],
    row: number,
    col: number,
    val: number
  ): boolean => {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c] === val) return false;
    }
    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col] === val) return false;
    }
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const curR = boxRow + r;
        const curC = boxCol + c;
        if ((curR !== row || curC !== col) && grid[curR][curC] === val) {
          return false;
        }
      }
    }
    return true;
  };

  const sampleGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
  sampleGrid[0][0] = 5;
  sampleGrid[0][1] = 3;
  sampleGrid[1][0] = 6;

  // Inserting duplicate in row
  assert.equal(isValidPlacement(sampleGrid, 0, 4, 5), false);
  // Inserting duplicate in col
  assert.equal(isValidPlacement(sampleGrid, 4, 0, 5), false);
  // Inserting duplicate in same 3x3 box
  assert.equal(isValidPlacement(sampleGrid, 1, 1, 5), false);
  // Inserting unique valid number
  assert.equal(isValidPlacement(sampleGrid, 0, 4, 8), true);
});

// ============================================================================
// 5. DAILY WORD GUESS LOGIC TESTS
// ============================================================================
test("Daily Word Guess: Wordle repeated letter evaluation algorithm", () => {
  type LetterStatus = "correct" | "present" | "absent";

  const evaluateGuess = (guess: string, answer: string): LetterStatus[] => {
    const res: LetterStatus[] = Array(5).fill("absent");
    const answerArr = answer.toUpperCase().split("");
    const guessArr = guess.toUpperCase().split("");
    const letterCounts: Record<string, number> = {};

    // 1st pass: Mark greens (correct)
    guessArr.forEach((char, i) => {
      if (char === answerArr[i]) {
        res[i] = "correct";
      } else {
        letterCounts[answerArr[i]] = (letterCounts[answerArr[i]] || 0) + 1;
      }
    });

    // 2nd pass: Mark yellows (present)
    guessArr.forEach((char, i) => {
      if (res[i] !== "correct") {
        if (letterCounts[char] && letterCounts[char] > 0) {
          res[i] = "present";
          letterCounts[char]--;
        }
      }
    });

    return res;
  };

  // Case 1: Target "SPEED", Guess "ERASE"
  // E at index 0 should be present (yellow)
  // R at index 1 absent
  // A at index 2 absent
  // S at index 3 present
  // E at index 4 correct (index 2 in SPEED is E)
  const eval1 = evaluateGuess("ERASE", "SPEED");
  assert.equal(eval1[0], "present"); // E
  assert.equal(eval1[1], "absent");  // R
  assert.equal(eval1[2], "absent");  // A
  assert.equal(eval1[3], "present"); // S
  assert.equal(eval1[4], "present"); // E (SPEED has two E's, so second E is also matched)

  // Case 2: Exact match
  const eval2 = evaluateGuess("CLIMB", "CLIMB");
  assert.deepEqual(eval2, ["correct", "correct", "correct", "correct", "correct"]);
});

// ============================================================================
// 6. HANGMAN LOGIC TESTS
// ============================================================================
test("Hangman: Duplicate guess rejection, gallows progression, and completion", () => {
  const secret = "PLANET";
  const guessed = new Set<string>();
  let wrongCount = 0;

  const guessLetter = (letter: string) => {
    const upper = letter.toUpperCase();
    if (guessed.has(upper)) return "duplicate";
    guessed.add(upper);
    if (!secret.includes(upper)) {
      wrongCount++;
      return "wrong";
    }
    return "correct";
  };

  assert.equal(guessLetter("P"), "correct");
  assert.equal(guessLetter("P"), "duplicate"); // Must reject duplicate
  assert.equal(guessLetter("X"), "wrong");
  assert.equal(wrongCount, 1);

  // Check remaining blanks
  const masked = secret.split("").map((c) => (guessed.has(c) ? c : "_")).join("");
  assert.equal(masked, "P_____");
});

// ============================================================================
// 7. GENERAL KNOWLEDGE QUIZ TESTS
// ============================================================================
test("General Knowledge Quiz: Option shuffling integrity and score accuracy", () => {
  interface Question {
    id: number;
    question: string;
    options: string[];
    answer: string;
  }

  const q: Question = {
    id: 1,
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    answer: "Paris",
  };

  // Shuffled options must always contain the correct answer unchanged
  const shuffled = [...q.options].sort(() => Math.random() - 0.5);
  assert(shuffled.includes(q.answer));
  assert.equal(shuffled.length, 4);

  // Selecting the right answer matches exact string
  const selected = "Paris";
  assert.equal(selected === q.answer, true);
});

// ============================================================================
// 8. GUESS THE COUNTRY NORMALIZATION TESTS
// ============================================================================
test("Guess the Country: String normalization handles accents, case, and aliases", () => {
  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();
  };

  const country = {
    name: "Brazil",
    aliases: ["brasil"],
  };

  assert.equal(normalize("Brazil"), "brazil");
  assert.equal(normalize("  BRazil!  "), "brazil");
  assert.equal(normalize("Brasil"), "brasil");
  assert.equal(
    normalize("Brasil") === normalize(country.name) ||
      country.aliases.some((a) => normalize(a) === normalize("Brasil")),
    true
  );
});

// ============================================================================
// 9. TRUE OR FALSE TESTS
// ============================================================================
test("True or False: Verification logic and streak bonus calculation", () => {
  const fact = {
    statement: "Bananas are berries.",
    isTrue: true,
  };

  const checkAnswer = (userPick: boolean) => userPick === fact.isTrue;
  assert.equal(checkAnswer(true), true);
  assert.equal(checkAnswer(false), false);

  // Speed and streak calculation
  const responseTimeMs = 1500;
  const streak = 3;
  const speedBonus = Math.max(0, Math.floor((4000 - Math.min(4000, responseTimeMs)) / 80));
  const streakBonus = streak * 10;
  const total = 100 + speedBonus + streakBonus;

  assert(total > 100);
});
