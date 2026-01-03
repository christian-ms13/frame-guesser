# Complete Game Enhancement Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture & Design Decisions](#architecture--design-decisions)
3. [Enhanced TMDB Integration](#enhanced-tmdb-integration)
4. [Game Type System](#game-type-system)
5. [Core Game Component](#core-game-component)
6. [Database Schema](#database-schema)
7. [Server Actions](#server-actions)
8. [UI Components](#ui-components)
9. [Internationalization](#internationalization)
10. [Installation & Setup](#installation--setup)

---

## Overview

This guide provides a complete roadmap to transform your basic frame-guessing game into a professional, feature-rich gaming experience with:

- **Multiple Difficulty Levels**: Easy, Medium, Hard with different scoring systems
- **Round-Based Gameplay**: 5 rounds per game session
- **Lives System**: 3 hearts with visual feedback
- **Advanced Hint System**: 4 hint types (genre, year, rating, tagline)
- **Progressive Blur Reveal**: 4 blur levels with visual feedback
- **Smart Scoring**: Base points + time bonuses - penalties for hints/reveals
- **Fuzzy Matching**: Forgiving answer validation
- **Database Persistence**: Save results, leaderboard, user stats
- **Modern UI**: Animations, gradients, professional design
- **Full i18n Support**: Multi-language ready

---

## Architecture & Design Decisions

### Component Structure
```
src/
├── types/
│   └── game.ts                 # Game-specific types
├── utils/
│   └── tmdb.ts                 # Enhanced TMDB API utilities
├── components/game/
│   ├── Game.tsx                # Main game component (client)
│   └── Leaderboard.tsx         # Leaderboard component
├── app/
│   ├── [locale]/play/
│   │   └── page.tsx            # Game page (server)
│   └── game/
│       └── actions.ts          # Server actions
```

### State Management Strategy
- **Local State**: Use `useState` for UI state (blur levels, hints used)
- **Game State**: Centralized state object containing all game data
- **Server State**: Database for persistence, not real-time game state

### Key Design Principles
1. **Server Components for Data Fetching**: Fetch movies on server, pass to client
2. **Client Components for Interactivity**: Game logic runs on client for responsiveness
3. **Type Safety**: Full TypeScript typing throughout
4. **Progressive Enhancement**: Start with basic features, add complexity
5. **Internationalization First**: All text via translation keys

---

## Enhanced TMDB Integration

### Step 1: Install Required Types
```bash
npm install --save-dev @types/node
```

### Step 2: Create Enhanced TMDB Utility

**File**: `src/utils/tmdb.ts`

```typescript
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

// Enhanced movie interface with all game-required data
export interface GameMovie {
  id: number;
  title: string;
  backdrop_path: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  genres: string[];
  vote_average: number;
  tagline: string;
  runtime: number;
  year: number;
}

// Fetch detailed movie information
async function fetchMovieDetails(movieId: number): Promise<GameMovie | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`
    );

    if (!response.ok) return null;

    const movie = await response.json();

    // Filter out movies with missing critical data
    if (!movie.backdrop_path || !movie.title) return null;

    return {
      id: movie.id,
      title: movie.title,
      backdrop_path: `${IMAGE_BASE_URL}${movie.backdrop_path}`,
      poster_path: movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      overview: movie.overview || "No overview available",
      release_date: movie.release_date || "",
      genres: movie.genres?.map((g: any) => g.name) || [],
      vote_average: movie.vote_average || 0,
      tagline: movie.tagline || "",
      runtime: movie.runtime || 0,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
    };
  } catch (error) {
    console.error(`Error fetching movie ${movieId}:`, error);
    return null;
  }
}

// Fetch multiple quality movies for game
export async function fetchMultipleMovies(
  count: number = 10
): Promise<GameMovie[]> {
  const movies: GameMovie[] = [];
  const usedIds = new Set<number>();

  // Categories that typically have good backdrop images
  const categories = [
    "popular",
    "top_rated",
    "now_playing",
  ];

  let attempts = 0;
  const maxAttempts = count * 3; // Allow some failures

  while (movies.length < count && attempts < maxAttempts) {
    attempts++;

    // Randomly pick a category
    const category = categories[Math.floor(Math.random() * categories.length)];
    const randomPage = Math.floor(Math.random() * 20) + 1;

    try {
      const response = await fetch(
        `${BASE_URL}/movie/${category}?api_key=${API_KEY}&language=en-US&page=${randomPage}`
      );

      if (!response.ok) continue;

      const data = await response.json();
      const results = data.results || [];

      if (results.length === 0) continue;

      // Pick random movie from page
      const randomMovie = results[Math.floor(Math.random() * results.length)];

      // Skip if already used
      if (usedIds.has(randomMovie.id)) continue;

      // Fetch detailed information
      const detailedMovie = await fetchMovieDetails(randomMovie.id);

      if (detailedMovie) {
        movies.push(detailedMovie);
        usedIds.add(detailedMovie.id);
      }
    } catch (error) {
      console.error("Error fetching from category:", category, error);
    }
  }

  return movies;
}

// Original function kept for backwards compatibility
export async function fetchRandomMovie() {
  const movies = await fetchMultipleMovies(1);
  return movies[0] || null;
}
```

**Key Features**:
- **GameMovie Interface**: Contains all data needed for game mechanics (genres for hints, year for hints, rating for hints, etc.)
- **Quality Filtering**: Only returns movies with backdrop images and complete data
- **Multiple Categories**: Pulls from popular, top_rated, now_playing for variety
- **Deduplication**: Ensures no duplicate movies in same game session
- **Error Handling**: Gracefully handles API failures

---

## Game Type System

### Step 1: Create Game Types File

**File**: `src/types/game.ts`

```typescript
export type DifficultyLevel = "easy" | "medium" | "hard";

export interface GameConfig {
  totalRounds: number;
  maxLives: number;
  baseScore: {
    easy: number;
    medium: number;
    hard: number;
  };
  timeBonus: {
    max: number; // Maximum bonus points
    interval: number; // Seconds to lose 1 point
  };
  hints: {
    genreReveal: number;
    yearReveal: number;
    ratingReveal: number;
    taglineReveal: number;
  };
  blurReveal: number;
  skipRound: number;
}

export interface GameState {
  // Round management
  currentRound: number;
  totalRounds: number;

  // Lives & score
  lives: number;
  score: number;

  // Current round state
  currentMovie: GameMovie | null;
  guess: string;
  isCorrect: boolean | null;
  roundComplete: boolean;

  // Hints & reveals
  hintsUsed: {
    genre: boolean;
    year: boolean;
    rating: boolean;
    tagline: boolean;
  };
  blurLevel: number; // 0 = fully blurred, 4 = fully revealed
  revealsUsed: number;

  // Timing
  roundStartTime: number | null;

  // Game over
  gameOver: boolean;
  gameWon: boolean;
}

export interface RoundResult {
  round: number;
  movie: string;
  correct: boolean;
  score: number;
  timeSeconds: number;
}

// Import GameMovie from tmdb
export type { GameMovie } from "@/utils/tmdb";
```

**Key Design Decisions**:
- **Difficulty System**: Three levels with different scoring multipliers
- **Penalty System**: Clear point deductions for hints/reveals encourage skilled play
- **Time-Based Scoring**: Rewards quick guesses, loses points over time
- **Comprehensive State**: Single source of truth for all game data
- **Round Results**: Track detailed stats for each round

---

## Core Game Component

### Step 1: Install Icon Library

```bash
npm install lucide-react
```

### Step 2: Update Play Page (Server Component)

**File**: `src/app/[locale]/play/page.tsx`

```typescript
import { fetchMultipleMovies } from "@/utils/tmdb";
import Game from "@/components/game/Game";

export default async function PlayPage() {
  // Fetch 10 movies for the game (5 rounds + 5 backups)
  const movies = await fetchMultipleMovies(10);

  if (!movies || movies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unable to load game</h1>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return <Game movies={movies} />;
}
```

### Step 3: Create Main Game Component

**File**: `src/components/game/Game.tsx`

This is a large file (650+ lines). Here's the structure with key sections:

```typescript
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Trophy,
  Heart,
  Clock,
  Star,
  Lightbulb,
  Eye,
  SkipForward,
  ArrowRight,
} from "lucide-react";
import type { GameMovie } from "@/utils/tmdb";
import type {
  DifficultyLevel,
  GameState,
  GameConfig,
  RoundResult,
} from "@/types/game";
import { saveGameResult } from "@/app/game/actions";
import { useAuth } from "@/hooks/useAuth";

// Game configuration constants
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
    interval: 2, // Lose 1 point every 2 seconds
  },
  hints: {
    genreReveal: 10,
    yearReveal: 15,
    ratingReveal: 15,
    taglineReveal: 20,
  },
  blurReveal: 25,
  skipRound: 50,
};

interface GameProps {
  movies: GameMovie[];
}

export default function Game({ movies }: GameProps) {
  const t = useTranslations("gamePage");
  const { user } = useAuth();

  // Difficulty selection state
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize game state
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
      tagline: false,
    },
    blurLevel: 0,
    revealsUsed: 0,
    roundStartTime: null,
    gameOver: false,
    gameWon: false,
  };

  const [gameState, setGameState] = useState<GameState>(initialState);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [timer, setTimer] = useState(0);

  // Timer effect
  useEffect(() => {
    if (!gameState.roundStartTime || gameState.roundComplete) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - gameState.roundStartTime!) / 1000
      );
      setTimer(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.roundStartTime, gameState.roundComplete]);

  // Calculate time bonus
  const calculateTimeBonus = useCallback((seconds: number): number => {
    const { max, interval } = GAME_CONFIG.timeBonus;
    const penalty = Math.floor(seconds / interval);
    return Math.max(0, max - penalty);
  }, []);

  // Calculate round score
  const calculateRoundScore = useCallback(
    (timeSeconds: number): number => {
      if (!difficulty) return 0;

      let score = GAME_CONFIG.baseScore[difficulty];

      // Add time bonus
      score += calculateTimeBonus(timeSeconds);

      // Subtract hint penalties
      if (gameState.hintsUsed.genre) score -= GAME_CONFIG.hints.genreReveal;
      if (gameState.hintsUsed.year) score -= GAME_CONFIG.hints.yearReveal;
      if (gameState.hintsUsed.rating) score -= GAME_CONFIG.hints.ratingReveal;
      if (gameState.hintsUsed.tagline) score -= GAME_CONFIG.hints.taglineReveal;

      // Subtract blur reveal penalties
      score -= gameState.revealsUsed * GAME_CONFIG.blurReveal;

      return Math.max(0, score);
    },
    [difficulty, gameState.hintsUsed, gameState.revealsUsed, calculateTimeBonus]
  );

  // Fuzzy match for movie titles
  const fuzzyMatch = useCallback((guess: string, title: string): boolean => {
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const normalizedGuess = normalize(guess);
    const normalizedTitle = normalize(title);

    // Exact match
    if (normalizedGuess === normalizedTitle) return true;

    // Check if guess is contained in title
    if (normalizedTitle.includes(normalizedGuess)) return true;

    // Check word-by-word matching
    const guessWords = normalizedGuess.split(" ");
    const titleWords = normalizedTitle.split(" ");

    // All guess words must appear in title
    return guessWords.every((word) =>
      titleWords.some((titleWord) => titleWord.includes(word))
    );
  }, []);

  // Start game with selected difficulty
  const startGame = useCallback(
    (selectedDifficulty: DifficultyLevel) => {
      setDifficulty(selectedDifficulty);
      setGameStarted(true);
      setGameState({
        ...initialState,
        currentRound: 1,
        currentMovie: movies[0],
        roundStartTime: Date.now(),
      });
      setRoundResults([]);
      setTimer(0);
    },
    [movies]
  );

  // Submit guess
  const handleSubmitGuess = useCallback(() => {
    if (!gameState.currentMovie || !gameState.guess.trim()) return;

    const timeSeconds = Math.floor(
      (Date.now() - gameState.roundStartTime!) / 1000
    );
    const correct = fuzzyMatch(gameState.guess, gameState.currentMovie.title);
    const roundScore = correct ? calculateRoundScore(timeSeconds) : 0;

    // Record round result
    const result: RoundResult = {
      round: gameState.currentRound,
      movie: gameState.currentMovie.title,
      correct,
      score: roundScore,
      timeSeconds,
    };
    setRoundResults((prev) => [...prev, result]);

    // Update game state
    setGameState((prev) => ({
      ...prev,
      isCorrect: correct,
      roundComplete: true,
      score: prev.score + roundScore,
      lives: correct ? prev.lives : prev.lives - 1,
    }));
  }, [
    gameState.currentMovie,
    gameState.guess,
    gameState.roundStartTime,
    gameState.currentRound,
    fuzzyMatch,
    calculateRoundScore,
  ]);

  // Next round
  const handleNextRound = useCallback(async () => {
    const nextRound = gameState.currentRound + 1;
    const noLivesLeft = gameState.lives <= 0;
    const lastRound = nextRound > GAME_CONFIG.totalRounds;

    if (noLivesLeft || lastRound) {
      // Game over
      setGameState((prev) => ({
        ...prev,
        gameOver: true,
        gameWon: prev.lives > 0,
      }));

      // Save to database if user is logged in
      if (user && difficulty) {
        try {
          await saveGameResult({
            userId: user.id,
            difficulty,
            score: gameState.score,
            roundsCompleted: gameState.currentRound,
            livesRemaining: gameState.lives,
          });
        } catch (error) {
          console.error("Failed to save game result:", error);
        }
      }
    } else {
      // Start next round
      setGameState({
        ...initialState,
        currentRound: nextRound,
        totalRounds: GAME_CONFIG.totalRounds,
        lives: gameState.lives,
        score: gameState.score,
        currentMovie: movies[nextRound - 1],
        roundStartTime: Date.now(),
      });
      setTimer(0);
    }
  }, [
    gameState.currentRound,
    gameState.lives,
    gameState.score,
    movies,
    user,
    difficulty,
  ]);

  // Hint handlers
  const revealHint = useCallback((hintType: keyof typeof gameState.hintsUsed) => {
    setGameState((prev) => ({
      ...prev,
      hintsUsed: {
        ...prev.hintsUsed,
        [hintType]: true,
      },
    }));
  }, []);

  // Blur reveal handler
  const revealBlur = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      blurLevel: Math.min(4, prev.blurLevel + 1),
      revealsUsed: prev.revealsUsed + 1,
    }));
  }, []);

  // Skip round handler
  const skipRound = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      score: Math.max(0, prev.score - GAME_CONFIG.skipRound),
      isCorrect: false,
      roundComplete: true,
      lives: prev.lives - 1,
    }));
  }, []);

  // Restart game
  const restartGame = useCallback(() => {
    setDifficulty(null);
    setGameStarted(false);
    setGameState(initialState);
    setRoundResults([]);
    setTimer(0);
  }, []);

  // Blur level CSS class
  const blurClass = useMemo(() => {
    const levels = [
      "blur-[50px]",
      "blur-[30px]",
      "blur-[15px]",
      "blur-[5px]",
      "blur-none",
    ];
    return levels[gameState.blurLevel];
  }, [gameState.blurLevel]);

  // Render difficulty selection
  if (!gameStarted || !difficulty) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t("selectDifficulty")}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Easy */}
            <button
              onClick={() => startGame("easy")}
              className="p-6 rounded-xl border-2 border-green-500 hover:bg-green-500/10 transition-all group"
            >
              <div className="text-4xl mb-3">😊</div>
              <h3 className="text-2xl font-bold text-green-500 mb-2">
                {t("difficulty.easy")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("difficulty.easyDesc")}
              </p>
              <div className="text-lg font-semibold text-green-600">
                {GAME_CONFIG.baseScore.easy} {t("basePoints")}
              </div>
            </button>

            {/* Medium */}
            <button
              onClick={() => startGame("medium")}
              className="p-6 rounded-xl border-2 border-yellow-500 hover:bg-yellow-500/10 transition-all group"
            >
              <div className="text-4xl mb-3">😐</div>
              <h3 className="text-2xl font-bold text-yellow-500 mb-2">
                {t("difficulty.medium")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("difficulty.mediumDesc")}
              </p>
              <div className="text-lg font-semibold text-yellow-600">
                {GAME_CONFIG.baseScore.medium} {t("basePoints")}
              </div>
            </button>

            {/* Hard */}
            <button
              onClick={() => startGame("hard")}
              className="p-6 rounded-xl border-2 border-red-500 hover:bg-red-500/10 transition-all group"
            >
              <div className="text-4xl mb-3">😤</div>
              <h3 className="text-2xl font-bold text-red-500 mb-2">
                {t("difficulty.hard")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("difficulty.hardDesc")}
              </p>
              <div className="text-lg font-semibold text-red-600">
                {GAME_CONFIG.baseScore.hard} {t("basePoints")}
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render game over screen
  if (gameState.gameOver) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {gameState.gameWon ? "🎉" : "😢"}
            </div>
            <h1 className="text-4xl font-bold mb-2">
              {gameState.gameWon ? t("results.victory") : t("results.gameOver")}
            </h1>
            <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {gameState.score}
            </div>
            <p className="text-gray-600">{t("results.finalScore")}</p>
          </div>

          {/* Round by round results */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">{t("results.roundByRound")}</h2>
            <div className="space-y-2">
              {roundResults.map((result) => (
                <div
                  key={result.round}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        result.correct ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <span className="text-white font-bold">
                        {result.round}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{result.movie}</div>
                      <div className="text-sm text-gray-500">
                        {result.timeSeconds}s
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    +{result.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={restartGame}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
          >
            {t("playAgain")}
          </button>
        </div>
      </div>
    );
  }

  // Render round feedback
  if (gameState.roundComplete && gameState.isCorrect !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="text-8xl mb-6">
            {gameState.isCorrect ? "🎉" : "❌"}
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {gameState.isCorrect ? t("feedback.correct") : t("feedback.wrong")}
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            {gameState.currentMovie?.title}
          </p>

          {gameState.isCorrect && (
            <div className="text-5xl font-bold text-purple-600 mb-4">
              +{roundResults[roundResults.length - 1]?.score || 0}
            </div>
          )}

          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-2xl font-bold">{gameState.score}</span>
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: GAME_CONFIG.maxLives }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-6 h-6 ${
                    i < gameState.lives
                      ? "fill-red-500 text-red-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleNextRound}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            {gameState.currentRound < GAME_CONFIG.totalRounds && gameState.lives > 0
              ? t("nextRound")
              : t("seeResults")}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Render active game round
  if (!gameState.currentMovie) return null;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-2xl font-bold">{gameState.score}</span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: GAME_CONFIG.maxLives }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-6 h-6 transition-all ${
                    i < gameState.lives
                      ? "fill-red-500 text-red-500 scale-100"
                      : "text-gray-300 scale-75"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-lg font-semibold">{timer}s</span>
            </div>
          </div>

          <div className="text-lg font-semibold">
            {t("round")} {gameState.currentRound} / {GAME_CONFIG.totalRounds}
          </div>
        </div>

        {/* Movie image */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 shadow-2xl">
          <Image
            src={gameState.currentMovie.backdrop_path}
            alt="Movie frame"
            fill
            className={`object-cover transition-all duration-500 ${blurClass}`}
            priority
          />
        </div>

        {/* Blur progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">{t("clarity")}</span>
            <span className="text-sm text-gray-600">
              {gameState.blurLevel}/4
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
              style={{ width: `${(gameState.blurLevel / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Guess input */}
        <div className="mb-6">
          <input
            type="text"
            value={gameState.guess}
            onChange={(e) =>
              setGameState((prev) => ({ ...prev, guess: e.target.value }))
            }
            onKeyDown={(e) => e.key === "Enter" && handleSubmitGuess()}
            placeholder={t("guessPlaceholder")}
            className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={handleSubmitGuess}
            disabled={!gameState.guess.trim()}
            className="w-full mt-3 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("submitGuess")}
          </button>
        </div>

        {/* Hints section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <HintButton
            icon={<Star className="w-5 h-5" />}
            label={t("hints.genre")}
            value={
              gameState.hintsUsed.genre
                ? gameState.currentMovie.genres.join(", ") || t("hints.noGenre")
                : undefined
            }
            onClick={() => revealHint("genre")}
            disabled={gameState.hintsUsed.genre}
            cost={GAME_CONFIG.hints.genreReveal}
          />
          <HintButton
            icon={<Clock className="w-5 h-5" />}
            label={t("hints.year")}
            value={
              gameState.hintsUsed.year
                ? String(gameState.currentMovie.year)
                : undefined
            }
            onClick={() => revealHint("year")}
            disabled={gameState.hintsUsed.year}
            cost={GAME_CONFIG.hints.yearReveal}
          />
          <HintButton
            icon={<Trophy className="w-5 h-5" />}
            label={t("hints.rating")}
            value={
              gameState.hintsUsed.rating
                ? `⭐ ${gameState.currentMovie.vote_average.toFixed(1)}`
                : undefined
            }
            onClick={() => revealHint("rating")}
            disabled={gameState.hintsUsed.rating}
            cost={GAME_CONFIG.hints.ratingReveal}
          />
          <HintButton
            icon={<Lightbulb className="w-5 h-5" />}
            label={t("hints.tagline")}
            value={
              gameState.hintsUsed.tagline
                ? gameState.currentMovie.tagline || t("hints.noTagline")
                : undefined
            }
            onClick={() => revealHint("tagline")}
            disabled={gameState.hintsUsed.tagline}
            cost={GAME_CONFIG.hints.taglineReveal}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={revealBlur}
            disabled={gameState.blurLevel >= 4}
            className="flex-1 py-3 border-2 border-blue-500 text-blue-500 rounded-xl font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            {t("revealMore")} (-{GAME_CONFIG.blurReveal})
          </button>
          <button
            onClick={skipRound}
            className="flex-1 py-3 border-2 border-gray-500 text-gray-500 rounded-xl font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            <SkipForward className="w-5 h-5" />
            {t("skip")} (-{GAME_CONFIG.skipRound})
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for hint buttons
interface HintButtonProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick: () => void;
  disabled: boolean;
  cost: number;
}

function HintButton({
  icon,
  label,
  value,
  onClick,
  disabled,
  cost,
}: HintButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-3 rounded-lg border-2 border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      {value ? (
        <div className="text-sm font-bold text-purple-600">{value}</div>
      ) : (
        <div className="text-xs text-gray-500">-{cost} pts</div>
      )}
    </button>
  );
}
```

**Key Implementation Details**:
- **Client Component**: Marked with "use client" for interactivity
- **State Management**: Single comprehensive gameState object
- **Callbacks**: Use useCallback for performance, preventing unnecessary re-renders
- **Timer**: useEffect-based timer that updates every second
- **Fuzzy Matching**: Forgiving algorithm that handles typos, punctuation, word order
- **Progressive UI**: Different screens for difficulty selection, active game, round feedback, game over
- **Animations**: CSS transitions for smooth state changes
- **Accessibility**: Proper button states, keyboard support (Enter to submit)

---

## Database Schema

### Step 1: Create Migration File

**File**: `supabase/migrations/20260103_add_game_tables.sql`

```sql
-- Create leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  score INTEGER NOT NULL DEFAULT 0,
  rounds_completed INTEGER NOT NULL DEFAULT 0,
  lives_remaining INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create game_sessions table for detailed history
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  score INTEGER NOT NULL DEFAULT 0,
  rounds_completed INTEGER NOT NULL DEFAULT 0,
  lives_remaining INTEGER NOT NULL DEFAULT 0,
  round_results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON public.leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_difficulty ON public.leaderboard(difficulty);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON public.leaderboard(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_difficulty ON public.game_sessions(difficulty);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON public.game_sessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Leaderboard RLS Policies
CREATE POLICY "Public can view leaderboard"
  ON public.leaderboard FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own leaderboard entries"
  ON public.leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leaderboard entries"
  ON public.leaderboard FOR DELETE
  USING (auth.uid() = user_id);

-- Game sessions RLS Policies
CREATE POLICY "Users can view own game sessions"
  ON public.game_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game sessions"
  ON public.game_sessions FOR UPDATE
  USING (auth.uid() = user_id);
```

### Step 2: Update Supabase Types

**File**: `src/types/supabase.ts`

Add these type definitions:

```typescript
export interface Database {
  public: {
    Tables: {
      profiles: {
        // ... existing profiles definition
      };
      leaderboard: {
        Row: {
          id: string;
          user_id: string;
          username: string | null;
          difficulty: "easy" | "medium" | "hard";
          score: number;
          rounds_completed: number;
          lives_remaining: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username?: string | null;
          difficulty: "easy" | "medium" | "hard";
          score: number;
          rounds_completed: number;
          lives_remaining: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string | null;
          difficulty?: "easy" | "medium" | "hard";
          score?: number;
          rounds_completed?: number;
          lives_remaining?: number;
          created_at?: string;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          difficulty: "easy" | "medium" | "hard";
          score: number;
          rounds_completed: number;
          lives_remaining: number;
          round_results: any[] | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          difficulty: "easy" | "medium" | "hard";
          score: number;
          rounds_completed: number;
          lives_remaining: number;
          round_results?: any[] | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          difficulty?: "easy" | "medium" | "hard";
          score?: number;
          rounds_completed?: number;
          lives_remaining?: number;
          round_results?: any[] | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
  };
}
```

### Step 3: Run Migration

```bash
# If using Supabase CLI locally
supabase db push

# Or run the SQL in Supabase Studio > SQL Editor
```

---

## Server Actions

**File**: `src/app/game/actions.ts`

```typescript
"use server";

import { createClient } from "@/utils/supabase/server";
import type { DifficultyLevel } from "@/types/game";

export interface GameResult {
  userId: string;
  difficulty: DifficultyLevel;
  score: number;
  roundsCompleted: number;
  livesRemaining: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string | null;
  difficulty: DifficultyLevel;
  score: number;
  roundsCompleted: number;
  livesRemaining: number;
  createdAt: string;
}

export interface UserStats {
  totalGames: number;
  averageScore: number;
  bestScore: number;
  gamesWon: number;
}

// Save game result to both leaderboard and sessions
export async function saveGameResult(result: GameResult) {
  const supabase = await createClient();

  // Get username from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", result.userId)
    .single();

  // Insert into leaderboard
  const { error: leaderboardError } = await supabase
    .from("leaderboard")
    .insert({
      user_id: result.userId,
      username: profile?.username || null,
      difficulty: result.difficulty,
      score: result.score,
      rounds_completed: result.roundsCompleted,
      lives_remaining: result.livesRemaining,
    });

  if (leaderboardError) {
    console.error("Error saving to leaderboard:", leaderboardError);
    throw new Error("Failed to save game result");
  }

  // Insert into game sessions
  const { error: sessionError } = await supabase
    .from("game_sessions")
    .insert({
      user_id: result.userId,
      difficulty: result.difficulty,
      score: result.score,
      rounds_completed: result.roundsCompleted,
      lives_remaining: result.livesRemaining,
      completed_at: new Date().toISOString(),
    });

  if (sessionError) {
    console.error("Error saving game session:", sessionError);
  }

  return { success: true };
}

// Get leaderboard with optional difficulty filter
export async function getLeaderboard(
  difficulty?: DifficultyLevel,
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();

  let query = supabase
    .from("leaderboard")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit);

  if (difficulty) {
    query = query.eq("difficulty", difficulty);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  return (
    data?.map((entry) => ({
      id: entry.id,
      username: entry.username,
      difficulty: entry.difficulty as DifficultyLevel,
      score: entry.score,
      roundsCompleted: entry.rounds_completed,
      livesRemaining: entry.lives_remaining,
      createdAt: entry.created_at,
    })) || []
  );
}

// Get user statistics
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("game_sessions")
    .select("score, lives_remaining")
    .eq("user_id", userId);

  if (error || !data) {
    console.error("Error fetching user stats:", error);
    return null;
  }

  const totalGames = data.length;
  const averageScore =
    data.reduce((sum, game) => sum + game.score, 0) / totalGames || 0;
  const bestScore = Math.max(...data.map((game) => game.score), 0);
  const gamesWon = data.filter((game) => game.lives_remaining > 0).length;

  return {
    totalGames,
    averageScore: Math.round(averageScore),
    bestScore,
    gamesWon,
  };
}

// Get user's rank in leaderboard
export async function getUserRank(
  userId: string,
  difficulty?: DifficultyLevel
): Promise<number | null> {
  const supabase = await createClient();

  // Get user's best score
  let userQuery = supabase
    .from("leaderboard")
    .select("score")
    .eq("user_id", userId)
    .order("score", { ascending: false })
    .limit(1);

  if (difficulty) {
    userQuery = userQuery.eq("difficulty", difficulty);
  }

  const { data: userData, error: userError } = await userQuery.single();

  if (userError || !userData) return null;

  // Count how many scores are better
  let rankQuery = supabase
    .from("leaderboard")
    .select("score", { count: "exact", head: true })
    .gt("score", userData.score);

  if (difficulty) {
    rankQuery = rankQuery.eq("difficulty", difficulty);
  }

  const { count, error: rankError } = await rankQuery;

  if (rankError) return null;

  return (count || 0) + 1;
}
```

**Key Features**:
- **Server Actions**: Run on server, secure database access
- **Type Safety**: Full TypeScript typing for inputs/outputs
- **Error Handling**: Graceful error handling with console logging
- **Flexible Queries**: Optional difficulty filtering
- **Stats Calculation**: Compute average, best, total games
- **Rank Calculation**: Determine user's position in leaderboard

---

## UI Components

### Optional: Leaderboard Component

**File**: `src/components/game/Leaderboard.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { getLeaderboard, type LeaderboardEntry } from "@/app/game/actions";
import type { DifficultyLevel } from "@/types/game";

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      const data = await getLeaderboard(
        difficulty === "all" ? undefined : difficulty
      );
      setEntries(data);
      setLoading(false);
    }
    fetchLeaderboard();
  }, [difficulty]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Leaderboard
      </h1>

      {/* Difficulty filter */}
      <div className="flex gap-2 mb-6 justify-center">
        {["all", "easy", "medium", "hard"].map((diff) => (
          <button
            key={diff}
            onClick={() => setDifficulty(diff as DifficultyLevel | "all")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              difficulty === diff
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Player</th>
                <th className="px-6 py-3 text-center">Difficulty</th>
                <th className="px-6 py-3 text-center">Score</th>
                <th className="px-6 py-3 text-center">Rounds</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={`border-b ${
                    index < 3 ? "bg-yellow-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                      {index === 1 && <Trophy className="w-5 h-5 text-gray-400" />}
                      {index === 2 && <Trophy className="w-5 h-5 text-orange-600" />}
                      <span className="font-bold">{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {entry.username || "Anonymous"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        entry.difficulty === "easy"
                          ? "bg-green-100 text-green-700"
                          : entry.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {entry.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-purple-600">
                    {entry.score}
                  </td>
                  <td className="px-6 py-4 text-center">{entry.roundsCompleted}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## Internationalization

### English Translations

**File**: `messages/en.json`

Add this section:

```json
{
  "gamePage": {
    "selectDifficulty": "Select Difficulty",
    "difficulty": {
      "easy": "Easy",
      "easyDesc": "Relaxed gameplay, more time",
      "medium": "Medium",
      "mediumDesc": "Balanced challenge",
      "hard": "Hard",
      "hardDesc": "Intense challenge, high stakes"
    },
    "basePoints": "base points",
    "round": "Round",
    "score": "Score",
    "lives": "Lives",
    "clarity": "Image Clarity",
    "guessPlaceholder": "Type your guess...",
    "submitGuess": "Submit Guess",
    "hints": {
      "genre": "Genre",
      "year": "Year",
      "rating": "Rating",
      "tagline": "Tagline",
      "noGenre": "No genre available",
      "noTagline": "No tagline available"
    },
    "revealMore": "Reveal More",
    "skip": "Skip Round",
    "feedback": {
      "correct": "Correct! 🎉",
      "wrong": "Wrong Answer"
    },
    "nextRound": "Next Round",
    "seeResults": "See Results",
    "results": {
      "victory": "Victory!",
      "gameOver": "Game Over",
      "finalScore": "Final Score",
      "roundByRound": "Round by Round"
    },
    "playAgain": "Play Again"
  }
}
```

### Spanish Translations

**File**: `messages/es.json`

Add this section:

```json
{
  "gamePage": {
    "selectDifficulty": "Seleccionar Dificultad",
    "difficulty": {
      "easy": "Fácil",
      "easyDesc": "Juego relajado, más tiempo",
      "medium": "Medio",
      "mediumDesc": "Desafío equilibrado",
      "hard": "Difícil",
      "hardDesc": "Desafío intenso, altas apuestas"
    },
    "basePoints": "puntos base",
    "round": "Ronda",
    "score": "Puntuación",
    "lives": "Vidas",
    "clarity": "Claridad de Imagen",
    "guessPlaceholder": "Escribe tu respuesta...",
    "submitGuess": "Enviar Respuesta",
    "hints": {
      "genre": "Género",
      "year": "Año",
      "rating": "Calificación",
      "tagline": "Eslogan",
      "noGenre": "Sin género disponible",
      "noTagline": "Sin eslogan disponible"
    },
    "revealMore": "Revelar Más",
    "skip": "Saltar Ronda",
    "feedback": {
      "correct": "¡Correcto! 🎉",
      "wrong": "Respuesta Incorrecta"
    },
    "nextRound": "Siguiente Ronda",
    "seeResults": "Ver Resultados",
    "results": {
      "victory": "¡Victoria!",
      "gameOver": "Juego Terminado",
      "finalScore": "Puntuación Final",
      "roundByRound": "Ronda por Ronda"
    },
    "playAgain": "Jugar de Nuevo"
  }
}
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install lucide-react
```

### 2. Environment Variables

Ensure your `.env.local` has:

```env
TMDB_API_KEY=your_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

1. Go to Supabase Studio > SQL Editor
2. Run the migration SQL from the Database Schema section
3. Verify tables were created in Table Editor

### 4. Type Generation (Optional)

If you want to auto-generate Supabase types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

### 5. Test the Game

```bash
npm run dev
```

Navigate to `/play` and test all features.

---

## Implementation Checklist

- [ ] Enhanced TMDB utility with `fetchMultipleMovies`
- [ ] Game types file with all interfaces
- [ ] Main Game component with all features
- [ ] Database migration with leaderboard tables
- [ ] Server actions for persistence
- [ ] Leaderboard component (optional)
- [ ] i18n translations for game
- [ ] Install lucide-react icons
- [ ] Test difficulty selection
- [ ] Test hint system
- [ ] Test blur reveal
- [ ] Test scoring calculation
- [ ] Test database persistence
- [ ] Test fuzzy matching
- [ ] Test game over screens
- [ ] Test round progression
- [ ] Add custom styling/branding
- [ ] Deploy and test in production

---

## Customization Ideas

### Scoring System
- Adjust base scores in `GAME_CONFIG`
- Change hint penalties
- Modify time bonus calculation
- Add combo multipliers for consecutive correct answers

### Difficulty Balancing
- Change number of rounds per difficulty
- Add different lives per difficulty
- Adjust blur reveal costs per difficulty
- Different movie categories per difficulty

### UI Enhancements
- Add sound effects
- Add particle animations on correct guesses
- Add progress bar animations
- Custom themes per difficulty

### Game Modes
- Time attack mode (fixed time per round)
- Endless mode (until all lives lost)
- Multiplayer mode (compare scores)
- Daily challenge (same movies for all players)

### Advanced Features
- Movie poster reveal as additional hint
- Cast/director hints
- Movie clip playback
- Social sharing of scores
- Achievements system

---

## Troubleshooting

### TMDB API Issues
- **Rate Limiting**: Add delays between requests
- **Missing Images**: Filter out movies without backdrop_path
- **API Key**: Ensure TMDB_API_KEY is set correctly

### Database Issues
- **RLS Errors**: Check user authentication
- **Missing Tables**: Verify migration ran successfully
- **Type Errors**: Regenerate Supabase types

### Game Logic Issues
- **Timer Not Starting**: Check roundStartTime is set
- **Scoring Wrong**: Verify calculateRoundScore logic
- **Fuzzy Match Too Loose**: Adjust fuzzyMatch algorithm

---

## Best Practices

1. **State Management**: Keep game state centralized in one object
2. **Type Safety**: Always use TypeScript types, avoid `any`
3. **Performance**: Use `useCallback` and `useMemo` for expensive operations
4. **Error Handling**: Always handle API errors gracefully
5. **User Experience**: Provide clear feedback for all actions
6. **Testing**: Test edge cases (no lives, max score, API failures)
7. **Accessibility**: Ensure keyboard navigation works
8. **Internationalization**: Never hardcode text, always use translation keys

---

## Next Steps

After implementing the basic game:

1. **Add Analytics**: Track which movies are hardest
2. **Social Features**: Friend leaderboards, challenges
3. **Content**: Add TV shows, anime, etc.
4. **Monetization**: Premium hints, ad-free mode
5. **Mobile App**: React Native version
6. **AI Features**: AI-powered difficulty adjustment

---

**Good luck with your implementation! 🎮**
