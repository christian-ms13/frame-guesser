"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { IconTrophy, IconHeart, IconArrowRight, IconClock, IconEye, IconLightbulb, IconSkipForward, IconStar } from "./GameIcons"
import type { GameMovie } from "../../utils/tmdb"
import type { DifficultyLevel, GameConfig, RoundResult, GameState } from "../../types/game"
import { useAuth } from "../../hooks/useAuth"
import { IconEasy, IconHard, IconMedium } from "./DifficultyIcons"

const GAME_CONFIG: GameConfig = {
  totalRounds: 5,
  maxLives: 3,

  baseScore: {
    easy: 100,
    medium: 200,
    hard: 300,
  },
  timeBonus: {
    max: 50,
    interval: 2
  },

  hints: {
    genreReveal: 10,
    yearReveal: 15,
    ratingReveal: 15,
    taglineReveal: 20
  },

  blurReveal: 25,
  skipRound: 50
}

interface GameProps {
  movies: GameMovie[]
}

export default function Game({ movies }: GameProps) {
  const translations = useTranslations("gamePage")
  const { user } = useAuth()

  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null)
  const [gameStarted, setGameStarted] = useState(false)

  const initialState: GameState = {
    currentRound: 0,
    totalRounds: GAME_CONFIG.totalRounds,
    lives: GAME_CONFIG.maxLives,
    score: 0,
    currentMovie: null,
    guess: "",
    isCorrect: null,
    roundComplete: false,
    hintsUsed: {
      genre: false,
      year: false,
      rating: false,
      tagline: false
    },
    blurLevel: 0,
    revealsUsed: 0,
    roundStartTime: null,
    gameOver: false,
    gameWon: false
  }

  const [gameState, setGameState] = useState<GameState>(initialState)

  const [roundResults, setRoundResults] = useState<RoundResult[]>([])

  const [timer, setTimer] = useState(0)

  useEffect(() => {
    if (!gameState.roundStartTime || gameState.roundComplete) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameState.roundStartTime!) / 1000)
      setTimer(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState.roundStartTime, gameState.roundComplete])

  const calculateTimeBonus = useCallback((seconds: number): number => {
    const { max, interval } = GAME_CONFIG.timeBonus
    const penalty = Math.floor(seconds / interval)

    return Math.max(0, max - penalty)
  }, [])

  const calculateRoundScore = useCallback((timeSeconds: number): number => {
    if (!difficulty) return 0

    let score = GAME_CONFIG.baseScore[difficulty]
    score += calculateTimeBonus(timeSeconds)

    if (gameState.hintsUsed.genre) {
      score -= GAME_CONFIG.hints.genreReveal
    }
    if (gameState.hintsUsed.year) {
      score -= GAME_CONFIG.hints.yearReveal
    }
    if (gameState.hintsUsed.rating) {
      score -= GAME_CONFIG.hints.ratingReveal
    }
    if (gameState.hintsUsed.tagline) {
      score -= GAME_CONFIG.hints.taglineReveal
    }

    score -= gameState.revealsUsed * GAME_CONFIG.blurReveal

    return Math.max(0, score)
  }, [difficulty, gameState.hintsUsed, gameState.revealsUsed, calculateTimeBonus])

  const fuzzyMatch = useCallback((guess: string, title: string): boolean => {
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim()

    const normalizedGuess = normalize(guess)
    const normalizedTitle = normalize(title)

    if (normalizedGuess === normalizedTitle) return true
    if (normalizedTitle.includes(normalizedGuess)) return true

    const guessWords = normalizedGuess.split(" ")
    const titleWords = normalizedTitle.split(" ")

    return guessWords.every((guessWord) => titleWords.some((titleWord) => titleWord.startsWith(guessWord)))
  }, [])

  const startGame = useCallback((selectedDifficulty: DifficultyLevel) => {
    setDifficulty(selectedDifficulty)
    setGameStarted(true)
    setGameState({
      ...initialState,
      currentRound: 1,
      currentMovie: movies[0],
      roundStartTime: Date.now()
    })
    setRoundResults([])
    setTimer(0)
  }, [movies])

  const handleSubmitGuess = useCallback(() => {
    if (!gameState.currentMovie || !gameState.guess.trim()) return

    const timeSeconds = Math.floor((Date.now() - gameState.roundStartTime!) / 1000)

    const correct = fuzzyMatch(gameState.guess, gameState.currentMovie.title)

    const roundScore = correct ? calculateRoundScore(timeSeconds) : 0

    const result: RoundResult = {
      round: gameState.currentRound,
      movie: gameState.currentMovie.title,
      correct,
      score: roundScore,
      timeSeconds
    }

    setRoundResults((prevResults) => [...prevResults, result])

    setGameState(prevState => ({
      ...prevState,
      isCorrect: correct,
      roundComplete: true,
      score: prevState.score + roundScore,
      lives: correct ? prevState.lives : prevState.lives - 1
    }))
  }, [
    gameState.currentMovie,
    gameState.guess,
    gameState.roundStartTime,
    gameState.currentRound,
    fuzzyMatch,
    calculateRoundScore
  ])

  const handleNextRound = useCallback(async () => {
    const nextRound = gameState.currentRound + 1
    const noLivesLeft = gameState.lives <= 0
    const lastRound = nextRound > GAME_CONFIG.totalRounds

    if (noLivesLeft || lastRound) {
      setGameState(prevState => ({
        ...prevState,
        gameOver: true,
        gameWon: prevState.lives > 0
      }))

      if (user && difficulty) {
        try {
          // await saveGameResult({
          //   userId: user.id,
          //   difficulty,
          //   score: gameState.score,
          //   roundsCompleted: gameState.currentRound,
          //   livesRemaining: gameState.lives
          // })
        } catch (error) {
          console.error("Failed to save game result:", error)
        }
      }
    } else {
      setGameState({
        ...initialState,
        currentRound: nextRound,
        totalRounds: GAME_CONFIG.totalRounds,
        lives: gameState.lives,
        score: gameState.score,
        currentMovie: movies[nextRound - 1],
        roundStartTime: Date.now()
      })

      setTimer(0)
    }
  }, [
    gameState.currentRound,
    gameState.lives,
    gameState.score,
    movies,
    user,
    difficulty
  ])

  const revealHint = useCallback((hintType: keyof typeof gameState.hintsUsed) => {
    setGameState((prevState) => ({
      ...prevState,
      hintsUsed: {
        ...prevState.hintsUsed,
        [hintType]: true
      }
    }))
  }, [])

  const revealBlur = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      blurLevel: Math.min(4, prevState.blurLevel + 1),
      revealsUsed: prevState.revealsUsed + 1
    }))
  }, [])

  const skipRound = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      score: Math.max(0, prevState.score - GAME_CONFIG.skipRound),
      isCorrect: false,
      roundComplete: true,
      lives: prevState.lives - 1
    }))
  }, [])

  const restartGame = useCallback(() => {
    setDifficulty(null)
    setGameStarted(false)
    setGameState(initialState)
    setRoundResults([])
    setTimer(0)
  }, [])

  const blurClass = useMemo(() => {
    const levels = [
      "blur-[50px]",
      "blur-[30px]",
      "blur-[15px]",
      "blur-[5px]",
      "blur-none"
    ]

    return levels[gameState.blurLevel]
  }, [gameState.blurLevel])

  // ---

  if (!gameStarted || !difficulty) {
    return (
      <div className = "min-h-[90vh] flex items-center justify-center p-4">
        <div className = "max-w-4xl w-full">
          <h1 className = "text-5xl font-play-bold text-center mb-12 text-neutral-900 dark:text-white">
            {translations("selectDifficulty")}
          </h1>

          <div className = "grid grid-cols-3 gap-6">
            <button
              onClick = {() => startGame("easy")}
              className = "cursor-pointer bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-neutral-800 dark:border-neutral-400 hover:scale-105"
            >
              <div className = "flex items-center justify-center mb-4">
                <IconEasy className = "w-23 h-23" />
              </div>
              <h3 className = "text-3xl font-audiowide-regular text-neutral-900 dark:text-white mb-3">
                {translations("difficulty.easy")}
              </h3>
              <p className = "text-[16px] text-neutral-600 dark:text-neutral-400 mb-4 min-h-10">
                {translations("gameSettings.easyDescription")}
              </p>
              <div className = "text-lg font-bold text-red-500">
                {GAME_CONFIG.baseScore.easy} {translations("basePoints")}
              </div>
            </button>

            <button
              onClick = {() => startGame("medium")}
              className = "cursor-pointer bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-neutral-800 dark:border-neutral-400 hover:scale-105"
            >
              <div className = "flex items-center justify-center mb-4">
                <IconMedium className = "w-23 h-23" />
              </div>
              <h3 className = "text-3xl font-audiowide-regular text-neutral-900 dark:text-white mb-3">
                {translations("difficulty.medium")}
              </h3>
              <p className = "text-[16px] text-neutral-600 dark:text-neutral-400 mb-4 min-h-10">
                {translations("gameSettings.mediumDescription")}
              </p>
              <div className = "text-lg font-bold text-yellow-500 dark:text-yellow-400">
                {GAME_CONFIG.baseScore.medium} {translations("basePoints")}
              </div>
            </button>

            <button
              onClick = {() => startGame("hard")}
              className = "cursor-pointer bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-neutral-800 dark:border-neutral-400 hover:scale-105"
            >
              <div className = "flex items-center justify-center mb-4">
                <IconHard className = "w-23 h-23" />
              </div>
              <h3 className = "text-3xl font-audiowide-regular text-neutral-900 dark:text-white mb-3">
                {translations("difficulty.hard")}
              </h3>
              <p className = "text-[16px] text-neutral-600 dark:text-neutral-400 mb-4 min-h-10">
                {translations("gameSettings.hardDescription")}
              </p>
              <div className = "text-lg font-bold text-green-500">
                {GAME_CONFIG.baseScore.hard} {translations("basePoints")}
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }
}
