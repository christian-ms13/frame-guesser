"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"

import { fetchNewGameMovies, saveGameResult } from "../../app/game/actions"
import { useAuth } from "../../hooks/useAuth"
import type { DifficultyLevel, GameConfig, GameState, RoundResult } from "../../types/game"
import type { GameMovie } from "../../utils/tmdb"
import TruncatedTooltip from "../ui/TruncatedTooltip"
import { IconEasy, IconHard, IconMedium } from "./DifficultyIcons"
import { IconArrowRight, IconClock, IconEye, IconHeart, IconInfo, IconLightbulb, IconSkipForward, IconStar, IconTrophy } from "./GameIcons"
import { IconCorrect, IconFireworks, IconSad } from "./ResultIcons"

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
  skipRound: 50,

  difficultyModifiers: {
    easy: {
      startingBlurLevel: 2,
      timeBonusMultiplier: 2,
      hintCostMultiplier: 0.5,
      maxHints: 4,
      timeLimit: undefined
    },
    medium: {
      startingBlurLevel: 0,
      timeBonusMultiplier: 1,
      hintCostMultiplier: 1,
      maxHints: 4,
      timeLimit: undefined
    },
    hard: {
      startingBlurLevel: 0,
      timeBonusMultiplier: 0.5,
      hintCostMultiplier: 2,
      maxHints: 2,
      timeLimit: 30
    }
  }
}

interface GameProps {
  movies: GameMovie[]
}

interface HintButtonProps {
  icon: React.ReactNode
  label: string
  value?: string
  onClick: () => void
  cost: number
  revealed?: boolean
  disabled?: boolean
}

function HintButton({
  icon,
  label,
  value,
  onClick,
  cost,
  revealed = false,
  disabled = false,
  isTagline = false
}: HintButtonProps & { isTagline?: boolean }) {
  return (
    <button
      onClick = {onClick}
      disabled = {disabled || revealed}
      className = {
        `cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 text-left h-full flex flex-col ${
          disabled && !revealed
            ? "border-neutral-400 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-900 opacity-50 cursor-not-allowed"
            : revealed
            ? "border-red-500/80 bg-red-50/60 dark:bg-red-500/10 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:shadow-md hover:scale-105 active:scale-100"
            : "border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:shadow-md hover:scale-105 active:scale-100"
        }`
      }
    >
      <div className = "flex items-center gap-2 mb-2">
        {icon}
        <span className = "text-sm font-semibold text-neutral-900 dark:text-white font-robotoslab-medium">{label}</span>
      </div>

      {value ? (
        isTagline ? (
          <TruncatedTooltip text = {value}>
            <div className = "text-base font-bold text-neutral-900 dark:text-white font-courierprime-bold truncate min-h-10 flex items-start">
              {value}
            </div>
          </TruncatedTooltip>
        ) : (
          <div className = "text-sm font-bold text-neutral-900 dark:text-white font-courierprime-bold line-clamp-2 overflow-hidden min-h-10 leading-tight">
            {value}
          </div>
        )
      ) : (
          <div className = "text-xs text-neutral-500 dark:text-neutral-400 font-robotoslab-medium min-h-10 flex items-start">
            {disabled ? "Limit reached" : `-${cost} pts`}
          </div>
      )}
    </button>
  )
}

