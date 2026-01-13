import type { GameState, DifficultyLevel, GameConfig } from "../src/types/game"

const testState: GameState = {
  currentRound: 1,
  totalRounds: 5,
  lives: 3,
  score: 0,
  currentMovie: null,
  guess: "",
  isCorrect: null,
  roundCompleted: false,
  hintsUsed: {
    genre: false,
    year: false,
    rating: false,
    tagline: false,
  },
  blurLevel: 0,
  revealsUsed: 0,
  roundStartTime: null,
  gameOver: false,
  gameWon: false,
}

// the next should cause a type error
// const badDiff: DifficultyLevel = "impossible"

console.log("All type tests passed.")
