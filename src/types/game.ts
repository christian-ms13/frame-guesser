import { GameMovie } from "../utils/tmdb"

export type DifficultyLevel = "easy" | "medium" | "hard"

export interface GameConfig {
  totalRounds: number // 5 rounds
  maxLives: number // 3 lives

  baseScore: {
    easy: number // 100 points
    medium: number // 200 points
    hard: number // 300 points
  }

  timeBonus: {
    max: number // 50 points
    interval: number // every 2 seconds = -1 point
  }

  hints: {
    genreReveal: number // -10 points
    yearReveal: number // -15 points
    ratingReveal: number // -15 points
    taglineReveal: number // -20 points
  }

  blurReveal: number // -25 points per reveal

  skipRound: number // -50 points
}

export interface GameState {
  currentRound: number
  totalRounds: number

  lives: number // 0 - 3
  score: number

  currentMovie: GameMovie | null
  guess: string
  isCorrect: boolean | null
  roundComplete: boolean

  hintsUsed: {
    genre: boolean
    year: boolean
    rating: boolean
    tagline: boolean
  }

  // 0 = fully blurred (blur-[50px])
  // 1 = blur-[30px]
  // 2 = blur-[15px]
  // 3 = blur-[5px]
  // 4 = fully clear (blur-none)
  blurLevel: number

  revealsUsed: number

  roundStartTime: number | null // Date.now()

  gameOver: boolean
  gameWon: boolean
}

export interface RoundResult {
  round: number
  movie: string
  correct: boolean
  score: number
  timeSeconds: number
}

export type { GameMovie } from "../utils/tmdb"