export default function Game({ movies }: GameProps) {
  const translations = useTranslations("gamePage")
  const { user } = useAuth()

  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMovies, setGameMovies] = useState<GameMovie[]>(movies)
  const [isLoadingMovies, setIsLoadingMovies] = useState(false)

  // Get difficulty config
  const difficultyConfig = useMemo(() => {
    if (!difficulty) return GAME_CONFIG.difficultyModifiers.easy
    return GAME_CONFIG.difficultyModifiers[difficulty]
  }, [difficulty])

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
    blurLevel: difficultyConfig.startingBlurLevel,
    revealsUsed: 0,
    roundStartTime: null,
    gameOver: false,
    gameWon: false
  }

  const [gameState, setGameState] = useState<GameState>(initialState)

  const [roundResults, setRoundResults] = useState<RoundResult[]>([])

  const [timer, setTimer] = useState(0)

  const [hintModal, setHintModal] = useState<{ title: string; content: string } | null>(null)
  const [showRulesModal, setShowRulesModal] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHintModal(null)
        setShowRulesModal(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!gameState.roundStartTime || gameState.roundComplete) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameState.roundStartTime!) / 1000)
      setTimer(elapsed)

      // Auto-skip on hard mode when time limit exceeded
      if (difficultyConfig.timeLimit && elapsed >= difficultyConfig.timeLimit && !gameState.roundComplete) {
        clearInterval(interval)
        // Trigger skip by setting state
        setGameState((prevState) => ({
          ...prevState,
          score: Math.max(0, prevState.score - GAME_CONFIG.skipRound),
          isCorrect: false,
          roundComplete: true,
          lives: prevState.lives - 1
        }))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState.roundStartTime, gameState.roundComplete, difficultyConfig.timeLimit])

  const calculateTimeBonus = useCallback((seconds: number): number => {
    const { max, interval } = GAME_CONFIG.timeBonus
    const penalty = Math.floor(seconds / interval)
    const baseBonus = Math.max(0, max - penalty)

    return Math.round(baseBonus * difficultyConfig.timeBonusMultiplier)
  }, [difficultyConfig.timeBonusMultiplier])

  const calculateRoundScore = useCallback((timeSeconds: number): number => {
    if (!difficulty) return 0

    let score = GAME_CONFIG.baseScore[difficulty]
    score += calculateTimeBonus(timeSeconds)

    const hintCostMultiplier = difficultyConfig.hintCostMultiplier

    if (gameState.hintsUsed.genre) {
      score -= Math.round(GAME_CONFIG.hints.genreReveal * hintCostMultiplier)
    }
    if (gameState.hintsUsed.year) {
      score -= Math.round(GAME_CONFIG.hints.yearReveal * hintCostMultiplier)
    }
    if (gameState.hintsUsed.rating) {
      score -= Math.round(GAME_CONFIG.hints.ratingReveal * hintCostMultiplier)
    }
    if (gameState.hintsUsed.tagline) {
      score -= Math.round(GAME_CONFIG.hints.taglineReveal * hintCostMultiplier)
    }

    score -= gameState.revealsUsed * Math.round(GAME_CONFIG.blurReveal * difficultyConfig.hintCostMultiplier)

    return Math.max(0, score)
  }, [difficulty, gameState.hintsUsed, gameState.revealsUsed, calculateTimeBonus, difficultyConfig])

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

  const startGame = useCallback(async (selectedDifficulty: DifficultyLevel) => {
    setDifficulty(selectedDifficulty)
    setIsLoadingMovies(true)
    
    try {
      const newMovies = await fetchNewGameMovies()
      setGameMovies(newMovies)
      
      setGameStarted(true)
      setGameState({
        ...initialState,
        currentRound: 1,
        currentMovie: newMovies[0],
        roundStartTime: Date.now()
      })
      setRoundResults([])
      setTimer(0)
    } catch (error) {
      console.error("Error fetching movies:", error)
      setIsLoadingMovies(false)
    } finally {
      setIsLoadingMovies(false)
    }
  }, [initialState])

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
          await saveGameResult({
            userId: user.id,
            difficulty,
            score: gameState.score,
            roundsCompleted: gameState.currentRound,
            livesRemaining: gameState.lives
          })
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
        currentMovie: gameMovies[nextRound - 1],
        roundStartTime: Date.now()
      })

      setTimer(0)
    }
  }, [
    gameState.currentRound,
    gameState.lives,
    gameState.score,
    gameMovies,
    user,
    difficulty
  ])

  const openHintModal = useCallback((title: string, content: string) => {
    setHintModal({ title, content })
  }, [])

  // Helper to check if hint limit reached
  const isHintLimitReached = useMemo(() => {
    const hintsUsedCount = Object.values(gameState.hintsUsed).filter(Boolean).length
    const totalReveals = hintsUsedCount + gameState.revealsUsed
    return totalReveals >= difficultyConfig.maxHints
  }, [gameState.hintsUsed, gameState.revealsUsed, difficultyConfig.maxHints])

  const revealHint = useCallback((hintType: keyof typeof gameState.hintsUsed) => {
    if (!gameState.currentMovie) return

    // Count hints used
    const hintsUsedCount = Object.values(gameState.hintsUsed).filter(Boolean).length

    // Check if max hints reached
    if (hintsUsedCount >= difficultyConfig.maxHints) {
      return
    }

    const title = translations(`hints.${hintType}`)

    const content = (() => {
      if (hintType === "genre") {
        return gameState.currentMovie.genres.join(", ") || translations("hints.noGenre")
      }
      if (hintType === "year") {
        return String(gameState.currentMovie.year)
      }
      if (hintType === "rating") {
        return gameState.currentMovie.vote_average.toFixed(1)
      }
      return gameState.currentMovie.tagline || translations("hints.noTagline")
    })()

    setGameState((prevState) => {
      if (prevState.hintsUsed[hintType]) {
        return prevState
      }

      return {
        ...prevState,
        hintsUsed: {
          ...prevState.hintsUsed,
          [hintType]: true
        }
      }
    })

    openHintModal(title, content)
  }, [gameState.currentMovie, gameState.hintsUsed, difficultyConfig.maxHints, translations, openHintModal])

  const revealBlur = useCallback(() => {
    // Count all reveals (hints + blur reveals)
    const hintsUsedCount = Object.values(gameState.hintsUsed).filter(Boolean).length
    const totalReveals = hintsUsedCount + gameState.revealsUsed

    // Check if max hints reached
    if (totalReveals >= difficultyConfig.maxHints) {
      return
    }

    setGameState((prevState) => ({
      ...prevState,
      blurLevel: Math.min(4, prevState.blurLevel + 1),
      revealsUsed: prevState.revealsUsed + 1
    }))
  }, [gameState.hintsUsed, gameState.revealsUsed, difficultyConfig.maxHints])

  const skipRound = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      score: Math.max(0, prevState.score - GAME_CONFIG.skipRound),
      isCorrect: false,
      roundComplete: true,
      lives: prevState.lives - 1
    }))
  }, [])

  const restartGame = useCallback(async () => {
    setDifficulty(null)
    setGameStarted(false)
    setGameState(initialState)
    setRoundResults([])
    setTimer(0)
    setIsLoadingMovies(false)
  }, [initialState])

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
          <h1 className = "text-6xl font-courierprime-bold text-center mb-12 text-neutral-900 dark:text-white">
            {isLoadingMovies ? translations("loadingMovies") : translations("selectDifficulty")}
          </h1>

          <div className = "grid grid-cols-3 gap-6">
            <button
              onClick = {() => startGame("easy")}
              disabled = {isLoadingMovies}
              className = "cursor-pointer bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-neutral-300 dark:border-neutral-700 hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className = "flex items-center justify-center mb-4">
                <IconEasy className = "w-23 h-23" />
              </div>
              <h3 className = "text-3xl font-audiowide-regular text-neutral-900 dark:text-white mb-3">
                {translations("difficulty.easy")}
              </h3>
              <p className = "text-[16px] text-neutral-600 dark:text-neutral-400 mb-4 min-h-10 font-robotoslab-medium">
                {translations("gameSettings.easyDescription")}
              </p>
              <div className = "text-lg font-bold text-red-500 font-courierprime-bold">
                {GAME_CONFIG.baseScore.easy} {translations("basePoints")}
              </div>
            </button>

            <button
              onClick = {() => startGame("medium")}
              disabled = {isLoadingMovies}
              className = "cursor-pointer bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-neutral-300 dark:border-neutral-700 hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className = "flex items-center justify-center mb-4">
                <IconMedium className = "w-23 h-23" />
              </div>
              <h3 className = "text-3xl font-audiowide-regular text-neutral-900 dark:text-white mb-3">
                {translations("difficulty.medium")}
              </h3>
              <p className = "text-[16px] text-neutral-600 dark:text-neutral-400 mb-4 min-h-10 font-robotoslab-medium">
                {translations("gameSettings.mediumDescription")}
              </p>
              <div className = "text-lg font-bold text-yellow-500 dark:text-yellow-400 font-courierprime-bold">
                {GAME_CONFIG.baseScore.medium} {translations("basePoints")}
              </div>
            </button>

            <button
              onClick = {() => startGame("hard")}
              disabled = {isLoadingMovies}
              className = "cursor-pointer bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-neutral-300 dark:border-neutral-700 hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className = "flex items-center justify-center mb-4">
                <IconHard className = "w-23 h-23" />
              </div>
              <h3 className = "text-3xl font-audiowide-regular text-neutral-900 dark:text-white mb-3">
                {translations("difficulty.hard")}
              </h3>
              <p className = "text-[16px] text-neutral-600 dark:text-neutral-400 mb-4 min-h-10 font-robotoslab-medium">
                {translations("gameSettings.hardDescription")}
              </p>
              <div className = "text-lg font-bold text-green-500 font-courierprime-bold">
                {GAME_CONFIG.baseScore.hard} {translations("basePoints")}
              </div>
            </button>
          </div>

          <div className = "mt-8 flex justify-center">
            <button
              onClick = {() => setShowRulesModal(true)}
              className = "cursor-pointer flex items-center gap-2 px-6 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl border-2 border-neutral-300 dark:border-neutral-700 transition-all duration-200 hover:scale-105 active:scale-100"
            >
              <IconInfo className = "w-5 h-5 text-red-500" />
              <span className = "font-robotoslab-medium text-neutral-900 dark:text-white">
                {translations("howToPlay")}
              </span>
            </button>
          </div>
        </div>

        {showRulesModal && (
          <div
            className = "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg px-4 py-8 overflow-y-auto"
            onClick = {() => setShowRulesModal(false)}
          >
            <div
              className = "relative max-w-4xl w-full my-8 drop-shadow-2xl"
              onClick = {(e) => e.stopPropagation()}
            >
              <div className = "absolute -inset-0.5 bg-linear-to-br from-red-500/45 via-amber-400/30 to-yellow-400/45 rounded-3xl blur-xl opacity-80" aria-hidden = "true" />

              <div className = "relative bg-neutral-50/98 dark:bg-neutral-900/98 rounded-3xl border border-white/20 dark:border-black/30 shadow-2xl shadow-black/80 p-8 max-h-[85vh] overflow-y-auto">
                <div className = "flex items-start justify-between mb-6 sticky top-0 bg-neutral-50 dark:bg-neutral-900 z-10 pb-4 -mx-8 px-8 pt-8 -mt-8 border-b border-neutral-200 dark:border-neutral-700">
                  <div className = "flex items-center gap-3">
                    <div className = "h-11 w-11 rounded-2xl bg-linear-to-br from-red-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                      <IconInfo className = "w-6 h-6" />
                    </div>
                    <div>
                      <p className = "text-sm uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 font-robotoslab-medium">Game Guide</p>
                      <h3 className = "text-2xl font-courierprime-bold text-neutral-900 dark:text-white leading-tight">
                        {translations("gameRules.title")}
                      </h3>
                    </div>
                  </div>
                  <button
                    className = "h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:scale-105 active:scale-95 transition-all font-courierprime-bold text-2xl border border-neutral-300/60 dark:border-neutral-700/80"
                    onClick = {() => setShowRulesModal(false)}
                    aria-label = "Close"
                  >
                    ×
                  </button>
                </div>

                <div className = "space-y-6">
                  {/* Objective */}
                  <div className = "bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 p-5">
                    <h4 className = "text-lg font-courierprime-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <IconTrophy className = "w-5 h-5" />
                      {translations("gameRules.objective.title")}
                    </h4>
                    <p className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium leading-relaxed">
                      {translations("gameRules.objective.text")}
                    </p>
                  </div>

                  {/* How to Play */}
                  <div className = "bg-neutral-100 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5">
                    <h4 className = "text-lg font-courierprime-bold text-neutral-900 dark:text-white mb-3">
                      {translations("gameRules.gameplay.title")}
                    </h4>
                    <ul className = "space-y-2">
                      <li className = "flex items-start gap-3 text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                        <span className = "text-blue-500 mt-1">•</span>
                        {translations("gameRules.gameplay.rounds")}
                      </li>
                      <li className = "flex items-start gap-3 text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                        <span className = "text-red-500 mt-1">•</span>
                        {translations("gameRules.gameplay.lives")}
                      </li>
                      <li className = "flex items-start gap-3 text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                        <span className = "text-green-500 mt-1">•</span>
                        {translations("gameRules.gameplay.timer")}
                      </li>
                      <li className = "flex items-start gap-3 text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                        <span className = "text-yellow-500 mt-1">•</span>
                        {translations("gameRules.gameplay.input")}
                      </li>
                    </ul>
                  </div>

                  {/* Hints & Reveals */}
                  <div className = "bg-neutral-100 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5">
                    <h4 className = "text-lg font-courierprime-bold text-neutral-900 dark:text-white mb-2">
                      {translations("gameRules.hints.title")}
                    </h4>
                    <p className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium mb-3">
                      {translations("gameRules.hints.text")}
                    </p>
                    <div className = "grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      <div className = "flex items-center gap-2 text-sm">
                        <IconStar className = "w-4 h-4 text-yellow-500" />
                        <span className = "font-robotoslab-medium text-neutral-700 dark:text-neutral-300">
                          {translations("gameRules.hints.genre")}
                        </span>
                      </div>
                      <div className = "flex items-center gap-2 text-sm">
                        <IconClock className = "w-4 h-4 text-blue-500" />
                        <span className = "font-robotoslab-medium text-neutral-700 dark:text-neutral-300">
                          {translations("gameRules.hints.year")}
                        </span>
                      </div>
                      <div className = "flex items-center gap-2 text-sm">
                        <IconStar className = "w-4 h-4 text-yellow-500" />
                        <span className = "font-robotoslab-medium text-neutral-700 dark:text-neutral-300">
                          {translations("gameRules.hints.rating")}
                        </span>
                      </div>
                      <div className = "flex items-center gap-2 text-sm">
                        <IconLightbulb className = "w-4 h-4 text-green-500" />
                        <span className = "font-robotoslab-medium text-neutral-700 dark:text-neutral-300">
                          {translations("gameRules.hints.tagline")}
                        </span>
                      </div>
                    </div>
                    <div className = "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 space-y-1">
                      <div className = "flex items-center gap-2 text-sm">
                        <IconEye className = "w-4 h-4 text-red-500" />
                        <span className = "font-robotoslab-medium text-neutral-700 dark:text-neutral-300">
                          {translations("gameRules.hints.blur")}
                        </span>
                      </div>
                      <p className = "text-xs text-neutral-600 dark:text-neutral-400 font-robotoslab-medium pl-6">
                        {translations("gameRules.hints.maxBlur")}
                      </p>
                      <p className = "text-xs text-amber-700 dark:text-amber-400 font-robotoslab-medium pl-6">
                        ⚠️ {translations("gameRules.hints.cost")}
                      </p>
                    </div>
                  </div>

                  {/* Scoring */}
                  <div className = "bg-neutral-100 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5">
                    <h4 className = "text-lg font-courierprime-bold text-neutral-900 dark:text-white mb-3">
                      {translations("gameRules.scoring.title")}
                    </h4>
                    <ul className = "space-y-2">
                      <li className = "flex items-start gap-3 text-neutral-700 dark:text-neutral-300 font-robotoslab-medium text-sm">
                        <span className = "text-green-500 mt-0.5">+</span>
                        {translations("gameRules.scoring.base")}
                      </li>
                      <li className = "flex items-start gap-3 text-neutral-700 dark:text-neutral-300 font-robotoslab-medium text-sm">
                        <span className = "text-blue-500 mt-0.5">+</span>
                        {translations("gameRules.scoring.timeBonus")}
                      </li>
                      <li className = "flex items-start gap-3 text-neutral-700 dark:text-neutral-300 font-robotoslab-medium text-sm">
                        <span className = "text-red-500 mt-0.5">-</span>
                        {translations("gameRules.scoring.penalties")}
                      </li>
                      <li className = "flex items-start gap-3 text-neutral-700 dark:text-neutral-300 font-robotoslab-medium text-sm">
                        <span className = "text-red-500 mt-0.5">-</span>
                        {translations("gameRules.scoring.skip")}
                      </li>
                    </ul>
                  </div>

                  {/* Difficulties */}
                  <div className = "bg-neutral-100 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5">
                    <h4 className = "text-lg font-courierprime-bold text-neutral-900 dark:text-white mb-4">
                      {translations("gameRules.difficulties.title")}
                    </h4>
                    <div className = "space-y-4">
                      {/* Easy */}
                      <div className = "bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
                        <div className = "flex items-center gap-2 mb-2">
                          <IconEasy className = "w-6 h-6 text-red-500" />
                          <h5 className = "font-courierprime-bold text-red-600 dark:text-red-400">
                            {translations("gameRules.difficulties.easy.name")}
                          </h5>
                        </div>
                        <ul className = "space-y-1.5 text-sm">
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.easy.blur")}
                          </li>
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.easy.points")}
                          </li>
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.easy.timeBonus")}
                          </li>
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.easy.hints")}
                          </li>
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.easy.maxHints")}
                          </li>
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.easy.timeLimit")}
                          </li>
                        </ul>
                      </div>

                      {/* Medium */}
                      <div className = "bg-yellow-50 dark:bg-yellow-950/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                        <div className = "flex items-center gap-2 mb-2">
                          <IconMedium className = "w-6 h-6 text-yellow-500" />
                          <h5 className = "font-courierprime-bold text-yellow-600 dark:text-yellow-400">
                            {translations("gameRules.difficulties.medium.name")}
                          </h5>
                        </div>
                        <ul className = "space-y-1.5 text-sm">
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.medium.blur")}
                          </li>
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.medium.points")}
                          </li>
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.medium.timeBonus")}
                          </li>
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.medium.hints")}
                          </li>
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.medium.maxHints")}
                          </li>
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.medium.timeLimit")}
                          </li>
                        </ul>
                      </div>

                      {/* Hard */}
                      <div className = "bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4">
                        <div className = "flex items-center gap-2 mb-2">
                          <IconHard className = "w-6 h-6 text-green-500" />
                          <h5 className = "font-courierprime-bold text-green-600 dark:text-green-400">
                            {translations("gameRules.difficulties.hard.name")}
                          </h5>
                        </div>
                        <ul className = "space-y-1.5 text-sm">
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.hard.blur")}
                          </li>
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.hard.points")}
                          </li>
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.hard.timeBonus")}
                          </li>
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.hard.hints")}
                          </li>
                          <li className = "text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                            • {translations("gameRules.difficulties.hard.maxHints")}
                          </li>
                          <li className = "font-robotoslab-medium font-bold text-red-600 dark:text-red-400">
                            ⏱️ {translations("gameRules.difficulties.hard.timeLimit")}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Pro Tips */}
                  <div className = "bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-2xl border border-purple-200 dark:border-purple-800 p-5">
                    <h4 className = "text-lg font-courierprime-bold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                      <IconLightbulb className = "w-5 h-5" />
                      {translations("gameRules.tips.title")}
                    </h4>
                    <ul className = "space-y-2">
                      <li className = "flex items-start gap-3 text-neutral-700 dark:text-neutral-300 font-robotoslab-medium text-sm">
                        <span className = "text-purple-500 mt-0.5">💡</span>
                        {translations("gameRules.tips.tip1")}
                      </li>
                      <li className = "flex items-start gap-3 text-neutral-700 dark:text-neutral-300 font-robotoslab-medium text-sm">
                        <span className = "text-purple-500 mt-0.5">💡</span>
                        {translations("gameRules.tips.tip2")}
                      </li>
                      <li className = "flex items-start gap-3 text-neutral-700 dark:text-neutral-300 font-robotoslab-medium text-sm">
                        <span className = "text-purple-500 mt-0.5">💡</span>
                        {translations("gameRules.tips.tip3")}
                      </li>
                      <li className = "flex items-start gap-3 text-neutral-700 dark:text-neutral-300 font-robotoslab-medium text-sm">
                        <span className = "text-purple-500 mt-0.5">💡</span>
                        {translations("gameRules.tips.tip4")}
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick = {() => setShowRulesModal(false)}
                  className = "cursor-pointer w-full mt-6 py-4 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-2xl font-courierprime-bold text-lg transition-all duration-200 hover:shadow-lg shadow-red-500/50 hover:scale-105 active:scale-100"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ---

  if (gameState.gameOver) {
    return (
      <div className = "min-h-[90vh] flex items-center justify-center p-4">
        <div className = "max-w-4xl w-full">
          <div className = "text-center mb-8">
            <div className = "mb-6">
              {gameState.gameWon ? <IconFireworks className = "w-24 h-24 mx-auto" /> : <IconSad className = "w-24 h-24 mx-auto" />}
            </div>
            <h1 className = "text-5xl font-courierprime-bold mb-4 text-neutral-900 dark:text-white">
              {gameState.gameWon ? translations("gameOver.won") : translations("gameOver.lost")}
            </h1>
            <div className = "text-7xl font-courierprime-bold text-neutral-900 dark:text-white">
              {gameState.score}
            </div>
            <div className = "text-xl text-neutral-600 dark:text-neutral-400 mt-2 font-robotoslab-medium">
              {translations("basePoints")}
            </div>
          </div>

          <div className = "bg-neutral-100 dark:bg-neutral-800 rounded-3xl shadow-xl shadow-black/40 dark:shadow-black/70 p-6 mb-8 border-2 border-neutral-300 dark:border-neutral-700">
            <h2 className = "text-3xl font-courierprime-bold mb-6 text-neutral-900 dark:text-white">
              {translations("results.roundByRound")}
            </h2>
            <div className = "space-y-3">
              {roundResults.map((result) => (
                <div
                  key = {result.round}
                  className = "flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 transition-all hover:shadow-md"
                >
                  <div className = "flex items-center gap-4">
                    <div className = {`w-10 h-10 rounded-full flex items-center justify-center font-bold font-courierprime-bold text-white ${result.correct ? "bg-green-500" : "bg-red-500"}`}>
                      {result.round}
                    </div>

                    <div>
                      <div className = "font-semibold text-neutral-900 dark:text-white font-robotoslab-medium">{result.movie}</div>
                      <div className = "text-sm text-neutral-500 dark:text-neutral-400 font-robotoslab-medium">
                        {result.timeSeconds}s
                      </div>
                    </div>
                  </div>

                  <div className = "text-lg font-bold text-neutral-900 dark:text-white font-courierprime-bold">
                    +{result.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick = {restartGame}
            className = "cursor-pointer w-full py-5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-2xl font-courierprime-bold text-lg transition-all duration-200 hover:shadow-lg shadow-red-500/50 hover:scale-105 active:scale-100"
          >
            {translations("playAgain")}
          </button>
        </div>
      </div>
    )
  }

  // ---

  if (gameState.roundComplete && gameState.isCorrect !== null) {
    return (
      <div className = "min-h-[90vh] flex items-center justify-center p-4">
        <div className = "max-w-3xl w-full text-center">
          <div className = "mb-8">
            {gameState.isCorrect ? <IconCorrect className = "w-28 h-28 mx-auto" /> : <IconSad className = "w-28 h-28 mx-auto" />}
          </div>

          <h1 className = "text-5xl font-courierprime-bold mb-6 text-neutral-900 dark:text-white">
            {gameState.isCorrect ? translations("roundResult.correct") : translations("roundResult.incorrect")}
          </h1>

          <p className = "text-2xl text-neutral-600 dark:text-neutral-400 mb-10 font-robotoslab-medium">
            {gameState.currentMovie?.title}
          </p>

          {gameState.isCorrect && (
            <div className = "text-6xl font-courierprime-bold text-neutral-900 dark:text-white mb-8">
              +{roundResults[roundResults.length - 1]?.score}
            </div>
          )}

          <div className = "flex items-center justify-center gap-12 mb-10 bg-neutral-100 dark:bg-neutral-800 rounded-2xl py-6 px-8 border-2 border-neutral-300 dark:border-neutral-700">
            <div className = "flex items-center gap-3">
              <IconTrophy className = "w-7 h-7 text-yellow-500" />
              <span className = "text-3xl font-courierprime-bold text-neutral-900 dark:text-white">
                {gameState.score}
              </span>
            </div>
            <div className = "w-px h-12 bg-neutral-300 dark:bg-neutral-600" />
            <div className = "flex items-center gap-3">
              {Array.from({ length: GAME_CONFIG.maxLives }).map((_, i) => (
                <IconHeart
                  key = {i}
                  className = {`w-7 h-7 transition-all duration-200 ${i < gameState.lives ? "text-red-500 scale-100" : "text-neutral-300 dark:text-neutral-600 scale-75"}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick = {handleNextRound}
            className = "cursor-pointer px-10 py-5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-2xl font-courierprime-bold text-lg transition-all duration-200 hover:shadow-lg shadow-red-500/50 hover:scale-105 active:scale-100 inline-flex items-center gap-3"
          >
            {gameState.currentRound < GAME_CONFIG.totalRounds && gameState.lives > 0
            ? translations("nextRound")
            : translations("seeResults")}
            <IconArrowRight className = "w-6 h-6" />
          </button>
        </div>
      </div>
    )
  }

  // ---

  if (!gameState.currentMovie) return null

  return (
    <div className = "min-h-[90vh] w-full p-4">
      <div className = "max-w-5xl mx-auto w-full px-2 sm:px-4">
        <div className = "flex items-center justify-between mb-8 bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-6 py-4 border-2 border-neutral-300 dark:border-neutral-700">
          <div className = "flex items-center gap-8">
            <div className = "flex items-center gap-2">
              {difficulty === "easy" && <IconEasy className = "w-7 h-7 text-red-500" />}
              {difficulty === "medium" && <IconMedium className = "w-7 h-7 text-yellow-500" />}
              {difficulty === "hard" && <IconHard className = "w-7 h-7 text-green-500" />}
              <span className = {`text-sm font-courierprime-bold uppercase tracking-widest ${
                difficulty === "easy" ? "text-red-600 dark:text-red-400" :
                difficulty === "medium" ? "text-yellow-600 dark:text-yellow-400" :
                "text-green-600 dark:text-green-400"
              }`}>
                {difficulty}
              </span>
            </div>

            <div className = "flex items-center gap-3 px-4 py-2 bg-white dark:bg-neutral-700 rounded-xl border border-neutral-200 dark:border-neutral-600">
              <IconTrophy className = "w-6 h-6 text-yellow-500" />
              <span className = "text-2xl font-courierprime-bold text-neutral-900 dark:text-white">
                {gameState.score}
              </span>
            </div>

            <div className = "flex items-center gap-2">
              {Array.from({ length: GAME_CONFIG.maxLives }).map((_, i) => (
                <IconHeart
                  key = {i}
                  className = {`w-6 h-6 transition-all duration-200 ${
                    i < gameState.lives
                      ? "text-red-500 scale-100"
                      : "text-neutral-300 dark:text-neutral-600 scale-75"
                  }`}
                />
              ))}
            </div>

            <div className = {`flex items-center gap-3 px-4 py-2 rounded-xl border ${
              difficultyConfig.timeLimit && timer >= (difficultyConfig.timeLimit * 0.8)
                ? "bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-600"
                : "bg-white dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600"
            }`}>
              <IconClock className = {`w-6 h-6 ${
                difficultyConfig.timeLimit && timer >= (difficultyConfig.timeLimit * 0.8)
                  ? "text-red-500"
                  : "text-blue-500"
              }`} />
              <span className = {`text-lg font-courierprime-bold ${
                difficultyConfig.timeLimit && timer >= (difficultyConfig.timeLimit * 0.8)
                  ? "text-red-600 dark:text-red-400"
                  : "text-neutral-900 dark:text-white"
              }`}>
                {timer}s {difficultyConfig.timeLimit ? `/ ${difficultyConfig.timeLimit}s` : ""}
              </span>
            </div>
          </div>

          <div className = "text-lg font-courierprime-bold text-neutral-900 dark:text-white">
            {translations("round")} {gameState.currentRound} / {GAME_CONFIG.totalRounds}
          </div>
        </div>

        <div className = "relative w-full aspect-video rounded-2xl overflow-hidden mb-8 shadow-2xl shadow-black/40 dark:shadow-black/70 border-2 border-neutral-300 dark:border-neutral-700">
          <Image
            src = {gameState.currentMovie ? gameState.currentMovie.backdrop_path : ""}
            alt = "Movie Frame"
            fill
            className = {`object-cover transition-all duration-500 ${blurClass}`}
            priority
          />
        </div>

        <div className = "mx-auto w-full">
          <div className = "mb-8 bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-5 border-2 border-neutral-300 dark:border-neutral-700">
          <div className = "flex items-center justify-between mb-3">
            <span className = "text-sm font-courierprime-bold text-neutral-900 dark:text-white uppercase tracking-wide">{translations("clarity")}</span>
            <span className = "text-sm font-robotoslab-medium text-neutral-600 dark:text-neutral-400">{gameState.blurLevel}/4</span>
          </div>
          <div className = "h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden border border-neutral-400 dark:border-neutral-600">
            <div
              className = "h-full bg-linear-to-r from-red-500 via-amber-500 to-yellow-400 transition-all duration-300"
              style = {{ width: `${(gameState.blurLevel / 4) * 100}%` }}
            />
          </div>
        </div>

          <div className = "mb-6">
            <input
              type = "text"
              value = {gameState.guess}
              onChange = {(e) =>
                setGameState((prevState) => ({ ...prevState, guess: e.target.value }))
              }
              onKeyDown = {(e) => e.key === "Enter" && handleSubmitGuess()}
              placeholder = {translations("guessPlaceholder")}
              className = "w-full px-6 py-4 text-lg rounded-2xl border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none transition-all duration-200 font-robotoslab-medium"
            />

            <button
              onClick = {handleSubmitGuess}
              disabled = {!gameState.guess.trim()}
              className = "cursor-pointer w-full mt-4 py-4 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-2xl font-courierprime-bold text-lg transition-all duration-200 hover:shadow-lg shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-100"
            >
              {translations("submitGuess")}
            </button>
          </div>

          <div className = "grid grid-cols-4 gap-3 mb-6 auto-rows-fr">
            <HintButton
              icon = {<IconStar className = "w-5 h-5 text-yellow-500" />}
              label = {translations("hints.genre")}
              value = {undefined}
              onClick = {() => revealHint("genre")}
              revealed = {gameState.hintsUsed.genre}
              cost = {Math.round(GAME_CONFIG.hints.genreReveal * difficultyConfig.hintCostMultiplier)}
              disabled = {isHintLimitReached && !gameState.hintsUsed.genre}
            />

            <HintButton
              icon = {<IconClock className = "w-5 h-5 text-blue-500" />}
              label = {translations("hints.year")}
              value = {undefined}
              onClick = {() => revealHint("year")}
              revealed = {gameState.hintsUsed.year}
              cost = {Math.round(GAME_CONFIG.hints.yearReveal * difficultyConfig.hintCostMultiplier)}
              disabled = {isHintLimitReached && !gameState.hintsUsed.year}
            />

            <HintButton
              icon = {<IconStar className = "w-5 h-5 text-yellow-500" />}
              label = {translations("hints.rating")}
              value = {undefined}
              onClick = {() => revealHint("rating")}
              revealed = {gameState.hintsUsed.rating}
              cost = {Math.round(GAME_CONFIG.hints.ratingReveal * difficultyConfig.hintCostMultiplier)}
              disabled = {isHintLimitReached && !gameState.hintsUsed.rating}
            />

            <HintButton
              icon = {<IconLightbulb className = "w-5 h-5 text-green-500" />}
              label = {translations("hints.tagline")}
              value = {undefined}
              onClick = {() => revealHint("tagline")}
              revealed = {gameState.hintsUsed.tagline}
              cost = {Math.round(GAME_CONFIG.hints.taglineReveal * difficultyConfig.hintCostMultiplier)}
              disabled = {isHintLimitReached && !gameState.hintsUsed.tagline}
              isTagline = {true}
            />
          </div>

          <div className = "flex gap-4">
            <button
              onClick = {revealBlur}
              disabled = {gameState.blurLevel >= 4 || isHintLimitReached}
              className = "cursor-pointer flex-1 py-4 border-2 border-red-500 text-red-600 dark:text-red-400 bg-white dark:bg-neutral-800 rounded-2xl font-courierprime-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-100"
            >
              <IconEye className = "w-5 h-5" />
              {translations("revealBlur")} (-{Math.round(GAME_CONFIG.blurReveal * difficultyConfig.hintCostMultiplier)} pts)
            </button>
            <button
              onClick = {skipRound}
              className = "cursor-pointer flex-1 py-4 border-2 border-neutral-400 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 rounded-2xl font-courierprime-bold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-100"
            >
              <IconSkipForward className = "w-5 h-5" />
              {translations("skipRound")} (-{GAME_CONFIG.skipRound} pts)
            </button>
          </div>
        </div>
      </div>

      {hintModal && (
        <div
          className = "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg px-4"
          onClick = {() => setHintModal(null)}
        >
          <div
            className = "relative max-w-2xl w-full drop-shadow-2xl"
            onClick = {(e) => e.stopPropagation()}
          >
            <div className = "absolute -inset-0.5 bg-linear-to-br from-red-500/45 via-amber-400/30 to-yellow-400/45 rounded-3xl blur-xl opacity-80" aria-hidden = "true" />

            <div className = "relative bg-neutral-50/98 dark:bg-neutral-900/98 rounded-3xl border border-white/20 dark:border-black/30 shadow-2xl shadow-black/80 p-8">
              <div className = "flex items-start justify-between mb-6">
                <div className = "flex items-center gap-3">
                  <div className = "h-11 w-11 rounded-2xl bg-linear-to-br from-red-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 font-courierprime-bold text-xl">
                    !
                  </div>
                  <div>
                    <p className = "text-sm uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 font-robotoslab-medium">Hint reveal</p>
                    <h3 className = "text-2xl font-courierprime-bold text-neutral-900 dark:text-white leading-tight">
                      {hintModal.title}
                    </h3>
                  </div>
                </div>
                <button
                  className = "h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:scale-105 active:scale-95 transition-all font-courierprime-bold border border-neutral-300/60 dark:border-neutral-700/80"
                  onClick = {() => setHintModal(null)}
                  aria-label = "Close"
                >
                  ×
                </button>
              </div>

              <div className = "bg-neutral-100 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 shadow-inner">
                <p className = "text-lg font-robotoslab-medium text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {hintModal.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
