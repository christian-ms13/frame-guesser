"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"

import { saveGameResult } from "../../app/game/actions"
import { useAuth } from "../../hooks/useAuth"
import type { DifficultyLevel, GameConfig, GameState, RoundResult } from "../../types/game"
import type { GameMovie } from "../../utils/tmdb"
import { IconEasy, IconHard, IconMedium } from "./DifficultyIcons"
import { IconArrowRight, IconClock, IconEye, IconHeart, IconLightbulb, IconSkipForward, IconStar, IconTrophy } from "./GameIcons"
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
  skipRound: 50
}

interface GameProps {
  movies: GameMovie[]
}

interface HintButtonProps {
  icon: React.ReactNode
  label: string
  value?: string
  onClick: () => void
  disabled: boolean
  cost: number
}

function HintButton({
  icon,
  label,
  value,
  onClick,
  disabled,
  cost
}: HintButtonProps) {
  return (
    <button
      onClick = {onClick}
      disabled = {disabled}
      className = "p-3 rounded-lg border-2 border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
    >
      <div className = "flex items-center gap-2 mb-1">
        {icon}
        <span className = "text-sm font-semibold">{label}</span>
      </div>

      {value ? (
        <div className = "text-sm font-bold text-purple-600">{value}</div>
      ) : (
        <div className = "text-xs text-neutral-500">-{cost} pts</div>
      )}
    </button>
  )
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
              className = "cursor-pointer bg-white dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-neutral-800 dark:border-neutral-400 hover:scale-105"
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
              className = "cursor-pointer bg-white dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-neutral-800 dark:border-neutral-400 hover:scale-105"
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
              className = "cursor-pointer bg-white dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-neutral-800 dark:border-neutral-400 hover:scale-105"
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

  // ---

  if (gameState.gameOver) {
    return (
      <div className = "min-h-[90vh] flex items-center justify-center p-4">
        <div className = "max-w-4xl w-full">
          <div className = "text-center mb-8">
            <div className = "mb-4">
              {gameState.gameWon ? <IconFireworks className = "w-24 h-24" /> : <IconSad className = "w-24 h-24" />}
            </div>
            <h1 className = "text-4xl font-bold mb-2">
              {gameState.gameWon ? translations("gameOver.won") : translations("gameOver.lost")}
            </h1>
            <div className = "text-6xl font-bold">
              {gameState.score} {translations("basePoints")}
            </div>
          </div>

          <div className = "bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className = "text-2xl font-bold mb-4">
              {translations("results.roundByRound")}
            </h2>
            <div className = "space-y-2">
              {roundResults.map((result) => (
                <div
                  key = {result.round}
                  className = "flex items-center justify-between p-3 rounded-lg bg-neutral-50"
                >
                  <div className = "flex items-center gap-3">
                    <div className = {`w-8 h-8 rounded-full flex items-center justify-center ${result.correct ? "bg-green-500" : "bg-red-500"}`}>
                      <span className = "text-white font-bold">
                        {result.round}
                      </span>
                    </div>

                    <div>
                      <div className = "font-semibold">{result.movie}</div>
                      <div className = "text-sm text-neutral-500">
                        {result.timeSeconds}s
                      </div>
                    </div>
                  </div>

                  <div className = "text-lg font-bold text-purple-600">
                    +{result.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick = {restartGame}
            className = "cursor-pointer w-full py-4 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
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
        <div className = "max-w-2xl w-full text-center">
          <div className = "text-8xl mb-6">
            {gameState.isCorrect ? <IconCorrect className = "w-24 h-24" /> : <IconSad className = "w-24 h-24" />}
          </div>

          <h1 className = "text-4xl font-bold mb-4">
            {gameState.isCorrect ? translations("roundResult.correct") : translations("roundResult.incorrect")}
          </h1>

          <p className = "text-2xl text-neutral-600 mb-8">
            {gameState.currentMovie?.title}
          </p>

          {gameState.isCorrect && (
            <div className = "text-5xl font-bold text-purple-600 mb-4">
              +{roundResults[roundResults.length - 1]?.score}
            </div>
          )}

          <div className = "flex items-center justify-center gap-8 mb-8">
            <div className = "flex items-center gap-2">
              <IconTrophy className = "w-6 h-6 text-yellow-500" />
              <span className = "text-2xl font-bold">
                {gameState.score}
              </span>
            </div>
            <div className = "flex items-center gap-2">
              {Array.from({ length: GAME_CONFIG.maxLives }).map((_, i) => (
                <IconHeart
                  key = {i}
                  className = {`w-6 h-6 ${i < gameState.lives ? "text-red-500" : "text-neutral-300"}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick = {handleNextRound}
            className = "px-8 py-4 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            {gameState.currentRound < GAME_CONFIG.totalRounds && gameState.lives > 0
            ? translations("nextRound")
            : translations("seeResults")}
            <IconArrowRight className = "w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  // ---

  if (!gameState.currentMovie) return null

  return (
    <div className = "min-h-[90vh] p-4">
      <div className = "max-w-6xl mx-auto">
        <div className = "flex items-center justify-between mb-6">
          <div className = "flex items-center gap-6">
            <div className = "flex items-center gap-2">
              <IconTrophy className = "w-6 h-6 text-yellow-500" />
              <span className = "text-2xl font-bold">
                {gameState.score}
              </span>
            </div>

            <div className = "flex items-center gap-1">
              {Array.from({ length: GAME_CONFIG.maxLives }).map((_, i) => (
                <IconHeart
                  key = {i}
                  className = {`w-6 h-6 transition-all ${
                    i < gameState.lives
                      ? "text-red-500 scale-100"
                      : "text-neutral-300 scale-75"
                  }`}
                />
              ))}
            </div>

            <div className = "flex items-center gap-2">
              <IconClock className = "w-6 h-6 text-blue-500" />
              <span className = "text-lg font-semibold">
                {timer}s
              </span>
            </div>
          </div>

          <div className = "text-lg font-semibold">
            {translations("round")} {gameState.currentRound} / {GAME_CONFIG.totalRounds}
          </div>
        </div>

        <div className = "relative w-full aspect-video rounded-xl overflow-hidden mb-6 shadow-2xl">
          <Image
            src = {gameState.currentMovie ? gameState.currentMovie.backdrop_path : ""}
            alt = "Movie Frame"
            fill
            className = {`object-cover transition-all duration-500 ${blurClass}`}
            priority
          />
        </div>

        <div className = "mb-6">
          <div className = "flex items-center justify-between mb-2">
            <span className = "text-sm font-semibold">{translations("clarity")}</span>
            <span className = "text-sm text-neutral-600">{gameState.blurLevel}/4</span>
          </div>
          <div className = "h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className = "h-full bg-linear-to-r from-purple-600 to-pink-600 transition-all duration-300"
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
            className = "w-full px-6 py-4 text-lg rounded-xl border-2 border-neutral-300 focus:border-purple-500 focus:outline-none"
          />

          <button
            onClick = {handleSubmitGuess}
            disabled = {!gameState.guess.trim()}
            className = "w-full mt-3 py-4 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {translations("submitGuess")}
          </button>
        </div>

        <div className = "grid grid-cols-4 gap-3 mb-4">
            <HintButton
              icon = {<IconStar className = "w-5 h-5 text-yellow-500" />}
              label = {translations("hints.genre")}
              value = {
                gameState.hintsUsed.genre
                  ? gameState.currentMovie.genres.join(", ") || translations("hints.noGenre")
                  : undefined
              }
              onClick = {() => revealHint("genre")}
              disabled = {gameState.hintsUsed.genre}
              cost = {GAME_CONFIG.hints.genreReveal}
            />

            <HintButton
              icon = {<IconClock className = "w-5 h-5 text-blue-500" />}
              label = {translations("hints.year")}
              value = {
                gameState.hintsUsed.year
                  ? String(gameState.currentMovie.year)
                  : undefined
              }
              onClick = {() => revealHint("year")}
              disabled = {gameState.hintsUsed.year}
              cost = {GAME_CONFIG.hints.yearReveal}
            />

            <HintButton
              icon = {<IconTrophy className = "w-5 h-5 text-yellow-500" />}
              label = {translations("hints.rating")}
              value = {
                gameState.hintsUsed.rating
                  ? `${<IconStar className = "w-5 h-5 text-yellow-500" />} ${gameState.currentMovie.vote_average.toFixed(1)}`
                  : undefined
              }
              onClick = {() => revealHint("rating")}
              disabled = {gameState.hintsUsed.rating}
              cost = {GAME_CONFIG.hints.ratingReveal}
            />

            <HintButton
              icon = {<IconLightbulb className = "w-5 h-5 text-green-500" />}
              label = {translations("hints.tagline")}
              value = {
                gameState.hintsUsed.tagline
                  ? gameState.currentMovie.tagline || translations("hints.noTagline")
                  : undefined
              }
              onClick = {() => revealHint("tagline")}
              disabled = {gameState.hintsUsed.tagline}
              cost = {GAME_CONFIG.hints.taglineReveal}
            />
        </div>

        <div className = "flex gap-3">
          <button
            onClick = {revealBlur}
            disabled = {gameState.blurLevel >= 4}
            className = "cursor-pointer flex-1 py-3 border-2 border-blue-500 text-blue-500 rounded-xl font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            <IconEye className = "w-5 h-5" />
            {translations("revealBlur")} (-{GAME_CONFIG.blurReveal} pts)
          </button>
          <button
            onClick = {skipRound}
            className = "cursor-pointer flex-1 py-3 border-2 border-neutral-500 text-neutral-500 rounded-xl font-semibold hover:bg-neutral-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            <IconSkipForward className = "w-5 h-5" />
            {translations("skipRound")} (-{GAME_CONFIG.skipRound} pts)
          </button>
        </div>
      </div>
    </div>
  )
}
