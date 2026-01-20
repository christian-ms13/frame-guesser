# Complete Game Enhancement Implementation Guide
## A Step-by-Step Journey to Building a Professional Movie Guessing Game

## 📖 Table of Contents
1. [Overview & Vision](#overview--vision)
2. [Understanding the Architecture](#understanding-the-architecture)
3. [Phase 1: Enhanced TMDB Integration](#phase-1-enhanced-tmdb-integration)
4. [Phase 2: Game Type System](#phase-2-game-type-system)
5. [Phase 3: Core Game Component](#phase-3-core-game-component)
6. [Phase 4: Database Schema](#phase-4-database-schema)
7. [Phase 5: Server Actions](#phase-5-server-actions)
8. [Phase 6: UI Components](#phase-6-ui-components)
9. [Phase 7: Internationalization](#phase-7-internationalization)
10. [Phase 8: Installation & Setup](#phase-8-installation--setup)
11. [Testing & Troubleshooting](#testing--troubleshooting)

---

## Overview & Vision

### What You're Building

You're going to transform a simple "guess the movie" game into a **professional, engaging gaming experience** that rivals popular online games. Think of it like going from a prototype to a product ready for real users.

### The Complete Feature Set

By the end of this guide, your game will have:

#### 🎮 **Game Mechanics**
- **Multiple Difficulty Levels**: Easy, Medium, Hard - each with different scoring
  - *Why?* Players have different skill levels. This makes the game accessible to beginners while challenging for experts.
  
- **Round-Based Gameplay**: 5 rounds per game session
  - *Why?* Sessions are long enough to be engaging but short enough to complete in one sitting (5-10 minutes).
  
- **Lives System**: 3 hearts - lose one per wrong answer
  - *Why?* Creates tension and consequence. Players must think carefully before guessing.

#### 💡 **Strategic Elements**
- **Advanced Hint System**: 4 hint types (genre, year, rating, tagline)
  - *Why?* Gives players control over difficulty. They can trade points for information.
  
- **Progressive Blur Reveal**: 4 blur levels - image gets clearer with each reveal
  - *Why?* Visual progression creates a satisfying "aha!" moment when recognition clicks.

#### 📊 **Scoring System**
- **Base Points**: Different per difficulty (Easy: 100, Medium: 200, Hard: 300)
- **Time Bonus**: Faster guesses earn more points (up to +50 points)
- **Penalties**: Using hints or reveals reduces score
  - *Why?* Rewards skill and speed while allowing strategic tradeoffs.

#### 🎯 **User Experience**
- **Fuzzy Matching**: Accepts typos, punctuation variations, partial answers
  - *Why?* Nothing's more frustrating than knowing the answer but being marked wrong due to a typo.
  
- **Database Persistence**: All games saved, leaderboard, personal stats
  - *Why?* Players want to see progress and compete with others.
  
- **Modern UI**: Smooth animations, gradients, professional design
  - *Why?* First impressions matter. A polished UI makes the game feel premium.
  
- **Full Internationalization**: Multi-language support built-in
  - *Why?* Reach a global audience from day one.

### Implementation Timeline

**Estimated Time**: 4-6 hours (depending on your experience)

1. **Phase 1**: Enhanced TMDB Integration (30 min)
2. **Phase 2**: Game Type System (20 min)
3. **Phase 3**: Core Game Component (2-3 hours)
4. **Phase 4**: Database Schema (30 min)
5. **Phase 5**: Server Actions (30 min)
6. **Phase 6**: UI Components (30 min)
7. **Phase 7**: Internationalization (30 min)
8. **Phase 8**: Testing & Polish (30-60 min)

---

## Understanding the Architecture

Before writing code, let's understand **HOW** everything fits together and **WHY** we're structuring it this way.

### The Big Picture: Client vs. Server

Your app uses **Next.js App Router**, which means some code runs on the **server** (backend) and some runs on the **client** (browser).

#### 🖥️ Server Components (Backend)
**What they do**: Fetch data, access databases, call external APIs  
**Why use them**: Secure (API keys never exposed), fast initial load, SEO-friendly  
**Example in our game**: Fetching random movies from TMDB

#### 💻 Client Components (Frontend)
**What they do**: Handle user interactions, manage UI state, animations  
**Why use them**: Instant feedback, smooth interactions, no page reloads  
**Example in our game**: The entire game interface, timer, hint buttons

### File Structure & Responsibilities

```
src/
├── types/
│   └── game.ts                 # TypeScript type definitions
│                               # WHY: Type safety prevents bugs, autocomplete helps development
│
├── utils/
│   └── tmdb.ts                 # TMDB API communication functions
│                               # WHY: Centralized API logic, reusable across the app
│
├── components/game/
│   ├── Game.tsx                # Main game component (CLIENT)
│   │                           # WHY: Needs interactivity (useState, events)
│   └── Leaderboard.tsx         # Leaderboard display (CLIENT)
│                               # WHY: Needs filtering and dynamic updates
│
├── app/
│   ├── [locale]/play/
│   │   └── page.tsx            # Game page (SERVER)
│   │                           # WHY: Fetches initial movies securely before game starts
│   └── game/
│       └── actions.ts          # Server actions for database
│                               # WHY: Database credentials stay on server, never exposed
```

### State Management Philosophy

We'll use **three types of state**:

#### 1. **Local UI State** (`useState`)
- **What**: Things like "is this button hovered?", "which tab is active?"
- **Why**: Simple, component-specific state doesn't need complexity
- **Example**: Blur level, current guess input

#### 2. **Centralized Game State** (single `useState` object)
- **What**: All game data in ONE object: `gameState`
- **Why**: Easier to understand, prevents sync issues, easier to debug
- **Example**: 
  ```typescript
  {
    currentRound: 3,
    lives: 2,
    score: 450,
    hintsUsed: { genre: true, year: false, ... }
  }
  ```

#### 3. **Server State** (Database)
- **What**: Persisted data that survives page reloads
- **Why**: Players can see history, leaderboards, compete with others
- **Example**: Saved game results, user statistics

### Key Design Principles

#### 🎯 Principle 1: Server for Data, Client for Interaction

```
┌─────────────────┐
│  Server Page    │ ← Fetch 10 random movies from TMDB
│  (play/page.tsx)│ ← Pass movies to Game component
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Client Game    │ ← Receive movies as props
│  (Game.tsx)     │ ← Handle all game logic in browser
└─────────────────┘
```

**Why?** 
- Server: API key stays secret, faster data fetching
- Client: Instant responses, no network lag for every action

#### 🎯 Principle 2: Type Safety First

Every piece of data has a **type definition**:
```typescript
// ❌ BAD: What is movie? What properties does it have?
const movie = await fetchMovie();

// ✅ GOOD: TypeScript knows exactly what GameMovie contains
const movie: GameMovie = await fetchMovie();
```

**Why?** 
- Catch errors while coding, not after deploying
- Autocomplete shows you what's available
- Refactoring becomes safe and easy

#### 🎯 Principle 3: Progressive Enhancement

Build in **layers**:
1. Basic game loop (guess → submit → feedback)
2. Add hints system
3. Add blur reveal
4. Add scoring
5. Add database persistence

**Why?** 
- Each layer works independently
- Easy to test each feature
- If something breaks, you know which layer

#### 🎯 Principle 4: Internationalization from Day 1

**Never** hardcode text:
```typescript
// ❌ BAD
<button>Submit Guess</button>

// ✅ GOOD
<button>{t("submitGuess")}</button>
```

**Why?** 
- Adding languages later is painful
- Doing it now costs zero extra effort
- Reach global audience immediately

---

## Phase 1: Enhanced TMDB Integration

### 🎯 What We're Building

Right now, your app probably fetches ONE random movie. We need to fetch **MULTIPLE quality movies** because:
- 5 rounds require 5 different movies
- We want backup movies in case some have bad images
- We need extra data for hints (genres, year, rating, tagline)

### 🤔 Why This Matters

The TMDB API returns movies, but not all are suitable for our game:
- Some movies have NO backdrop image (can't play the game!)
- Some have incomplete data (missing genres, dates, etc.)
- Some are obscure and unfair to guess

**Our solution**: Smart fetching that filters for quality movies.

### Step 1.1: Install TypeScript Node Types

**What you're doing**: Installing type definitions for Node.js  
**Why**: TypeScript needs to know what `process.env` is

```bash
npm install --save-dev @types/node
```

**What happens**: 
- npm downloads type definitions
- TypeScript now understands Node.js globals
- You get autocomplete for environment variables

### Step 1.2: Create the Enhanced TMDB Utility

**What you're doing**: Creating a robust TMDB fetching system  
**Where**: `src/utils/tmdb.ts`  
**Why here**: Utils folder = reusable helper functions

Create or completely replace your `src/utils/tmdb.ts` file with this:

```typescript
// =============================================================================
// TMDB API UTILITY - Fetches movie data for the game
// =============================================================================

// Configuration constants
// WHY: Keeping these at the top makes them easy to change
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * GameMovie - Everything we need about a movie for our game
 * 
 * WHY THIS STRUCTURE:
 * - id: To avoid fetching the same movie twice
 * - title: The answer players must guess
 * - backdrop_path: The blurred image players see
 * - poster_path: Optional extra visual (future feature)
 * - overview: Could be used for additional hints
 * - release_date & year: For the "year" hint
 * - genres: For the "genre" hint
 * - vote_average: For the "rating" hint
 * - tagline: For the "tagline" hint
 * - runtime: Potential future hint
 */
export interface GameMovie {
  id: number;
  title: string;
  backdrop_path: string;      // Full URL to image
  poster_path: string | null;  // null if no poster exists
  overview: string;
  release_date: string;        // "2024-01-15" format
  genres: string[];            // ["Action", "Thriller"]
  vote_average: number;        // 0-10 rating
  tagline: string;
  runtime: number;             // Minutes
  year: number;                // Extracted from release_date
}

// =============================================================================
// HELPER FUNCTION: Fetch detailed movie info
// =============================================================================

/**
 * Fetches complete details for a single movie
 * 
 * @param movieId - The TMDB movie ID
 * @returns GameMovie object or null if movie is unsuitable
 * 
 * WHY THIS EXISTS:
 * - TMDB's list endpoints (popular, top_rated) give minimal data
 * - We need detailed info (genres, tagline, etc.) from the detail endpoint
 * - This function does the "second fetch" to get everything
 */
async function fetchMovieDetails(movieId: number): Promise<GameMovie | null> {
  try {
    // Make the API call to TMDB's movie details endpoint
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`
    );

    // If the API returns an error, return null
    // WHY: Some movie IDs might be invalid or restricted
    if (!response.ok) return null;

    const movie = await response.json();

    // CRITICAL QUALITY CHECK: Filter out unusable movies
    // WHY: A game without an image isn't playable!
    if (!movie.backdrop_path || !movie.title) {
      return null;
    }

    // Transform TMDB's format into our GameMovie format
    // WHY: We want full image URLs, not just paths
    return {
      id: movie.id,
      title: movie.title,
      
      // Convert path to full URL
      backdrop_path: `${IMAGE_BASE_URL}${movie.backdrop_path}`,
      poster_path: movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      
      // Provide defaults for missing data
      // WHY: Some movies might not have all fields
      overview: movie.overview || "No overview available",
      release_date: movie.release_date || "",
      genres: movie.genres?.map((g: any) => g.name) || [],
      vote_average: movie.vote_average || 0,
      tagline: movie.tagline || "",
      runtime: movie.runtime || 0,
      
      // Extract year from date string "2024-01-15" → 2024
      year: movie.release_date 
        ? new Date(movie.release_date).getFullYear() 
        : 0,
    };
  } catch (error) {
    // Network errors, JSON parsing errors, etc.
    console.error(`Error fetching movie ${movieId}:`, error);
    return null;
  }
}

// =============================================================================
// MAIN FUNCTION: Fetch multiple quality movies
// =============================================================================

/**
 * Fetches multiple movies suitable for the game
 * 
 * @param count - How many movies to fetch (default: 10)
 * @returns Array of GameMovie objects
 * 
 * THE ALGORITHM:
 * 1. Pick a random category (popular, top_rated, now_playing)
 * 2. Pick a random page (1-20) from that category
 * 3. Pick a random movie from that page
 * 4. Fetch detailed info for that movie
 * 5. If it's good quality and not a duplicate, add it
 * 6. Repeat until we have enough movies
 * 
 * WHY THIS APPROACH:
 * - Randomness: Different movies every game
 * - Quality: Only well-known movies with images
 * - Variety: Pulling from multiple categories
 * - Resilience: Keeps trying if a movie fails quality checks
 */
export async function fetchMultipleMovies(
  count: number = 10
): Promise<GameMovie[]> {
  const movies: GameMovie[] = [];        // Our final array
  const usedIds = new Set<number>();     // Track IDs to prevent duplicates

  // Categories that typically have good backdrop images
  // WHY THESE: They're curated by TMDB, so quality is high
  const categories = [
    "popular",      // Currently trending
    "top_rated",    // Classics and critically acclaimed
    "now_playing",  // Recent releases
  ];

  let attempts = 0;
  const maxAttempts = count * 3; 
  // WHY * 3: Allow room for failures (bad images, duplicates, etc.)

  // Keep looping until we have enough movies OR we've tried too many times
  while (movies.length < count && attempts < maxAttempts) {
    attempts++;

    // Step 1: Pick a random category
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // Step 2: Pick a random page (TMDB has ~500 pages per category)
    // WHY 20: Going too deep gives obscure movies
    const randomPage = Math.floor(Math.random() * 20) + 1;

    try {
      // Step 3: Fetch a page of movies from that category
      const response = await fetch(
        `${BASE_URL}/movie/${category}?api_key=${API_KEY}&language=en-US&page=${randomPage}`
      );

      if (!response.ok) continue; // API error? Try again

      const data = await response.json();
      const results = data.results || [];

      if (results.length === 0) continue; // Empty page? Try again

      // Step 4: Pick a random movie from the page
      const randomMovie = results[Math.floor(Math.random() * results.length)];

      // Step 5: Skip if we've already used this movie
      if (usedIds.has(randomMovie.id)) continue;

      // Step 6: Fetch detailed information
      const detailedMovie = await fetchMovieDetails(randomMovie.id);

      // Step 7: If the movie passed quality checks, add it!
      if (detailedMovie) {
        movies.push(detailedMovie);
        usedIds.add(detailedMovie.id);
      }
      // If detailedMovie is null, the while loop continues to try another movie
      
    } catch (error) {
      console.error("Error fetching from category:", category, error);
      // Continue to next attempt
    }
  }

  return movies;
}

// =============================================================================
// BACKWARDS COMPATIBILITY FUNCTION
// =============================================================================

/**
 * Fetches a single random movie
 * 
 * WHY THIS EXISTS:
 * If your existing code calls fetchRandomMovie(), it will still work.
 * This is a "wrapper" around fetchMultipleMovies(1)
 */
export async function fetchRandomMovie() {
  const movies = await fetchMultipleMovies(1);
  return movies[0] || null;
}
```

### 📝 Understanding What You Just Created

Let's break down the **key innovations** in this file:

#### 1. **Quality Filtering**
```typescript
if (!movie.backdrop_path || !movie.title) {
  return null;
}
```
**What it does**: Rejects movies without images or titles  
**Why it matters**: Prevents broken game rounds

#### 2. **Randomization Strategy**
- **Random category**: Variety (not all action movies)
- **Random page**: Avoid always getting the same "top 20"
- **Random movie from page**: Maximum variety

**Alternative we rejected**: Just fetching "popular" page 1 → Players would see the same movies repeatedly

#### 3. **Deduplication**
```typescript
const usedIds = new Set<number>();
if (usedIds.has(randomMovie.id)) continue;
```
**What it does**: Prevents the same movie appearing twice in one game  
**How Set works**: Super-fast lookup to check "have we seen this ID?"

#### 4. **Resilience**
```typescript
const maxAttempts = count * 3;
```
**What it does**: If we want 10 movies, try up to 30 times  
**Why**: Some attempts fail (bad movies, API errors, duplicates)

### 🧪 Testing Your TMDB Utility

Before moving on, let's verify it works. Create a temporary test file:

**File**: `test-tmdb.ts` (in your root folder, we'll delete this later)

```typescript
import { fetchMultipleMovies } from "./src/utils/tmdb";

async function test() {
  console.log("Fetching 5 movies...");
  const movies = await fetchMultipleMovies(5);
  
  console.log(`\nGot ${movies.length} movies:\n`);
  movies.forEach((movie, i) => {
    console.log(`${i + 1}. ${movie.title} (${movie.year})`);
    console.log(`   Genres: ${movie.genres.join(", ")}`);
    console.log(`   Rating: ${movie.vote_average}/10`);
    console.log(`   Tagline: ${movie.tagline || "None"}\n`);
  });
}

test();
```

Run it:
```bash
npx tsx test-tmdb.ts
```

**Expected output**: List of 5 movies with complete data

**If it fails**:
- Check `TMDB_API_KEY` is in your `.env.local`
- Verify the API key is valid on TMDB website
- Check your internet connection

Once it works, delete `test-tmdb.ts`.

### ✅ Phase 1 Checklist

- [ ] `@types/node` installed
- [ ] `src/utils/tmdb.ts` created with complete code
- [ ] Test file runs successfully
- [ ] You understand why we fetch from multiple categories
- [ ] You understand the quality filtering logic

**Next**: Phase 2 - Building the type system that powers the game engine.

---

## Phase 2: Game Type System

### 🎯 What We're Building

A **type system** that defines the structure of our game. Think of it as the "blueprint" that TypeScript uses to understand your game data.

### 🤔 Why TypeScript Types Matter

Imagine building a house without blueprints - you'd constantly make mistakes about where things go. Types are your blueprints:

```typescript
// ❌ Without types - TypeScript doesn't know what's valid
const game = { lives: "three" };  // Should be number!
console.log(game.lives * 2);      // Runtime error!

// ✅ With types - Error caught immediately
interface GameState {
  lives: number;
}
const game: GameState = { lives: "three" }; // TypeScript error!
```

### Step 2.1: Create the Game Types File

**What you're doing**: Creating type definitions for all game-related data  
**Where**: `src/types/game.ts`  
**Why a separate file**: Types can be imported anywhere without importing logic

Create the file `src/types/game.ts`:

```typescript
// =============================================================================
// GAME TYPE DEFINITIONS
// This file defines the "shape" of all game-related data
// =============================================================================

// =============================================================================
// DIFFICULTY SYSTEM
// =============================================================================

/**
 * The three difficulty levels
 * 
 * WHY UNION TYPE:
 * Instead of allowing any string, we restrict to only these three values.
 * This prevents typos: "esay" would be a TypeScript error!
 */
export type DifficultyLevel = "easy" | "medium" | "hard";

// =============================================================================
// GAME CONFIGURATION
// =============================================================================

/**
 * All the "rules" of the game in one place
 * 
 * WHY THIS EXISTS:
 * - Central location for all game balance numbers
 * - Easy to tweak and test different values
 * - TypeScript ensures no typos in property names
 */
export interface GameConfig {
  // Round settings
  totalRounds: number;          // How many rounds in a game (we use 5)
  maxLives: number;             // How many hearts you start with (we use 3)
  
  // Scoring: base points per difficulty
  // WHY DIFFERENT SCORES: Higher difficulty = higher reward
  baseScore: {
    easy: number;      // 100 points
    medium: number;    // 200 points
    hard: number;      // 300 points
  };
  
  // Time bonus system
  // Rewards players for quick answers
  timeBonus: {
    max: number;       // Maximum bonus points (50)
    interval: number;  // Seconds to lose 1 point (every 2 seconds)
  };
  // EXAMPLE: Answer in 10 seconds = 50 - (10/2) = 45 bonus points
  //          Answer in 30 seconds = 50 - (30/2) = 35 bonus points
  
  // Hint penalties (points deducted for using each hint)
  // WHY PENALTIES: Makes players think strategically
  hints: {
    genreReveal: number;    // -10 points
    yearReveal: number;     // -15 points
    ratingReveal: number;   // -15 points
    taglineReveal: number;  // -20 points
  };
  
  // Blur reveal penalty
  // Each time you make the image clearer, lose points
  blurReveal: number;        // -25 points per reveal
  
  // Skip round penalty
  // Give up on a round = lose points + lose a life
  skipRound: number;         // -50 points
}

// =============================================================================
// GAME STATE
// =============================================================================

/**
 * The complete state of the game at any moment
 * 
 * WHY ONE BIG OBJECT:
 * - Single source of truth
 * - Easy to save/load
 * - Clear dependencies between properties
 * - Prevents state sync bugs
 * 
 * EXAMPLE STATE DURING ROUND 3:
 * {
 *   currentRound: 3,
 *   lives: 2,              (lost one life)
 *   score: 450,            (accumulated score)
 *   hintsUsed: { genre: true, year: true, ... }
 *   blurLevel: 2,          (revealed twice)
 *   ...
 * }
 */
export interface GameState {
  // ==========================================================================
  // ROUND MANAGEMENT
  // ==========================================================================
  
  currentRound: number;         // Which round (1-5)
  totalRounds: number;          // Total rounds in game (always 5)
  
  // ==========================================================================
  // LIVES & SCORE
  // ==========================================================================
  
  lives: number;                // Hearts remaining (0-3)
  score: number;                // Total points accumulated
  
  // ==========================================================================
  // CURRENT ROUND STATE
  // ==========================================================================
  
  currentMovie: GameMovie | null;  // The movie being guessed (null if game not started)
  guess: string;                   // What the player typed in the input
  isCorrect: boolean | null;       // Was the guess right? (null = not submitted yet)
  roundComplete: boolean;          // Has this round ended?
  
  // ==========================================================================
  // HINTS & REVEALS
  // ==========================================================================
  
  // Track which hints have been used this round
  // WHY OBJECT: Easy to check if specific hint was used
  hintsUsed: {
    genre: boolean;     // Did they reveal genre?
    year: boolean;      // Did they reveal year?
    rating: boolean;    // Did they reveal rating?
    tagline: boolean;   // Did they reveal tagline?
  };
  
  // Blur progression
  // 0 = fully blurred (blur-[50px])
  // 1 = blur-[30px]
  // 2 = blur-[15px]
  // 3 = blur-[5px]
  // 4 = blur-none (fully clear)
  blurLevel: number;
  
  // How many times did they reveal the blur?
  // WHY SEPARATE FROM blurLevel: For score calculation
  revealsUsed: number;
  
  // ==========================================================================
  // TIMING
  // ==========================================================================
  
  roundStartTime: number | null;   // Timestamp when round started (Date.now())
  // WHY TIMESTAMP: Calculate elapsed time = Date.now() - roundStartTime
  
  // ==========================================================================
  // GAME OVER
  // ==========================================================================
  
  gameOver: boolean;    // Is the entire game finished?
  gameWon: boolean;     // Did they win (finish with lives remaining)?
}

// =============================================================================
// ROUND RESULT
// =============================================================================

/**
 * Summary of a completed round
 * 
 * WHY THIS EXISTS:
 * - Show round-by-round breakdown at end
 * - Calculate statistics
 * - Could save to database for analytics
 */
export interface RoundResult {
  round: number;         // Which round (1-5)
  movie: string;         // Movie title
  correct: boolean;      // Did they guess correctly?
  score: number;         // Points earned this round
  timeSeconds: number;   // How long it took
}

// =============================================================================
// IMPORT GameMovie FROM TMDB
// =============================================================================

/**
 * Re-export GameMovie so other files can import it from here
 * 
 * WHY:
 * Instead of: import { GameMovie } from "@/utils/tmdb"
 * We can do: import { GameMovie } from "@/types/game"
 * 
 * This keeps all game types in one place
 */
export type { GameMovie } from "@/utils/tmdb";
```

### 📝 Understanding the Type System

Let's examine the **design decisions** behind each type:

#### 1. **DifficultyLevel - Union Type**

```typescript
type DifficultyLevel = "easy" | "medium" | "hard";
```

**What it does**: Only allows these exact three strings  
**Why not just `string`?**: Prevents typos

```typescript
// ✅ This works
const diff: DifficultyLevel = "easy";

// ❌ This causes a TypeScript error
const diff: DifficultyLevel = "super-easy";  // Not in the union!
```

#### 2. **GameConfig - The Game's "Rules"**

Think of this as your game's settings file:

```typescript
const config: GameConfig = {
  totalRounds: 5,           // Change to 10 for longer games
  baseScore: {
    easy: 100,              // Change to 50 for less points
    medium: 200,
    hard: 300,
  },
  // ... etc
};
```

**Why centralize config?**
- Want to make the game easier? Change one number
- Testing different balance? Swap out the config
- Want a "practice mode"? Use a different config object

#### 3. **GameState - The Heart of the Game**

This is the **most important** type. It represents the game at any given moment.

**Mental model**: Think of GameState as a photograph of the game:
- Take a photo at round 1: `{ currentRound: 1, lives: 3, score: 0, ... }`
- Take a photo at round 3: `{ currentRound: 3, lives: 2, score: 450, ... }`

**Why one big object?**

```typescript
// ❌ BAD: Multiple separate states (can get out of sync!)
const [lives, setLives] = useState(3);
const [score, setScore] = useState(0);
const [round, setRound] = useState(1);
// Problem: If you update round but forget score, they're out of sync!

// ✅ GOOD: One state object (impossible to desync!)
const [gameState, setGameState] = useState<GameState>({
  lives: 3,
  score: 0,
  currentRound: 1,
  // ... all properties together
});
```

#### 4. **hintsUsed - Object vs Array**

**Why an object?**

```typescript
// ✅ Easy to check if specific hint was used
if (hintsUsed.genre) {
  // Genre was already revealed, don't allow again
}

// ❌ If we used an array, checking is harder
const hintsUsed = ["genre", "year"];
if (hintsUsed.includes("genre")) { ... }  // More typing, less clear
```

#### 5. **Nullable Types**

```typescript
currentMovie: GameMovie | null;
isCorrect: boolean | null;
```

**What `| null` means**: The value can be either the type OR `null`

**Why nullable?**
- `currentMovie`: Null before game starts
- `isCorrect`: Null before player submits guess

This is better than using `undefined` because it's **explicit**: "This value intentionally has no value right now."

### 🧪 Testing Your Types

Types don't run, but you can verify they work by creating a test:

**File**: `test-types.ts` (temporary, will delete)

```typescript
import type { GameState, DifficultyLevel, GameConfig } from "./src/types/game";

// This should compile without errors
const testState: GameState = {
  currentRound: 1,
  totalRounds: 5,
  lives: 3,
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

// This should cause an error (uncomment to test)
// const badDiff: DifficultyLevel = "impossible";  // Error!

console.log("Types are working correctly!");
```

Run TypeScript compiler:
```bash
npx tsc test-types.ts --noEmit
```

**Expected output**: No errors  
**If errors**: Check you typed everything exactly as shown

Delete `test-types.ts` when done.

### ✅ Phase 2 Checklist

- [ ] `src/types/game.ts` created with all interfaces
- [ ] You understand why we use union types for DifficultyLevel
- [ ] You understand why GameState is one big object
- [ ] You understand the purpose of GameConfig
- [ ] Test file compiles without errors

**Next**: Phase 3 - Building the massive Game component that uses these types.

---

## Phase 3: Core Game Component

### 🎯 What We're Building

The **brain and body** of your game - a React component that:
- Manages all game logic (rounds, scoring, lives)
- Handles user interactions (guessing, hints, reveals)
- Renders different screens (difficulty select, active game, feedback, results)
- Communicates with the database to save results

**This is the biggest phase** - budget 2-3 hours here.

### 🤔 Why This is Complex

A game component is different from a typical webpage:
- **Multiple screens**: Difficulty selection → Game → Feedback → Results
- **State machine**: Different logic based on game phase
- **Real-time updates**: Timer ticking, animations
- **Complex calculations**: Scoring, fuzzy matching, time bonuses

### Architecture Overview

Think of the Game component as having **4 screens**:

```
┌─────────────────────┐
│  1. DIFFICULTY      │  → User picks Easy/Medium/Hard
│     SELECTION       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  2. ACTIVE GAME     │  → Blurred image, guess input, hints
│     (Playing)       │     Timer running, can submit guesses
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  3. ROUND FEEDBACK  │  → "Correct!" or "Wrong!"
│     (Between rounds)│     Shows correct answer, earned points
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  4. GAME OVER       │  → Final score, round-by-round breakdown
│     (Results)       │     Play again button
└─────────────────────┘
```

### Step 3.1: Install Icon Library

**What you're doing**: Installing Lucide React icons  
**Why**: Professional icons make the UI look polished

```bash
npm install lucide-react
```

**What you get**: 1000+ icons like ❤️ → `<Heart />`, 🏆 → `<Trophy />`

### Step 3.2: Create the Server Page

**What you're doing**: Creating the server component that fetches movies  
**Where**: `src/app/[locale]/play/page.tsx`  
**Why here**: Next.js App Router - this is the `/play` route

**Replace or create** `src/app/[locale]/play/page.tsx`:

```typescript
// =============================================================================
// PLAY PAGE - Server Component
// This runs on the SERVER, fetches movies, passes them to the Game component
// =============================================================================

import { fetchMultipleMovies } from "@/utils/tmdb";
import Game from "@/components/game/Game";

/**
 * The /play route
 * 
 * HOW IT WORKS:
 * 1. Next.js runs this function on the server
 * 2. We fetch 10 movies from TMDB
 * 3. We pass those movies to the Game component
 * 4. Game component runs on the CLIENT with the movies as props
 * 
 * WHY SERVER COMPONENT:
 * - TMDB API key stays secret (never sent to browser)
 * - Faster: Server is usually closer to TMDB's servers
 * - SEO: Search engines can see the page structure
 */
export default async function PlayPage() {
  // Fetch 10 movies (5 for the game + 5 backups in case some fail)
  // This happens on the SERVER before the page loads
  const movies = await fetchMultipleMovies(10);

  // Error handling: If TMDB is down or returns no movies
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

  // Pass movies to the Game component (which runs on client)
  return <Game movies={movies} />;
}
```

**Key concept**: Server Component vs Client Component

```
SERVER (page.tsx)          CLIENT (Game.tsx)
─────────────────          ─────────────────
Fetch movies       →       Receive movies
API key hidden             Handle clicks
Fast data fetch            Timer, animations
```

### Step 3.3: Create the Game Component Structure

**Where**: `src/components/game/Game.tsx`

This is a **large file** (650+ lines). We'll build it in sections. Create the file and start with the imports and setup:

```typescript
// =============================================================================
// GAME COMPONENT - The Complete Game Engine
// This is a CLIENT COMPONENT that handles all game logic and UI
// =============================================================================

"use client";  // This MUST be the first line - marks it as a client component

import { useState, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

// Icons from lucide-react
import {
  Trophy,        // 🏆 Score display
  Heart,         // ❤️ Lives
  Clock,         // ⏱️ Timer
  Star,          // ⭐ Genre hint
  Lightbulb,     // 💡 Tagline hint
  Eye,           // 👁️ Reveal blur
  SkipForward,   // ⏭️ Skip round
  ArrowRight,    // → Next round button
} from "lucide-react";

// Our custom types
import type { GameMovie } from "@/utils/tmdb";
import type {
  DifficultyLevel,
  GameState,
  GameConfig,
  RoundResult,
} from "@/types/game";

// Server action to save game results
import { saveGameResult } from "@/app/game/actions";

// Hook to get current user
import { useAuth } from "@/hooks/useAuth";

// =============================================================================
// GAME CONFIGURATION
// =============================================================================

/**
 * All the game balance numbers in one place
 * 
 * TUNING THE GAME:
 * - Want longer games? Change totalRounds to 10
 * - Want more forgiving? Change maxLives to 5
 * - Hints too cheap? Increase the penalty values
 */
const GAME_CONFIG: GameConfig = {
  totalRounds: 5,      // 5 rounds per game
  maxLives: 3,         // 3 hearts
  
  // Points earned per correct answer (before bonuses/penalties)
  baseScore: {
    easy: 100,         // Easy mode: 100 base points
    medium: 200,       // Medium mode: 200 base points  
    hard: 300,         // Hard mode: 300 base points
  },
  
  // Time bonus decreases over time
  timeBonus: {
    max: 50,           // Maximum: +50 points for instant answer
    interval: 2,       // Lose 1 point every 2 seconds
  },
  // EXAMPLE: Answer in 20 seconds = 50 - (20/2) = 40 bonus points
  
  // Point penalties for using hints
  hints: {
    genreReveal: 10,   // -10 points to see genre
    yearReveal: 15,    // -15 points to see year
    ratingReveal: 15,  // -15 points to see rating
    taglineReveal: 20, // -20 points to see tagline
  },
  
  blurReveal: 25,      // -25 points each time you reveal the blur
  skipRound: 50,       // -50 points to skip a round (plus lose a life!)
};

// =============================================================================
// COMPONENT PROPS
// =============================================================================

/**
 * Props passed from the server page
 */
interface GameProps {
  movies: GameMovie[];  // Array of 10 movies from TMDB
}

// =============================================================================
// MAIN GAME COMPONENT
// =============================================================================

export default function Game({ movies }: GameProps) {
  // ===========================================================================
  // HOOKS - Get utilities we need
  // ===========================================================================
  
  const t = useTranslations("gamePage");  // Translation function for i18n
  const { user } = useAuth();              // Current logged-in user (or null)
  
  // ===========================================================================
  // STATE - Difficulty Selection
  // ===========================================================================
  
  // Which difficulty level was chosen?
  // null = not chosen yet (show difficulty selection screen)
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  
  // Has the game started?
  // false = show difficulty selection
  // true = game is active/feedback/gameover
  const [gameStarted, setGameStarted] = useState(false);
  
  // ===========================================================================
  // STATE - Game State (THE BIG ONE)
  // ===========================================================================
  
  /**
   * Initial state - what the game looks like at the start
   * 
   * WHY DEFINE IT SEPARATELY:
   * We'll reuse this when restarting the game
   */
  const initialState: GameState = {
    currentRound: 0,           // 0 = not started (increments to 1 when game begins)
    totalRounds: GAME_CONFIG.totalRounds,
    lives: GAME_CONFIG.maxLives,
    score: 0,
    currentMovie: null,        // null until first round starts
    guess: "",                 // Empty string in input
    isCorrect: null,           // null = haven't guessed yet
    roundComplete: false,      // false = still playing this round
    hintsUsed: {
      genre: false,
      year: false,
      rating: false,
      tagline: false,
    },
    blurLevel: 0,              // 0 = maximally blurred
    revealsUsed: 0,
    roundStartTime: null,      // null until round starts
    gameOver: false,
    gameWon: false,
  };
  
  // The current game state
  const [gameState, setGameState] = useState<GameState>(initialState);
  
  // ===========================================================================
  // STATE - Round Results Tracking
  // ===========================================================================
  
  // Array storing the result of each completed round
  // EXAMPLE after 3 rounds:
  // [
  //   { round: 1, movie: "Inception", correct: true, score: 150, timeSeconds: 12 },
  //   { round: 2, movie: "Avatar", correct: false, score: 0, timeSeconds: 45 },
  //   { round: 3, movie: "Titanic", correct: true, score: 200, timeSeconds: 8 },
  // ]
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  
  // ===========================================================================
  // STATE - Timer
  // ===========================================================================
  
  // How many seconds have elapsed in the current round?
  const [timer, setTimer] = useState(0);
```

Now let's add the timer effect and helper functions:

```typescript
  // ===========================================================================
  // EFFECT - Timer that counts up every second
  // ===========================================================================
  
  /**
   * This useEffect creates a timer that updates every second
   * 
   * HOW IT WORKS:
   * 1. Runs when roundStartTime changes or round completes
   * 2. If round is active, set an interval that runs every 1000ms (1 second)
   * 3. Calculate elapsed time = now - when round started
   * 4. Update the timer state
   * 5. Clean up the interval when component unmounts or dependencies change
   * 
   * WHY useEffect:
   * Timers are "side effects" - they do something outside of React's rendering
   */
  useEffect(() => {
    // Don't run timer if round hasn't started or is complete
    if (!gameState.roundStartTime || gameState.roundComplete) return;

    // Set up the interval
    const interval = setInterval(() => {
      // Calculate how many seconds have passed
      const elapsed = Math.floor(
        (Date.now() - gameState.roundStartTime!) / 1000
      );
      setTimer(elapsed);
    }, 1000);  // Run every 1000 milliseconds = 1 second

    // Cleanup function: Clear the interval when this effect is re-run or component unmounts
    // WHY: Prevents memory leaks from multiple timers running
    return () => clearInterval(interval);
  }, [gameState.roundStartTime, gameState.roundComplete]);
  
  // ===========================================================================
  // HELPER FUNCTION - Calculate Time Bonus
  // ===========================================================================
  
  /**
   * Calculate how many bonus points to award based on time
   * 
   * @param seconds - How long the round took
   * @returns Bonus points (0 to max)
   * 
   * FORMULA:
   * Start with max bonus (50)
   * Subtract 1 point for every interval (2 seconds)
   * Never go below 0
   * 
   * EXAMPLES:
   * - 0 seconds: 50 - (0/2) = 50 points
   * - 10 seconds: 50 - (10/2) = 45 points
   * - 50 seconds: 50 - (50/2) = 25 points
   * - 200 seconds: 50 - (200/2) = -50 → clamped to 0 points
   * 
   * WHY useCallback:
   * This function never changes, so we wrap it in useCallback to prevent
   * unnecessary re-creation on every render (minor performance optimization)
   */
  const calculateTimeBonus = useCallback((seconds: number): number => {
    const { max, interval } = GAME_CONFIG.timeBonus;
    
    // How many intervals have passed?
    // Math.floor rounds down: 5.9 seconds → 2 intervals (at 2 seconds each)
    const penalty = Math.floor(seconds / interval);
    
    // Subtract penalty from max, but never go below 0
    return Math.max(0, max - penalty);
  }, []);
  
  // ===========================================================================
  // HELPER FUNCTION - Calculate Total Round Score
  // ===========================================================================
  
  /**
   * Calculate the final score for a round
   * 
   * @param timeSeconds - How long it took to guess
   * @returns Total points earned (can be 0)
   * 
   * CALCULATION:
   * 1. Start with base score for difficulty
   * 2. Add time bonus
   * 3. Subtract penalties for each hint used
   * 4. Subtract penalties for blur reveals
   * 5. Never go below 0
   * 
   * EXAMPLE (Medium difficulty, 15 seconds):
   * - Base: 200 points
   * - Time bonus: 50 - (15/2) = 43 points
   * - Used genre hint: -10 points
   * - Revealed blur twice: -50 points (25 × 2)
   * - Total: 200 + 43 - 10 - 50 = 183 points
   * 
   * WHY useCallback + dependencies:
   * This function depends on difficulty and hints used, so we list those
   * as dependencies. React will only recreate this function if those change.
   */
  const calculateRoundScore = useCallback(
    (timeSeconds: number): number => {
      // Can't calculate score if no difficulty selected
      if (!difficulty) return 0;

      // Start with base score for the chosen difficulty
      let score = GAME_CONFIG.baseScore[difficulty];

      // Add time bonus
      score += calculateTimeBonus(timeSeconds);

      // Subtract hint penalties
      if (gameState.hintsUsed.genre) {
        score -= GAME_CONFIG.hints.genreReveal;
      }
      if (gameState.hintsUsed.year) {
        score -= GAME_CONFIG.hints.yearReveal;
      }
      if (gameState.hintsUsed.rating) {
        score -= GAME_CONFIG.hints.ratingReveal;
      }
      if (gameState.hintsUsed.tagline) {
        score -= GAME_CONFIG.hints.taglineReveal;
      }

      // Subtract blur reveal penalties
      // Each reveal costs points
      score -= gameState.revealsUsed * GAME_CONFIG.blurReveal;

      // Never return negative score
      return Math.max(0, score);
    },
    [difficulty, gameState.hintsUsed, gameState.revealsUsed, calculateTimeBonus]
  );
```

Now let's add the fuzzy matching logic:

```typescript
  // ===========================================================================
  // HELPER FUNCTION - Fuzzy Match Movie Titles
  // ===========================================================================
  
  /**
   * Check if a guess matches the movie title (forgiving algorithm)
   * 
   * @param guess - What the player typed
   * @param title - The actual movie title
   * @returns true if it's a match, false otherwise
   * 
   * WHY FUZZY MATCHING:
   * Players shouldn't fail because of:
   * - "the avengers" vs "The Avengers" (capitalization)
   * - "Spiderman" vs "Spider-Man" (punctuation)
   * - "star wars" vs "Star Wars: A New Hope" (partial match)
   * 
   * THE ALGORITHM:
   * 1. Normalize both strings (lowercase, remove punctuation, trim spaces)
   * 2. Check exact match
   * 3. Check if guess is contained in title
   * 4. Check if all words in guess appear in title
   * 
   * EXAMPLES:
   * ✅ "inception" matches "Inception"
   * ✅ "dark knight" matches "The Dark Knight"
   * ✅ "spider man" matches "Spider-Man: No Way Home"
   * ❌ "star trek" does NOT match "Star Wars"
   */
  const fuzzyMatch = useCallback((guess: string, title: string): boolean => {
    /**
     * Normalization function
     * 
     * "The Spider-Man!!" → "the spiderman"
     */
    const normalize = (str: string) =>
      str
        .toLowerCase()              // "The" → "the"
        .replace(/[^\w\s]/g, "")    // Remove punctuation: "Spider-Man" → "Spider Man"
        .replace(/\s+/g, " ")       // Multiple spaces → single space
        .trim();                    // Remove leading/trailing spaces

    const normalizedGuess = normalize(guess);
    const normalizedTitle = normalize(title);

    // CHECK 1: Exact match after normalization
    if (normalizedGuess === normalizedTitle) return true;

    // CHECK 2: Guess is contained in title
    // EXAMPLE: "inception" is in "inception"
    //          "dark knight" is in "the dark knight"
    if (normalizedTitle.includes(normalizedGuess)) return true;

    // CHECK 3: Word-by-word matching
    // Split into words
    const guessWords = normalizedGuess.split(" ");
    const titleWords = normalizedTitle.split(" ");

    // Every word in the guess must appear in the title
    // EXAMPLE: "star" and "wars" both appear in "star wars episode iv"
    return guessWords.every((guessWord) =>
      titleWords.some((titleWord) => titleWord.includes(guessWord))
    );
  }, []);
```

```typescript
  // ===========================================================================
  // GAME CONTROL FUNCTIONS
  // ===========================================================================
  
  /**
   * Start the game with chosen difficulty
   * 
   * @param selectedDifficulty - The difficulty level chosen
   * 
   * WHAT IT DOES:
   * 1. Saves the difficulty level
   * 2. Marks game as started
   * 3. Initializes game state for round 1
   * 4. Loads the first movie
   * 5. Starts the timer
   * 6. Resets results array
   * 
   * WHY useCallback + dependencies:
   * Depends on 'movies' array - if movies change, this function needs to update
   */
  const startGame = useCallback(
    (selectedDifficulty: DifficultyLevel) => {
      setDifficulty(selectedDifficulty);
      setGameStarted(true);
      setGameState({
        ...initialState,                    // Spread all initial properties
        currentRound: 1,                    // Override: Start at round 1
        currentMovie: movies[0],             // Load first movie
        roundStartTime: Date.now(),         // Start timer NOW
      });
      setRoundResults([]);                  // Clear any previous results
      setTimer(0);                          // Reset timer display
    },
    [movies]  // Recreate this function if movies array changes
  );

  /**
   * Submit the player's guess
   * 
   * WHAT IT DOES:
   * 1. Calculates how long the round took
   * 2. Checks if guess matches using fuzzy matching
   * 3. Calculates score (0 if wrong, calculated if correct)
   * 4. Records the round result
   * 5. Updates game state (marks round complete, updates lives/score)
   * 
   * WHY THE CHECKS:
   * - !gameState.currentMovie: Can't submit if no movie loaded
   * - !gameState.guess.trim(): Can't submit empty guess
   * 
   * WHY DEPENDENCIES:
   * This function reads from gameState, so list all properties it uses
   */
  const handleSubmitGuess = useCallback(() => {
    // Guard: Don't allow submission if no movie or empty guess
    if (!gameState.currentMovie || !gameState.guess.trim()) return;

    // Calculate elapsed time in seconds
    const timeSeconds = Math.floor(
      (Date.now() - gameState.roundStartTime!) / 1000
    );
    
    // Check if guess is correct using fuzzy matching
    const correct = fuzzyMatch(gameState.guess, gameState.currentMovie.title);
    
    // Calculate score (0 if wrong, otherwise calculated based on time/hints)
    const roundScore = correct ? calculateRoundScore(timeSeconds) : 0;

    // Create a record of this round's result
    const result: RoundResult = {
      round: gameState.currentRound,
      movie: gameState.currentMovie.title,
      correct,
      score: roundScore,
      timeSeconds,
    };
    
    // Add to results array (using functional update for safety)
    setRoundResults((prev) => [...prev, result]);

    // Update game state
    setGameState((prev) => ({
      ...prev,                              // Keep everything the same
      isCorrect: correct,                   // Store the result
      roundComplete: true,                  // Mark round as done
      score: prev.score + roundScore,       // Add points (or 0 if wrong)
      lives: correct ? prev.lives : prev.lives - 1,  // Lose life if wrong
    }));
  }, [
    gameState.currentMovie,
    gameState.guess,
    gameState.roundStartTime,
    gameState.currentRound,
    fuzzyMatch,
    calculateRoundScore,
  ]);

  /**
   * Progress to the next round OR end the game
   * 
   * LOGIC FLOW:
   * 1. Calculate next round number
   * 2. Check if game should end (no lives OR finished all rounds)
   * 3a. If game over: Mark as complete, save to database
   * 3b. If continuing: Reset state for next round, load next movie
   * 
   * WHY ASYNC:
   * We call saveGameResult which returns a Promise (database operation)
   * 
   * DATABASE SAVE:
   * Only saves if user is logged in AND difficulty is set
   * Failures are logged but don't block the UI
   */
  const handleNextRound = useCallback(async () => {
    const nextRound = gameState.currentRound + 1;
    const noLivesLeft = gameState.lives <= 0;
    const lastRound = nextRound > GAME_CONFIG.totalRounds;

    // Should the game end?
    if (noLivesLeft || lastRound) {
      // GAME OVER BRANCH
      
      // Mark game as over
      setGameState((prev) => ({
        ...prev,
        gameOver: true,
        gameWon: prev.lives > 0,  // Won if you have lives remaining
      }));

      // Save to database (if user is logged in)
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
          // Don't block UI if save fails, just log it
          console.error("Failed to save game result:", error);
        }
      }
    } else {
      // CONTINUE TO NEXT ROUND BRANCH
      
      // Reset state for the new round
      setGameState({
        ...initialState,                    // Reset hints, blur, guess, etc.
        currentRound: nextRound,             // Increment round number
        totalRounds: GAME_CONFIG.totalRounds,
        lives: gameState.lives,              // Carry over remaining lives
        score: gameState.score,              // Carry over accumulated score
        currentMovie: movies[nextRound - 1], // Load next movie (array is 0-indexed)
        roundStartTime: Date.now(),         // Start new timer
      });
      
      setTimer(0);  // Reset timer display
    }
  }, [
    gameState.currentRound,
    gameState.lives,
    gameState.score,
    movies,
    user,
    difficulty,
  ]);

  /**
   * Reveal a hint
   * 
   * @param hintType - Which hint to reveal (genre, year, rating, tagline)
   * 
   * WHAT IT DOES:
   * Updates the hintsUsed object to mark this hint as revealed
   * 
   * WHY FUNCTIONAL UPDATE:
   * We only change ONE property, keep everything else the same
   */
  const revealHint = useCallback((hintType: keyof typeof gameState.hintsUsed) => {
    setGameState((prev) => ({
      ...prev,                // Keep everything
      hintsUsed: {
        ...prev.hintsUsed,    // Keep other hints' state
        [hintType]: true,     // Mark THIS hint as used
      },
    }));
  }, []);

  /**
   * Reveal the image more (reduce blur)
   * 
   * WHAT IT DOES:
   * 1. Increases blur level (0 → 1 → 2 → 3 → 4)
   * 2. Increments reveals counter (for penalty calculation)
   * 
   * WHY Math.min(4, ...):
   * Prevents going above level 4 (fully revealed)
   */
  const revealBlur = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      blurLevel: Math.min(4, prev.blurLevel + 1),  // Max is 4
      revealsUsed: prev.revealsUsed + 1,           // Count for penalty
    }));
  }, []);

  /**
   * Skip the current round
   * 
   * WHAT IT DOES:
   * 1. Deducts skip penalty from score
   * 2. Marks round as complete (with wrong answer)
   * 3. Loses a life
   * 
   * WHY Math.max(0, ...):
   * Score can't go negative
   */
  const skipRound = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      score: Math.max(0, prev.score - GAME_CONFIG.skipRound),  // -50 points
      isCorrect: false,              // Treat as wrong answer
      roundComplete: true,           // End the round
      lives: prev.lives - 1,         // Lose a life
    }));
  }, []);

  /**
   * Restart the entire game
   * 
   * WHAT IT DOES:
   * Resets everything to initial state (back to difficulty selection)
   * 
   * WHEN CALLED:
   * From the "Play Again" button on game over screen
   */
  const restartGame = useCallback(() => {
    setDifficulty(null);            // Clear difficulty (shows selection screen)
    setGameStarted(false);          // Mark as not started
    setGameState(initialState);     // Reset all game state
    setRoundResults([]);            // Clear results
    setTimer(0);                    // Reset timer
  }, []);

  // ===========================================================================
  // COMPUTED VALUES
  // ===========================================================================
  
  /**
   * Blur CSS class based on current blur level
   * 
   * WHY useMemo:
   * This doesn't need to recalculate unless blurLevel changes
   * Prevents creating a new array on every render
   */
  const blurClass = useMemo(() => {
    const levels = [
      "blur-[50px]",   // Level 0: Maximally blurred
      "blur-[30px]",   // Level 1: Very blurred
      "blur-[15px]",   // Level 2: Medium blur
      "blur-[5px]",    // Level 3: Slight blur
      "blur-none",     // Level 4: Fully clear
    ];
    return levels[gameState.blurLevel];
  }, [gameState.blurLevel]);

  // ===========================================================================
  // UI RENDERING - SCREEN 1: Difficulty Selection
  // ===========================================================================
  
  /**
   * Show this screen when game hasn't started
   * 
   * FEATURES:
   * - 3 difficulty buttons with different colors
   * - Shows base score for each difficulty
   * - Responsive grid layout
   */
  if (!gameStarted || !difficulty) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Title with gradient */}
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t("selectDifficulty")}
          </h1>

          {/* 3-column grid on desktop, 1 column on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* EASY BUTTON */}
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

            {/* MEDIUM BUTTON */}
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

            {/* HARD BUTTON */}
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

  // ===========================================================================
  // UI RENDERING - SCREEN 2: Game Over / Results
  // ===========================================================================
  
  /**
   * Show this screen when the game is complete
   * 
   * FEATURES:
   * - Victory or defeat emoji/message
   * - Large display of final score
   * - Round-by-round breakdown with colors (green = correct, red = wrong)
   * - Play Again button to restart
   * 
   * WHEN SHOWN:
   * - After all 5 rounds completed
   * - OR when lives reach 0
   */
  if (gameState.gameOver) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          
          {/* Top section: Result and score */}
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

          {/* Round-by-round breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">{t("results.roundByRound")}</h2>
            <div className="space-y-2">
              {roundResults.map((result) => (
                <div
                  key={result.round}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  {/* Left side: Round badge + movie title + time */}
                  <div className="flex items-center gap-3">
                    {/* Round number badge */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        result.correct ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <span className="text-white font-bold">
                        {result.round}
                      </span>
                    </div>
                    {/* Movie info */}
                    <div>
                      <div className="font-semibold">{result.movie}</div>
                      <div className="text-sm text-gray-500">
                        {result.timeSeconds}s
                      </div>
                    </div>
                  </div>
                  {/* Right side: Points earned */}
                  <div className="text-lg font-bold text-purple-600">
                    +{result.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Play Again button */}
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

  // ===========================================================================
  // UI RENDERING - SCREEN 3: Round Feedback
  // ===========================================================================
  
  /**
   * Show this screen between rounds (after submitting a guess)
   * 
   * FEATURES:
   * - Shows if answer was correct or wrong
   * - Displays the actual movie title
   * - Shows points earned (if correct)
   * - Shows updated score and lives
   * - Next Round or See Results button
   * 
   * WHEN SHOWN:
   * - After player submits a guess
   * - OR after player skips a round
   * - Until player clicks "Next Round"
   */
  if (gameState.roundComplete && gameState.isCorrect !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          
          {/* Big emoji feedback */}
          <div className="text-8xl mb-6">
            {gameState.isCorrect ? "🎉" : "❌"}
          </div>
          
          {/* Correct or Wrong message */}
          <h1 className="text-4xl font-bold mb-4">
            {gameState.isCorrect ? t("feedback.correct") : t("feedback.wrong")}
          </h1>
          
          {/* Show the actual movie title */}
          <p className="text-2xl text-gray-600 mb-8">
            {gameState.currentMovie?.title}
          </p>

          {/* If correct, show points earned */}
          {gameState.isCorrect && (
            <div className="text-5xl font-bold text-purple-600 mb-4">
              +{roundResults[roundResults.length - 1]?.score || 0}
            </div>
          )}

          {/* Show updated score and lives */}
          <div className="flex items-center justify-center gap-8 mb-8">
            {/* Score */}
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-2xl font-bold">{gameState.score}</span>
            </div>
            {/* Lives (hearts) */}
            <div className="flex items-center gap-2">
              {Array.from({ length: GAME_CONFIG.maxLives }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-6 h-6 ${
                    i < gameState.lives
                      ? "fill-red-500 text-red-500"   // Filled hearts = lives remaining
                      : "text-gray-300"               // Empty hearts = lives lost
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleNextRound}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            {/* Dynamic button text: "Next Round" or "See Results" depending on game state */}
            {gameState.currentRound < GAME_CONFIG.totalRounds && gameState.lives > 0
              ? t("nextRound")
              : t("seeResults")}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // UI RENDERING - SCREEN 4: Active Game (Playing)
  // ===========================================================================
  
  /**
   * Show this screen while actively playing a round
   * 
   * FEATURES:
   * - Header with score, lives, timer, round number
   * - Blurred movie image (blur level changes as player reveals)
   * - Blur progress indicator
   * - Guess input with Enter key support
   * - 4 hint buttons (genre, year, rating, tagline)
   * - Reveal and Skip buttons
   * 
   * WHEN SHOWN:
   * - After difficulty selected and game started
   * - During each round until guess submitted
   */
  
  // Safety check: Don't render if no movie loaded
  if (!gameState.currentMovie) return null;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* =====================================================================
            TOP HEADER - Score, Lives, Timer, Round Counter
            ===================================================================== */}
        <div className="flex items-center justify-between mb-6">
          
          {/* Left side: Score, Lives, Timer */}
          <div className="flex items-center gap-6">
            
            {/* Score display */}
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-2xl font-bold">{gameState.score}</span>
            </div>
            
            {/* Lives display (hearts) */}
            <div className="flex items-center gap-1">
              {Array.from({ length: GAME_CONFIG.maxLives }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-6 h-6 transition-all ${
                    i < gameState.lives
                      ? "fill-red-500 text-red-500 scale-100"  // Filled = alive
                      : "text-gray-300 scale-75"              // Empty = lost
                  }`}
                />
              ))}
            </div>
            
            {/* Timer */}
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-lg font-semibold">{timer}s</span>
            </div>
          </div>

          {/* Right side: Round counter */}
          <div className="text-lg font-semibold">
            {t("round")} {gameState.currentRound} / {GAME_CONFIG.totalRounds}
          </div>
        </div>

        {/* =====================================================================
            MOVIE IMAGE - Blurred backdrop
            ===================================================================== */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 shadow-2xl">
          <Image
            src={gameState.currentMovie.backdrop_path}
            alt="Movie frame"
            fill
            className={`object-cover transition-all duration-500 ${blurClass}`}
            priority  // Load this image immediately (it's critical)
          />
        </div>

        {/* =====================================================================
            BLUR PROGRESS BAR - Visual indicator of clarity level
            ===================================================================== */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">{t("clarity")}</span>
            <span className="text-sm text-gray-600">
              {gameState.blurLevel}/4
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
              style={{ width: `${(gameState.blurLevel / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* =====================================================================
            GUESS INPUT - Text field + Submit button
            ===================================================================== */}
        <div className="mb-6">
          {/* Text input */}
          <input
            type="text"
            value={gameState.guess}
            onChange={(e) =>
              setGameState((prev) => ({ ...prev, guess: e.target.value }))
            }
            onKeyDown={(e) => e.key === "Enter" && handleSubmitGuess()}  // Enter = submit
            placeholder={t("guessPlaceholder")}
            className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
          />
          
          {/* Submit button */}
          <button
            onClick={handleSubmitGuess}
            disabled={!gameState.guess.trim()}  // Disabled if empty
            className="w-full mt-3 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("submitGuess")}
          </button>
        </div>

        {/* =====================================================================
            HINT BUTTONS - 4 hints in a grid
            ===================================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          
          {/* Genre hint */}
          <HintButton
            icon={<Star className="w-5 h-5" />}
            label={t("hints.genre")}
            value={
              gameState.hintsUsed.genre
                ? gameState.currentMovie.genres.join(", ") || t("hints.noGenre")
                : undefined  // undefined = not yet revealed
            }
            onClick={() => revealHint("genre")}
            disabled={gameState.hintsUsed.genre}  // Can't use twice
            cost={GAME_CONFIG.hints.genreReveal}
          />
          
          {/* Year hint */}
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
          
          {/* Rating hint */}
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
          
          {/* Tagline hint */}
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

        {/* =====================================================================
            ACTION BUTTONS - Reveal and Skip
            ===================================================================== */}
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
      {/* Top row: Icon + Label */}
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      
      {/* Bottom row: Conditional rendering */}
      {value ? (
        // If value exists, show the revealed information
        <div className="text-sm font-bold text-purple-600">{value}</div>
      ) : (
        // If value is undefined, show the cost
        <div className="text-xs text-gray-500">-{cost} pts</div>
      )}
    </button>
  );
}
```

### 📝 Understanding the Game Component

You just created a **monster component** (~800 lines)! Let's understand the key architectural decisions:

#### 1. **Four Distinct Screens**

The component renders completely different UI based on state:

```typescript
// Screen 1: Difficulty selection
if (!gameStarted || !difficulty) return <DifficultyScreen />

// Screen 2: Game over
if (gameState.gameOver) return <GameOverScreen />

// Screen 3: Round feedback
if (gameState.roundComplete) return <FeedbackScreen />

// Screen 4: Active game
return <ActiveGameScreen />
```

**Why not separate components?** They all share the same state. Separating would require complex prop drilling or context.

#### 2. **State Update Patterns**

**Functional updates** are used everywhere:

```typescript
setGameState((prev) => ({
  ...prev,
  score: prev.score + 100,
}));
```

**Why?** Prevents stale closure bugs. Always works with the latest state.

#### 3. **useCallback Optimization**

Every handler uses `useCallback`:

```typescript
const handleSubmitGuess = useCallback(() => {
  // ...
}, [dependencies]);
```

**Why?** Prevents re-creating functions on every render → prevents unnecessary child re-renders.

### ✅ Phase 3 Checklist

- [ ] `lucide-react` installed
- [ ] `src/app/[locale]/play/page.tsx` created (server component)
- [ ] `src/components/game/Game.tsx` created (client component)
- [ ] You understand the 4-screen architecture
- [ ] You understand fuzzy matching logic
- [ ] You understand the scoring calculation
- [ ] You understand state management approach

**Next**: Phase 4 - Setting up the database to persist game results.

---

## Phase 4: Database Schema

### 🎯 What We're Building

Two database tables that work together to track game performance:

1. **leaderboard** - Public high scores for competition
2. **game_sessions** - Detailed history of every game played

### 🤔 Why Two Tables?

**Alternative we rejected**: One table for everything

**Why two is better**:
- **Leaderboard**: Fast queries, public visibility, optimized for sorting by score
- **Game Sessions**: Complete history, private to user, includes round-by-round data

**Real-world analogy**: Leaderboard = Trophy case (public), Sessions = Personal diary (private)

### Understanding Supabase/PostgreSQL Concepts

Before creating tables, let's understand key database concepts:

#### **UUIDs** (Universally Unique Identifiers)
```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY
```

**What it is**: A 128-bit unique identifier (looks like: `550e8400-e29b-41d4-a716-446655440000`)  
**Why not just numbers**: UUIDs are globally unique without coordination. Two users can generate IDs simultaneously without collision.  
**When created**: Automatically when row is inserted

#### **Foreign Keys & Cascading Deletes**
```sql
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
```

**What it means**:
- `REFERENCES auth.users(id)`: This user_id MUST exist in the auth.users table
- `ON DELETE CASCADE`: If user is deleted, delete all their leaderboard entries too

**Why cascade?**: Orphaned data is confusing. If a user deletes their account, delete their game data too.

#### **Check Constraints**
```sql
CHECK (difficulty IN ('easy', 'medium', 'hard'))
```

**What it does**: Database rejects any value not in this list  
**Why?**: Defense in depth. Even if your app has a bug, database ensures data integrity.

#### **Indexes**
```sql
CREATE INDEX idx_leaderboard_score ON public.leaderboard(score DESC);
```

**What it is**: A sorted data structure for fast lookups  
**Why needed**: Finding top 100 scores in 1 million rows without index = slow. With index = instant.  
**Trade-off**: Faster reads, slightly slower writes (index must be updated)

**Which columns to index**: Columns you filter/sort by frequently

#### **Row Level Security (RLS)**
```sql
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
```

**What it is**: Database-level access control per row  
**Why not just app-level checks**: Users can bypass your app and call the database directly. RLS is the last line of defense.

**Example policy**:
```sql
CREATE POLICY "Users can view own game sessions"
  ON public.game_sessions FOR SELECT
  USING (auth.uid() = user_id);
```

**Translation**: "When selecting from game_sessions, only return rows where the authenticated user's ID matches the row's user_id"

### Step 4.1: Create the Migration File

**What you're doing**: Creating a SQL script that defines your database schema  
**Where**: `supabase/migrations/20260103_add_game_tables.sql`  
**Why a migration**: Version-controlled database changes. Everyone gets the same schema.

**Create the file**: `supabase/migrations/20260103_add_game_tables.sql`

```sql
-- =============================================================================
-- GAME TABLES MIGRATION
-- Creates leaderboard and game_sessions tables with proper indexes and RLS
-- =============================================================================

-- =============================================================================
-- TABLE 1: LEADERBOARD - Public high scores
-- =============================================================================

/**
 * Purpose: Store top game scores for public leaderboards
 * 
 * Access: Anyone can view, only owner can insert/delete
 * 
 * Why separate from game_sessions:
 * - Optimized for sorting by score (DESC index)
 * - Public visibility for competition
 * - Simpler queries for leaderboard display
 */
CREATE TABLE IF NOT EXISTS public.leaderboard (
  -- Primary key: Unique identifier for this leaderboard entry
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Foreign key: Links to the user who achieved this score
  -- CASCADE: If user is deleted, delete their leaderboard entries
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Username snapshot: Stored here so we don't need to join profiles table
  -- Can be null if user hasn't set a username
  username TEXT,
  
  -- Difficulty level: Constrained to valid values only
  -- CHECK ensures no typos or invalid values can be inserted
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  
  -- Game results
  score INTEGER NOT NULL DEFAULT 0,
  rounds_completed INTEGER NOT NULL DEFAULT 0,
  lives_remaining INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamp: When this score was achieved
  -- timezone('utc'::text, now()): Ensures all timestamps are UTC (avoids timezone bugs)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- TABLE 2: GAME_SESSIONS - Detailed game history
-- =============================================================================

/**
 * Purpose: Store complete history of every game played
 * 
 * Access: Private to the user who played
 * 
 * Why this exists:
 * - Track player progress over time
 * - Analytics (which movies are hardest, etc.)
 * - Round-by-round breakdown (JSONB column)
 */
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  
  score INTEGER NOT NULL DEFAULT 0,
  rounds_completed INTEGER NOT NULL DEFAULT 0,
  lives_remaining INTEGER NOT NULL DEFAULT 0,
  
  -- JSONB column: Stores array of round results as JSON
  -- Example: [{"round": 1, "movie": "Inception", "correct": true, ...}, ...]
  -- WHY JSONB: Flexible structure, can query inside JSON, efficient storage
  round_results JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE  -- Null until game ends
);

-- =============================================================================
-- INDEXES - Speed up common queries
-- =============================================================================

/**
 * Leaderboard indexes
 * 
 * WHY THESE:
 * - user_id: Filter by user ("get my best scores")
 * - difficulty: Filter by difficulty ("top easy mode scores")
 * - score DESC: Sort by score descending ("top 100 players")
 * - created_at DESC: Sort by recency ("recent high scores")
 */
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id 
  ON public.leaderboard(user_id);
  
CREATE INDEX IF NOT EXISTS idx_leaderboard_difficulty 
  ON public.leaderboard(difficulty);
  
CREATE INDEX IF NOT EXISTS idx_leaderboard_score 
  ON public.leaderboard(score DESC);  -- DESC = optimized for top scores
  
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at 
  ON public.leaderboard(created_at DESC);

/**
 * Game sessions indexes
 * 
 * WHY THESE:
 * - user_id: Get all games for a user
 * - difficulty: Filter by difficulty
 * - created_at DESC: Sort by recency
 */
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id 
  ON public.game_sessions(user_id);
  
CREATE INDEX IF NOT EXISTS idx_game_sessions_difficulty 
  ON public.game_sessions(difficulty);
  
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at 
  ON public.game_sessions(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY - Access control
-- =============================================================================

/**
 * Enable RLS on both tables
 * 
 * WHAT THIS MEANS:
 * - All queries must pass through RLS policies
 * - Even if someone gets direct database access, policies still apply
 * - Policies defined below determine who can do what
 */
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- LEADERBOARD POLICIES
-- =============================================================================

/**
 * Policy 1: Anyone can view the leaderboard
 * 
 * USING (true): No conditions - all rows visible
 * 
 * WHY PUBLIC:
 * Leaderboards are meant to be competitive and public
 * No sensitive information exposed
 */
CREATE POLICY "Public can view leaderboard"
  ON public.leaderboard FOR SELECT
  USING (true);

/**
 * Policy 2: Users can insert their own scores
 * 
 * WITH CHECK (auth.uid() = user_id): Only if the user_id matches logged-in user
 * 
 * WHY:
 * Prevents users from inserting scores for other users
 * auth.uid() = Supabase function that returns current logged-in user's ID
 */
CREATE POLICY "Users can insert own leaderboard entries"
  ON public.leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

/**
 * Policy 3: Users can delete their own scores
 * 
 * USING (auth.uid() = user_id): Only if they own the row
 * 
 * WHY:
 * Users might want to remove embarrassing low scores
 * Can't delete other people's scores
 */
CREATE POLICY "Users can delete own leaderboard entries"
  ON public.leaderboard FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- GAME SESSIONS POLICIES
-- =============================================================================

/**
 * Policy 1: Users can view only their own sessions
 * 
 * USING (auth.uid() = user_id): Filter to only their rows
 * 
 * WHY PRIVATE:
 * Game sessions contain detailed play history
 * No reason to expose this to other users
 */
CREATE POLICY "Users can view own game sessions"
  ON public.game_sessions FOR SELECT
  USING (auth.uid() = user_id);

/**
 * Policy 2: Users can insert their own sessions
 * 
 * WITH CHECK (auth.uid() = user_id): Ensure user_id matches
 * 
 * WHY:
 * When game ends, save the session to their account only
 */
CREATE POLICY "Users can insert own game sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

/**
 * Policy 3: Users can update their own sessions
 * 
 * USING (auth.uid() = user_id): Only their rows
 * 
 * WHY:
 * Might want to update completed_at timestamp or add notes
 */
CREATE POLICY "Users can update own game sessions"
  ON public.game_sessions FOR UPDATE
  USING (auth.uid() = user_id);
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

### 📝 Understanding the Database Design

Let's examine some key decisions in our schema:

#### 1. **Why Username in Leaderboard?**

```sql
username TEXT,  -- Stored directly, not joined
```

**Alternative**: Join with profiles table every time  
**Why we denormalize**: 
- Leaderboard queries are frequent and need to be fast
- Joining adds complexity and latency
- Username rarely changes
- Trade-off: Slightly stale usernames vs. fast queries

#### 2. **JSONB for Round Results**

```sql
round_results JSONB DEFAULT '[]'::jsonb
```

**What JSONB stores**:
```json
[
  {"round": 1, "movie": "Inception", "correct": true, "score": 150, "timeSeconds": 12},
  {"round": 2, "movie": "Avatar", "correct": false, "score": 0, "timeSeconds": 45}
]
```

**Why JSONB not separate table**:
- Round results are always queried together with the session
- No need to query individual rounds separately
- JSONB can still be queried: `round_results @> '[{"correct": true}]'`
- Simpler schema, fewer tables

#### 3. **Separate created_at and completed_at**

```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
completed_at TIMESTAMP WITH TIME ZONE  -- Nullable
```

**Why two timestamps**:
- `created_at`: When game started (auto-set on INSERT)
- `completed_at`: When game finished (set by app when game ends)
- Can calculate game duration: `completed_at - created_at`
- Can find abandoned games: `WHERE completed_at IS NULL`

### Step 4.2: Update TypeScript Types

**What you're doing**: Adding TypeScript interfaces for the new tables  
**Where**: `src/types/supabase.ts`  
**Why**: Type safety when querying database

Add these definitions to your existing `Database` interface:

```typescript
// Add to your existing src/types/supabase.ts file

export interface Database {
  public: {
    Tables: {
      // ... existing profiles definition ...
      
      /**
       * Leaderboard table types
       * 
       * Row: What you get when SELECTing
       * Insert: What you provide when INSERTing (some fields optional/auto-generated)
       * Update: What you provide when UPDATing (all fields optional)
       */
      leaderboard: {
        Row: {
          id: string;
          user_id: string;
          username: string | null;
          difficulty: "easy" | "medium" | "hard";
          score: number;
          rounds_completed: number;
          lives_remaining: number;
          created_at: string;  // ISO timestamp string
        };
        Insert: {
          id?: string;                    // Optional: Auto-generated if not provided
          user_id: string;                // Required
          username?: string | null;       // Optional
          difficulty: "easy" | "medium" | "hard";  // Required
          score: number;                  // Required
          rounds_completed: number;       // Required
          lives_remaining: number;        // Required
          created_at?: string;            // Optional: Auto-generated if not provided
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
      
      /**
       * Game sessions table types
       */
      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          difficulty: "easy" | "medium" | "hard";
          score: number;
          rounds_completed: number;
          lives_remaining: number;
          round_results: any[] | null;    // JSONB array
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

### Step 4.3: Run the Migration

**What you're doing**: Applying the SQL to your database  
**Two methods**: Supabase CLI or Supabase Studio

#### Method 1: Supabase CLI (Recommended)

```bash
# Navigate to your project root
cd c:\Users\chris\dev\frame-guesser

# Push the migration to Supabase
supabase db push
```

**What happens**: CLI reads all files in `supabase/migrations/` and applies them in order

#### Method 2: Supabase Studio (Web UI)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in sidebar
4. Click "New Query"
5. Paste the entire migration SQL
6. Click "Run"

**Verify it worked**:
- Go to "Table Editor" in Supabase Studio
- You should see `leaderboard` and `game_sessions` tables
- Click on each to verify columns are correct

### ✅ Phase 4 Checklist

- [ ] `supabase/migrations/20260103_add_game_tables.sql` created
- [ ] You understand UUIDs and why we use them
- [ ] You understand foreign keys and CASCADE
- [ ] You understand indexes and when to use them
- [ ] You understand Row Level Security policies
- [ ] `src/types/supabase.ts` updated with new table types
- [ ] Migration applied to database (tables exist in Supabase Studio)
- [ ] You understand why we have two tables (leaderboard + sessions)

**Next**: Phase 5 - Creating server actions to interact with the database securely.

---

## Phase 5: Server Actions

### 🎯 What We're Building

Server-side functions that safely interact with the database. These run **only on the server**, never exposing database credentials to the browser.

### 🤔 Why Server Actions?

**The problem**: If you query Supabase directly from client components, your database URL and keys are exposed in the browser.

**The solution**: Server Actions
- Marked with `"use server"` directive
- Run on the server, never sent to browser
- Can be called from client components
- Database credentials stay safe on server

**Think of it like**: The client asks the server to do something, server does it securely, returns result.

### Step 5.1: Create Server Actions File

**What you're doing**: Creating secure database functions  
**Where**: `src/app/game/actions.ts`  
**Why this location**: Next.js convention - actions near the routes that use them

Create the file `src/app/game/actions.ts`:

```typescript
// =============================================================================
// GAME SERVER ACTIONS
// Secure database operations that run on the server
// =============================================================================

"use server";  
// ⚠️ CRITICAL: This directive MUST be the first line
// It tells Next.js these functions run on the server only

import { createClient } from "@/utils/supabase/server";
import type { DifficultyLevel } from "@/types/game";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Data needed to save a completed game
 */
export interface GameResult {
  userId: string;
  difficulty: DifficultyLevel;
  score: number;
  roundsCompleted: number;
  livesRemaining: number;
}

/**
 * A single leaderboard entry (returned from database)
 */
export interface LeaderboardEntry {
  id: string;
  username: string | null;
  difficulty: DifficultyLevel;
  score: number;
  roundsCompleted: number;
  livesRemaining: number;
  createdAt: string;  // ISO timestamp string
}

/**
 * Aggregated statistics for a user
 */
export interface UserStats {
  totalGames: number;
  averageScore: number;
  bestScore: number;
  gamesWon: number;
}

// =============================================================================
// FUNCTION 1: Save Game Result
// =============================================================================

/**
 * Save a completed game to both leaderboard and game_sessions tables
 * 
 * @param result - The game result data
 * @returns Success status
 * 
 * WHAT IT DOES:
 * 1. Gets username from profiles table
 * 2. Inserts into leaderboard (public scores)
 * 3. Inserts into game_sessions (private history)
 * 
 * WHY TWO INSERTS:
 * - Leaderboard: Public competition, optimized for sorting by score
 * - Sessions: Complete history for the user, includes all games
 * 
 * ERROR HANDLING:
 * - If leaderboard insert fails: Throws error (game not saved)
 * - If session insert fails: Logs but doesn't throw (leaderboard still saved)
 */
export async function saveGameResult(result: GameResult) {
  // Create a Supabase client with server credentials
  // WHY await: createClient is async in Next.js App Router
  const supabase = await createClient();

  // Step 1: Get the user's username from profiles table
  // WHY: We want to display username on leaderboard without joining
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", result.userId)
    .single();  // .single() = expect exactly one row

  // Step 2: Insert into leaderboard table
  const { error: leaderboardError } = await supabase
    .from("leaderboard")
    .insert({
      user_id: result.userId,
      username: profile?.username || null,  // Null if user hasn't set username
      difficulty: result.difficulty,
      score: result.score,
      rounds_completed: result.roundsCompleted,
      lives_remaining: result.livesRemaining,
      // created_at is auto-generated by database
    });

  // Check for errors
  if (leaderboardError) {
    console.error("Error saving to leaderboard:", leaderboardError);
    throw new Error("Failed to save game result");
    // Throwing stops execution and client component can catch this
  }

  // Step 3: Insert into game_sessions table
  const { error: sessionError } = await supabase
    .from("game_sessions")
    .insert({
      user_id: result.userId,
      difficulty: result.difficulty,
      score: result.score,
      rounds_completed: result.roundsCompleted,
      lives_remaining: result.livesRemaining,
      completed_at: new Date().toISOString(),  // Mark as completed now
      // round_results could be added here in future
    });

  // Log but don't throw - session is nice-to-have, leaderboard is critical
  if (sessionError) {
    console.error("Error saving game session:", sessionError);
  }

  return { success: true };
}

// =============================================================================
// FUNCTION 2: Get Leaderboard
// =============================================================================

/**
 * Fetch leaderboard entries with optional filtering
 * 
 * @param difficulty - Optional: Filter by difficulty
 * @param limit - Maximum number of entries to return
 * @returns Array of leaderboard entries, sorted by score descending
 * 
 * QUERY OPTIMIZATION:
 * - Uses index on score (DESC) for fast sorting
 * - Uses index on difficulty for filtering
 * - Limit prevents fetching millions of rows
 * 
 * WHY OPTIONAL DIFFICULTY:
 * - Global leaderboard: All difficulties combined
 * - Filtered leaderboard: "Top Easy Mode Players"
 */
export async function getLeaderboard(
  difficulty?: DifficultyLevel,
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();

  // Build the query
  let query = supabase
    .from("leaderboard")
    .select("*")                           // Select all columns
    .order("score", { ascending: false })  // Highest scores first
    .limit(limit);                         // Cap results

  // Add difficulty filter if provided
  if (difficulty) {
    query = query.eq("difficulty", difficulty);
  }

  // Execute the query
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];  // Return empty array on error, don't crash the app
  }

  // Transform database columns to camelCase for JavaScript
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

// =============================================================================
// FUNCTION 3: Get User Statistics
// =============================================================================

/**
 * Calculate aggregate statistics for a user
 * 
 * @param userId - The user's ID
 * @returns Stats object or null if error
 * 
 * CALCULATIONS:
 * - totalGames: Count of all sessions
 * - averageScore: Mean of all scores
 * - bestScore: Maximum score
 * - gamesWon: Count of sessions with lives_remaining > 0
 * 
 * WHY FROM game_sessions NOT leaderboard:
 * - game_sessions has ALL games (leaderboard might have deletions)
 * - More accurate for statistics
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = await createClient();

  // Fetch all game sessions for this user
  const { data, error } = await supabase
    .from("game_sessions")
    .select("score, lives_remaining")
    .eq("user_id", userId);

  if (error || !data) {
    console.error("Error fetching user stats:", error);
    return null;
  }

  // Calculate statistics from the data
  const totalGames = data.length;
  
  // Average score: Sum all scores and divide by count
  const averageScore =
    data.reduce((sum, game) => sum + game.score, 0) / totalGames || 0;
  
  // Best score: Find the maximum
  const bestScore = Math.max(...data.map((game) => game.score), 0);
  
  // Games won: Count games where they had lives remaining
  const gamesWon = data.filter((game) => game.lives_remaining > 0).length;

  return {
    totalGames,
    averageScore: Math.round(averageScore),  // Round to whole number
    bestScore,
    gamesWon,
  };
}

// =============================================================================
// FUNCTION 4: Get User's Rank
// =============================================================================

/**
 * Calculate a user's rank in the leaderboard
 * 
 * @param userId - The user's ID
 * @param difficulty - Optional: Filter by difficulty
 * @returns Rank number (1 = best) or null if user has no scores
 * 
 * ALGORITHM:
 * 1. Get user's best score
 * 2. Count how many scores are better than theirs
 * 3. Add 1 (if 5 people beat you, you're rank 6)
 * 
 * PERFORMANCE:
 * - Uses index on score for fast counting
 * - Two queries: One for user's score, one for count
 * 
 * EXAMPLE:
 * - User scored 500 points
 * - 10 people scored higher
 * - User's rank = 11
 */
export async function getUserRank(
  userId: string,
  difficulty?: DifficultyLevel
): Promise<number | null> {
  const supabase = await createClient();

  // Step 1: Get user's best score
  let userQuery = supabase
    .from("leaderboard")
    .select("score")
    .eq("user_id", userId)
    .order("score", { ascending: false })  // Highest first
    .limit(1);                             // Only need the best

  if (difficulty) {
    userQuery = userQuery.eq("difficulty", difficulty);
  }

  const { data: userData, error: userError } = await userQuery.single();

  if (userError || !userData) return null;

  // Step 2: Count how many scores are BETTER than user's best score
  let rankQuery = supabase
    .from("leaderboard")
    .select("score", { count: "exact", head: true })  // Count only, don't fetch data
    .gt("score", userData.score);  // Greater than user's score

  if (difficulty) {
    rankQuery = rankQuery.eq("difficulty", difficulty);
  }

  const { count, error: rankError } = await rankQuery;

  if (rankError) return null;

  // Rank = (number of better scores) + 1
  return (count || 0) + 1;
}
```

### 📝 Understanding Server Actions

Let's break down key concepts:

#### 1. **"use server" Directive**

```typescript
"use server";  // MUST be first line
```

**What it does**: Tells Next.js this file contains server-only code  
**Security**: Code in this file NEVER gets sent to the browser  
**Calling from client**: 
```typescript
// In client component:
const result = await saveGameResult(gameData);
// Next.js automatically creates an API route for this
```

#### 2. **Error Handling Strategy**

```typescript
// Critical data: Throw error
if (leaderboardError) {
  throw new Error("Failed to save");
}

// Nice-to-have data: Log but continue
if (sessionError) {
  console.error("Error:", sessionError);
  // Don't throw - keep going
}
```

**Why different handling**:
- Leaderboard is what users care about (show on leaderboard)
- Sessions are for analytics (not critical to user experience)

#### 3. **snake_case → camelCase Conversion**

```typescript
// Database uses snake_case
rounds_completed: number

// JavaScript uses camelCase
roundsCompleted: entry.rounds_completed
```

**Why transform**: JavaScript convention is camelCase. Database convention is snake_case.

#### 4. **Query Building Pattern**

```typescript
let query = supabase.from("table").select("*");

// Conditionally add filters
if (condition) {
  query = query.eq("column", value);
}

// Execute
const { data } = await query;
```

**Why this pattern**: Build complex queries step-by-step instead of if/else duplication.

### ✅ Phase 5 Checklist

- [ ] `src/app/game/actions.ts` created
- [ ] You understand "use server" directive
- [ ] You understand why server actions are secure
- [ ] You understand the error handling strategy
- [ ] You understand snake_case ↔ camelCase conversion
- [ ] All four functions implemented (save, getLeaderboard, getStats, getRank)

**Next**: Phase 6 - Optional UI components for leaderboard display.

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


**Key Features**:
- **Server Actions**: Run on server, secure database access
- **Type Safety**: Full TypeScript typing for inputs/outputs
- **Error Handling**: Graceful error handling with console logging
- **Flexible Queries**: Optional difficulty filtering
- **Stats Calculation**: Compute average, best, total games
- **Rank Calculation**: Determine user's position in leaderboard

---

## Phase 6: UI Components (Optional)

> **Duration**: ~20 minutes  
> **Purpose**: Create a visual leaderboard component to display rankings

This phase is **optional** - you can display the leaderboard data however you prefer. This is just one example implementation.

### 📝 Overview: What We're Building

A leaderboard display that:
- Shows top scores from database
- Filters by difficulty level
- Highlights top 3 players with trophy icons
- Responsive table design
- Loading states for better UX

### 🎯 Step 6.1: Create the Leaderboard Component

**File**: `src/components/game/Leaderboard.tsx`

```typescript
"use client";

// =============================================================================
// Imports
// =============================================================================

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { getLeaderboard, type LeaderboardEntry } from "@/app/game/actions";
import type { DifficultyLevel } from "@/types/game";

// =============================================================================
// Main Component
// =============================================================================

export default function Leaderboard() {
  // =========================================================
  // State Management
  // =========================================================

  // Leaderboard entries from database
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  
  // Current difficulty filter
  // "all" = show all difficulties
  // "easy" | "medium" | "hard" = filter by that difficulty
  const [difficulty, setDifficulty] = useState<DifficultyLevel | "all">("all");
  
  // Loading state for better UX
  const [loading, setLoading] = useState(true);

  // =========================================================
  // Data Fetching
  // =========================================================

  /**
   * Fetch leaderboard data when difficulty filter changes
   * 
   * WHY useEffect with [difficulty] dependency:
   * - Re-fetch when user changes the filter
   * - Fetch once on component mount (initial render)
   */
  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);  // Show loading spinner
      
      // Call server action
      // If difficulty is "all", pass undefined (no filter)
      const data = await getLeaderboard(
        difficulty === "all" ? undefined : difficulty
      );
      
      setEntries(data);      // Update state with fetched data
      setLoading(false);     // Hide loading spinner
    }
    
    fetchLeaderboard();
  }, [difficulty]);  // Re-run when difficulty changes

  // =========================================================
  // Render
  // =========================================================

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Leaderboard
      </h1>

      {/* Difficulty Filter Buttons */}
      <div className="flex gap-2 mb-6 justify-center flex-wrap">
        {["all", "easy", "medium", "hard"].map((diff) => (
          <button
            key={diff}
            onClick={() => setDifficulty(diff as DifficultyLevel | "all")}
            className={`
              px-4 py-2 rounded-lg font-semibold transition-colors
              ${
                difficulty === diff
                  ? "bg-purple-600 text-white"           // Active button style
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"  // Inactive style
              }
            `}
          >
            {/* Capitalize first letter: "all" → "All" */}
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        // Loading State
        <div className="text-center py-8">Loading...</div>
      ) : (
        // Data Display
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Player</th>
                <th className="px-6 py-3 text-center">Difficulty</th>
                <th className="px-6 py-3 text-center">Score</th>
                <th className="px-6 py-3 text-center">Rounds</th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={`
                    border-b
                    ${index < 3 ? "bg-yellow-50" : "hover:bg-gray-50"}
                  `}
                >
                  {/* Rank Column with Trophy Icons */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Gold trophy for 1st place */}
                      {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                      
                      {/* Silver trophy for 2nd place */}
                      {index === 1 && <Trophy className="w-5 h-5 text-gray-400" />}
                      
                      {/* Bronze trophy for 3rd place */}
                      {index === 2 && <Trophy className="w-5 h-5 text-orange-600" />}
                      
                      {/* Rank number */}
                      <span className="font-bold">{index + 1}</span>
                    </div>
                  </td>
                  
                  {/* Player Name Column */}
                  <td className="px-6 py-4 font-semibold">
                    {entry.username || "Anonymous"}
                  </td>
                  
                  {/* Difficulty Badge Column */}
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`
                        px-2 py-1 rounded-full text-xs font-semibold
                        ${
                          entry.difficulty === "easy"
                            ? "bg-green-100 text-green-700"
                            : entry.difficulty === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }
                      `}
                    >
                      {entry.difficulty}
                    </span>
                  </td>
                  
                  {/* Score Column */}
                  <td className="px-6 py-4 text-center font-bold text-purple-600">
                    {entry.score}
                  </td>
                  
                  {/* Rounds Completed Column */}
                  <td className="px-6 py-4 text-center">
                    {entry.roundsCompleted}/5
                  </td>
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

### 📝 Understanding the Leaderboard Component

#### 1. **Client-Side Data Fetching**

```typescript
useEffect(() => {
  async function fetchLeaderboard() {
    const data = await getLeaderboard(difficulty);
    setEntries(data);
  }
  fetchLeaderboard();
}, [difficulty]);
```

**How it works**:
1. Component mounts → useEffect runs
2. Calls server action `getLeaderboard()`
3. Server action queries database
4. Data comes back to client
5. State updates → component re-renders with data

**Why not fetch during render**:
- Can't use async/await in render function
- useEffect runs after render, perfect for data fetching

#### 2. **Conditional Styling**

```typescript
className={`${index < 3 ? "bg-yellow-50" : "hover:bg-gray-50"}`}
```

**What this does**:
- Top 3 rows get yellow background (highlight winners)
- Other rows get hover effect (interactive feedback)

#### 3. **Trophy Icons**

```typescript
{index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
```

**Pattern**: Conditional rendering with `&&`
- `condition && <Component />` → if condition is true, render Component
- `index === 0` → only for first row (rank 1)
- Different colors for gold/silver/bronze

#### 4. **Loading State**

```typescript
{loading ? <div>Loading...</div> : <table>...</table>}
```

**Why important**:
- Prevents showing empty table while data loads
- Better user experience (user knows something is happening)
- Avoids "flash of empty content"

### ✅ Phase 6 Checklist

- [ ] `src/components/game/Leaderboard.tsx` created
- [ ] You understand useEffect for data fetching
- [ ] You understand conditional styling with template literals
- [ ] You understand conditional rendering with &&
- [ ] Trophy icons render correctly for top 3
- [ ] Loading state shows before data loads
- [ ] Difficulty filter buttons work

**Optional Enhancements**:
- Add pagination (show 10 at a time, with Next/Previous buttons)
- Add search (filter by username)
- Add date range filter (last 7 days, last 30 days)
- Add user highlight (highlight current user's entry)

**Next**: Phase 7 - Add internationalization for multi-language support

---

## Phase 7: Internationalization (i18n)

> **Duration**: ~15 minutes  
> **Purpose**: Add translation keys for English and Spanish

Your app already has `next-intl` configured. We just need to add translation keys for the game feature.

### 📝 Overview: How next-intl Works

```
User visits → /en/play
              ↓
next-intl loads → messages/en.json
              ↓
Component uses → t('gamePage.score')
              ↓
Displays → "Score"
```

**If user visits `/es/play`**:
- Loads `messages/es.json` instead
- `t('gamePage.score')` → "Puntuación"

### 🎯 Step 7.1: Add English Translations

**File**: `messages/en.json`

Add this section to your existing JSON:

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
      "wrong": "Wrong Answer",
      "tooSlow": "Time's up! ⏰",
      "theAnswer": "The answer was"
    },
    "nextRound": "Next Round",
    "seeResults": "See Results",
    "results": {
      "victory": "Victory!",
      "gameOver": "Game Over",
      "finalScore": "Final Score",
      "roundByRound": "Round by Round",
      "roundNumber": "Round {number}",
      "correct": "Correct",
      "wrong": "Wrong",
      "skipped": "Skipped",
      "pointsEarned": "+{points} pts",
      "pointsLost": "-{points} pts",
      "timePenalty": "Time penalty: -{seconds}s",
      "timeBonus": "Time bonus: +{seconds}s",
      "livesLost": "Lives lost: {lives}"
    },
    "playAgain": "Play Again",
    "backToMenu": "Back to Menu"
  }
}
```

### 🎯 Step 7.2: Add Spanish Translations

**File**: `messages/es.json`

Add this section to your existing JSON:

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
      "tagline": "Lema",
      "noGenre": "Sin género disponible",
      "noTagline": "Sin lema disponible"
    },
    "revealMore": "Revelar Más",
    "skip": "Saltar Ronda",
    "feedback": {
      "correct": "¡Correcto! 🎉",
      "wrong": "Respuesta Incorrecta",
      "tooSlow": "¡Se acabó el tiempo! ⏰",
      "theAnswer": "La respuesta era"
    },
    "nextRound": "Siguiente Ronda",
    "seeResults": "Ver Resultados",
    "results": {
      "victory": "¡Victoria!",
      "gameOver": "Fin del Juego",
      "finalScore": "Puntuación Final",
      "roundByRound": "Ronda por Ronda",
      "roundNumber": "Ronda {number}",
      "correct": "Correcto",
      "wrong": "Incorrecto",
      "skipped": "Saltado",
      "pointsEarned": "+{points} pts",
      "pointsLost": "-{points} pts",
      "timePenalty": "Penalización de tiempo: -{seconds}s",
      "timeBonus": "Bonificación de tiempo: +{seconds}s",
      "livesLost": "Vidas perdidas: {lives}"
    },
    "playAgain": "Jugar de Nuevo",
    "backToMenu": "Volver al Menú"
  }
}
```

### 📝 Understanding i18n Structure

#### 1. **Nested Keys**

```json
{
  "gamePage": {
    "hints": {
      "genre": "Genre"
    }
  }
}
```

**Access in component**:
```typescript
t('gamePage.hints.genre')  // → "Genre"
```

**Why nest**: Organize related translations together, avoid key conflicts.

#### 2. **Dynamic Values**

```json
{
  "pointsEarned": "+{points} pts"
}
```

**Use in component**:
```typescript
t('gamePage.results.pointsEarned', { points: 50 })
// → "+50 pts"
```

**How it works**: `{points}` is a placeholder, replaced with the value you pass.

#### 3. **Emoji in Translations**

```json
{
  "correct": "Correct! 🎉"
}
```

**Why include emoji**:
- Visual feedback
- Universal (works in all languages)
- Adds personality

**Alternative**: Use Lucide icons in code instead of emoji in translations.

### 🎯 Step 7.3: Use Translations in Game Component

At the top of `Game.tsx`:

```typescript
"use client";

import { useTranslations } from 'next-intl';

export default function Game() {
  const t = useTranslations('gamePage');  // Load gamePage namespace
  
  // Now you can use:
  // t('score') → "Score"
  // t('hints.genre') → "Genre"
  // t('results.pointsEarned', { points: 50 }) → "+50 pts"
  
  // ... rest of component
}
```

**Example usage**:
```typescript
// Before (hardcoded):
<button>Submit Guess</button>

// After (translated):
<button>{t('submitGuess')}</button>

// With dynamic value:
<p>{t('results.pointsEarned', { points: roundResult.points })}</p>
```

### ✅ Phase 7 Checklist

- [ ] `messages/en.json` updated with gamePage translations
- [ ] `messages/es.json` updated with gamePage translations  
- [ ] You understand nested translation keys
- [ ] You understand dynamic placeholders like `{points}`
- [ ] You understand how to use `useTranslations()` hook
- [ ] All hardcoded game text replaced with `t()` calls
- [ ] Test both `/en/play` and `/es/play` routes

**Testing**:
1. Visit `http://localhost:3000/en/play` → See English
2. Visit `http://localhost:3000/es/play` → See Spanish
3. All text should translate correctly

**Next**: Phase 8 - Final setup, testing, and deployment
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

## Phase 8: Final Setup & Testing

> **Duration**: ~20 minutes  
> **Purpose**: Install dependencies, configure environment, and test everything

This is the final phase where you put everything together and make sure it all works.

### 📝 Overview: What We're Setting Up

```
Dependencies → Environment Variables → Database → Testing → Launch
```

Each step builds on the previous one. Let's go in order.

### 🎯 Step 8.1: Install Dependencies

#### Install Lucide React (Icon Library)

```bash
npm install lucide-react
```

**What it's for**:
- Trophy icons for leaderboard
- UI icons throughout the game
- Lightweight and tree-shakeable (only imports what you use)

**Alternative icons** (if you prefer):
- `react-icons` - Larger collection
- `heroicons` - Tailwind's official icons
- Material UI icons

**Verify installation**:
```bash
npm list lucide-react
```

Should show `lucide-react@<version>` in the output.

### 🎯 Step 8.2: Environment Variables

Your `.env.local` file should have:

```env
# TMDB API (required for game to work)
TMDB_API_KEY=your_actual_api_key_here

# Supabase (required for leaderboard/sessions)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

#### 🔑 Getting Your TMDB API Key

1. Go to https://www.themoviedb.org/
2. Create free account
3. Go to Settings → API
4. Request API key (choose "Developer" option)
5. Fill out form (can put "Personal Project" for all fields)
6. Copy the "API Key (v3 auth)" value
7. Paste into `.env.local` as `TMDB_API_KEY`

#### 🔑 Getting Supabase Keys

1. Already in your Supabase dashboard
2. Go to Project Settings → API
3. Copy "Project URL" → paste as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy "anon public" key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### ⚠️ Important: Restart Dev Server

After changing `.env.local`:

```bash
# Stop the server (Ctrl+C)
# Then start again:
npm run dev
```

**Why**: Next.js only reads `.env.local` on startup.

### 🎯 Step 8.3: Database Setup

#### Run the Migration

**Option 1: Supabase Studio (Recommended)**

1. Open your Supabase project
2. Go to SQL Editor (left sidebar)
3. Click "New Query"
4. Copy the entire migration SQL from Phase 4
5. Paste into the editor
6. Click "Run" button

**Expected output**:
```
Success. No rows returned.
```

**Option 2: Supabase CLI**

```bash
# If you have the CLI installed:
npx supabase migration new add_game_tables
# Paste SQL into the generated file
npx supabase db push
```

#### Verify Tables Were Created

1. Go to Table Editor (left sidebar)
2. You should see two new tables:
   - `leaderboard`
   - `game_sessions`
3. Click on each table to verify columns

**Expected columns for leaderboard**:
- id, user_id, username, difficulty, score, rounds_completed, lives_remaining, created_at

**Expected columns for game_sessions**:
- id, user_id, difficulty, score, rounds_completed, lives_remaining, completed_at, round_results

#### Test Row Level Security

1. Try to insert a test row (should only work if authenticated)
2. Go to Authentication → Users
3. Create a test user or login with existing account
4. Try saving a game result

### 🎯 Step 8.4: Type Generation (Optional)

This auto-generates TypeScript types from your database schema:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

**Find your project ID**:
- Supabase Dashboard → Project Settings → General → Reference ID

**Why this is useful**:
- Autocomplete for database columns
- TypeScript errors if you query non-existent columns
- Syncs types with database schema

**When to regenerate**:
- After adding new tables
- After adding new columns
- After changing column types

### 🎯 Step 8.5: Test the Complete Flow

#### Start the Development Server

```bash
npm run dev
```

**Expected output**:
```
> frame-guesser@0.1.0 dev
> next dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

#### Test Checklist

**1. Basic Navigation**
- [ ] Visit `http://localhost:3000`
- [ ] Navigate to Play page
- [ ] Page loads without errors

**2. Difficulty Selection Screen**
- [ ] Click "Easy" → shows difficulty details
- [ ] Click "Medium" → shows difficulty details
- [ ] Click "Hard" → shows difficulty details
- [ ] Click "Start Game" → loads game

**3. Game Round (1st Round)**
- [ ] Blurred movie frame appears
- [ ] Timer starts counting
- [ ] Lives show correctly (3 for Easy)
- [ ] Score starts at 0
- [ ] Can type in input field

**4. Hint System**
- [ ] Click "Genre" → Genre hint appears
- [ ] Click "Year" → Year hint appears
- [ ] Click "Rating" → Rating hint appears
- [ ] Click "Tagline" → Tagline appears (if available)
- [ ] Each hint costs 10 points (score decreases)

**5. Blur Reveal**
- [ ] Click "Reveal More" → Image gets clearer
- [ ] Costs 5 points per click
- [ ] Can click multiple times

**6. Correct Guess**
- [ ] Type correct movie title
- [ ] Press Enter or click "Submit"
- [ ] "Correct! 🎉" feedback appears
- [ ] Score increases
- [ ] "Next Round" button appears
- [ ] Click "Next Round" → Round 2 starts

**7. Wrong Guess**
- [ ] Type wrong movie title
- [ ] Submit guess
- [ ] "Wrong Answer" feedback appears
- [ ] Lives decrease by 1
- [ ] Can guess again if lives remaining
- [ ] If no lives left → Game Over screen

**8. Skip Round**
- [ ] Click "Skip Round"
- [ ] Round marked as skipped
- [ ] Moves to next round
- [ ] Lives unchanged (skip doesn't cost lives)

**9. Time Limits (Hard Mode)**
- [ ] Start Hard mode game
- [ ] Wait for timer to reach 0
- [ ] Automatic fail when time runs out
- [ ] Lives decrease

**10. Results Screen**
- [ ] After 5 rounds → Results screen appears
- [ ] Shows "Victory!" if lives remaining
- [ ] Shows "Game Over" if no lives
- [ ] Final score displays correctly
- [ ] Round breakdown shows all 5 rounds
- [ ] Each round shows:
  - Movie title
  - Correct/Wrong/Skipped status
  - Points earned/lost
  - Time taken

**11. Database Persistence** (requires login)
- [ ] Complete a game while logged in
- [ ] Check Supabase Table Editor → `leaderboard` table
- [ ] Your score should appear
- [ ] Check `game_sessions` table
- [ ] Your game session should appear
- [ ] Verify username is stored correctly

**12. Leaderboard** (if you implemented it)
- [ ] Navigate to leaderboard page
- [ ] Your recent score appears
- [ ] Can filter by difficulty
- [ ] Top 3 have trophy icons
- [ ] Scores sorted correctly (highest first)

**13. Internationalization**
- [ ] Visit `/en/play` → See English text
- [ ] Visit `/es/play` → See Spanish text
- [ ] Change language in settings → Game text updates
- [ ] All buttons/labels translated

**14. Error Handling**
- [ ] Disconnect internet
- [ ] Try to fetch movies → Should show error message
- [ ] Reconnect internet
- [ ] Try again → Should work

#### Console Checks

Open browser DevTools (F12):

**Console tab** - Should see:
- No red errors (warnings are OK)
- Loading messages for TMDB requests
- Success messages for game actions

**Network tab** - Should see:
- Requests to TMDB API (status 200)
- Requests to Supabase (status 200)
- No failed requests (404, 500)

**Application tab → Local Storage** - Should see:
- Supabase auth tokens (if logged in)
- Any cached game state

### ✅ Phase 8 Checklist

- [ ] `lucide-react` installed successfully
- [ ] `.env.local` has all required keys
- [ ] TMDB API key is valid and working
- [ ] Supabase keys are valid
- [ ] Dev server starts without errors
- [ ] Database migration executed successfully
- [ ] All tables created with correct columns
- [ ] RLS policies working (can save game when authenticated)
- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Game is playable end-to-end

**If any test fails**: See Troubleshooting section below.

---

## Troubleshooting Common Issues

### 🔴 TMDB API Issues

#### Error: "Invalid API Key"

**Symptoms**:
```
Error: Request failed with status code 401
```

**Solutions**:
1. Check `.env.local` file exists in project root
2. Verify `TMDB_API_KEY` is spelled correctly
3. Ensure no spaces around the `=` sign
4. Restart dev server after changing `.env.local`
5. Test API key with curl:
   ```bash
   curl "https://api.themoviedb.org/3/movie/550?api_key=YOUR_KEY"
   ```

#### Error: "Too Many Requests"

**Symptoms**:
```
Error: Request failed with status code 429
```

**Cause**: TMDB rate limits (40 requests per 10 seconds)

**Solutions**:
1. Add delay between requests:
   ```typescript
   await new Promise(resolve => setTimeout(resolve, 250)); // 250ms delay
   ```
2. Cache movie data in state/localStorage
3. Use fewer API calls (fetch more movies per request)

#### Error: "No Movies Found"

**Symptoms**: Game doesn't start, stuck on loading

**Solutions**:
1. Check browser console for API errors
2. Verify `fetchMultipleMovies()` parameters
3. Lower `minVoteCount` filter (some years have few popular movies)
4. Remove `year` filter temporarily to test

### 🔴 Database Issues

#### Error: "Row Level Security policy violation"

**Symptoms**:
```
Error: new row violates row-level security policy
```

**Cause**: Trying to insert data without being authenticated

**Solutions**:
1. Ensure user is logged in before saving game
2. Check RLS policies in Supabase:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'leaderboard';
   ```
3. Verify `user_id` in insert matches authenticated user:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   console.log(user?.id); // Should match user_id in insert
   ```

#### Error: "Table doesn't exist"

**Symptoms**:
```
Error: relation "leaderboard" does not exist
```

**Solutions**:
1. Verify migration ran successfully
2. Check Table Editor in Supabase
3. Re-run migration SQL in SQL Editor
4. Check for typos in table name (PostgreSQL is case-sensitive)

#### Error: "Column doesn't exist"

**Symptoms**:
```
Error: column "rounds_completed" does not exist
```

**Solutions**:
1. Check migration included all columns
2. Verify column name spelling (snake_case in database)
3. Regenerate Supabase types:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID
   ```

### 🔴 TypeScript Issues

#### Error: "Cannot find module '@/types/game'"

**Symptoms**:
```
Module not found: Can't resolve '@/types/game'
```

**Solutions**:
1. Ensure `src/types/game.ts` file exists
2. Check `tsconfig.json` has paths configured:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```
3. Restart TypeScript server in VS Code (Cmd+Shift+P → "Restart TS Server")

#### Error: "Type 'string' is not assignable to type 'DifficultyLevel'"

**Symptoms**:
```typescript
// This line has an error:
const diff: DifficultyLevel = "EASY"; // Error!
```

**Solution**: Use lowercase (DifficultyLevel = "easy" | "medium" | "hard")
```typescript
const diff: DifficultyLevel = "easy"; // ✓ Correct
```

### 🔴 Game Logic Issues

#### Issue: Timer Doesn't Start

**Symptoms**: Timer shows 00:00 and doesn't count up

**Solutions**:
1. Check `roundStartTime` is set when round starts:
   ```typescript
   console.log('Round start time:', gameState.roundStartTime);
   ```
2. Verify `useEffect` for timer is running:
   ```typescript
   useEffect(() => {
     console.log('Timer useEffect triggered');
     // ... timer logic
   }, [gameState.currentRound, gameState.screen]);
   ```
3. Check `setInterval` is called:
   ```typescript
   const interval = setInterval(() => {
     console.log('Timer tick');
   }, 1000);
   ```

#### Issue: Fuzzy Matching Too Strict

**Symptoms**: Typing exact title says "Wrong"

**Solutions**:
1. Console log the comparison:
   ```typescript
   console.log('User guess:', guess);
   console.log('Correct title:', currentMovie.title);
   console.log('Match result:', fuzzyMatch(guess, currentMovie.title));
   ```
2. Adjust fuzzy match threshold (lower = more lenient):
   ```typescript
   const threshold = 0.7; // Try 0.6 or 0.5
   ```
3. Test with normalized strings:
   ```typescript
   const normalize = (str: string) => 
     str.toLowerCase()
        .replace(/[^a-z0-9]/g, '');
   ```

#### Issue: Scoring Calculation Wrong

**Symptoms**: Score doesn't match expected value

**Solutions**:
1. Add debug logs to `calculateRoundScore`:
   ```typescript
   console.log('Base points:', baseScore);
   console.log('Hint penalty:', hintsUsed * GAME_CONFIG.hintPenalty);
   console.log('Blur penalty:', blurReveals * GAME_CONFIG.blurRevealCost);
   console.log('Time bonus/penalty:', timeDelta);
   console.log('Final score:', totalPoints);
   ```
2. Verify constants in `GAME_CONFIG`
3. Check for integer overflow (unlikely but possible)

### 🔴 Performance Issues

#### Issue: Game Lags or Freezes

**Solutions**:
1. Check for infinite loops in useEffect
2. Memoize expensive calculations:
   ```typescript
   const score = useMemo(() => calculateScore(), [dependencies]);
   ```
3. Use React DevTools Profiler to find slow renders
4. Optimize image loading (use Next.js Image component)

#### Issue: Slow API Requests

**Solutions**:
1. Check network tab in DevTools
2. Verify TMDB API response time
3. Add loading states during fetches
4. Cache movie data (localStorage or React Query)

### 🔴 Styling Issues

#### Issue: Tailwind Classes Not Working

**Solutions**:
1. Verify `tailwind.config.ts` includes your files:
   ```typescript
   content: [
     './src/**/*.{js,ts,jsx,tsx}',
   ]
   ```
2. Restart dev server
3. Check `globals.css` has Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

#### Issue: Blur Effect Not Working

**Solutions**:
1. Verify backdrop filter is supported in your browser
2. Add Safari prefix:
   ```css
   backdrop-filter: blur(20px);
   -webkit-backdrop-filter: blur(20px);
   ```
3. Use CSS filter instead:
   ```css
   filter: blur(20px);
   ```

---

## Best Practices & Tips

### 1. **State Management**

```typescript
// ✓ Good: Single source of truth
const [gameState, setGameState] = useState<GameState>({
  score: 0,
  lives: 3,
  currentRound: 1,
  // ... all game state together
});

// ✗ Bad: Scattered state
const [score, setScore] = useState(0);
const [lives, setLives] = useState(3);
const [round, setRound] = useState(1);
// Harder to keep in sync
```

### 2. **Type Safety**

```typescript
// ✓ Good: Explicit types
function calculateScore(round: RoundResult): number {
  return round.points;
}

// ✗ Bad: Any types
function calculateScore(round: any): any {
  return round.points; // No autocomplete, no type checking
}
```

### 3. **Error Handling**

```typescript
// ✓ Good: Try-catch with user-friendly message
try {
  const movies = await fetchMultipleMovies();
} catch (error) {
  console.error('Failed to fetch movies:', error);
  showErrorToUser('Could not load movies. Please try again.');
}

// ✗ Bad: Silent failure
try {
  const movies = await fetchMultipleMovies();
} catch (error) {
  // Nothing - user sees broken UI
}
```

### 4. **Performance Optimization**

```typescript
// ✓ Good: Memoize expensive calculations
const score = useMemo(() => {
  return gameState.rounds.reduce((sum, r) => sum + r.points, 0);
}, [gameState.rounds]);

// ✗ Bad: Recalculate every render
function MyComponent() {
  const score = gameState.rounds.reduce((sum, r) => sum + r.points, 0);
  // This runs on EVERY render
}
```

### 5. **User Experience**

```typescript
// ✓ Good: Loading states
{loading ? (
  <div>Loading movies...</div>
) : (
  <GameComponent movies={movies} />
)}

// ✗ Bad: No feedback
<GameComponent movies={movies} />
// User sees blank screen during load
```

### 6. **Testing**

```typescript
// ✓ Good: Test edge cases
test('fuzzyMatch handles special characters', () => {
  expect(fuzzyMatch("Spider-Man", "spider man")).toBe(true);
  expect(fuzzyMatch("The Lord of the Rings", "lord rings")).toBe(true);
});

// ✗ Bad: Only test happy path
test('fuzzyMatch works', () => {
  expect(fuzzyMatch("Test", "test")).toBe(true);
});
```

### 7. **Accessibility**

```typescript
// ✓ Good: Keyboard accessible
<button
  onClick={handleSubmit}
  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
  aria-label="Submit guess"
>
  Submit
</button>

// ✗ Bad: Mouse-only
<div onClick={handleSubmit}>Submit</div>
```

---

## Next Steps & Enhancements

Now that you have a working game, here are ideas to enhance it:

### 🎨 Visual Enhancements

1. **Animations**:
   - Framer Motion for smooth transitions
   - Confetti on correct guesses
   - Progress bar animations

2. **Themes**:
   - Dark mode support
   - Custom color schemes per difficulty
   - Seasonal themes (Halloween, Christmas)

3. **Sound Effects**:
   - Correct guess sound
   - Wrong guess sound
   - Background music
   - Ticking clock for time pressure

### 🎮 Gameplay Enhancements

1. **New Game Modes**:
   - **Time Attack**: Fixed 30 seconds per round
   - **Endless**: Keep going until all lives lost
   - **Daily Challenge**: Same 5 movies for everyone
   - **Multiplayer**: Real-time vs friends

2. **Power-Ups**:
   - 50/50 (eliminate wrong answers)
   - Extra life
   - Double points
   - Time freeze

3. **Achievements**:
   - Perfect score (no hints, no wrong guesses)
   - Speed demon (under 10 seconds per round)
   - Marathon (play 10 games in a row)
   - Perfectionist (100% accuracy over 50 games)

### 📊 Analytics & Stats

1. **Player Statistics**:
   - Win rate by difficulty
   - Average score over time
   - Favorite genres (most correct guesses)
   - Hardest movies (most failed attempts)

2. **Global Statistics**:
   - Most played difficulty
   - Hardest movie in database
   - Average completion time
   - Most used hints

### 🌐 Content Expansion

1. **More Categories**:
   - TV Shows
   - Anime
   - Documentaries
   - Classic films (pre-1980)

2. **Custom Collections**:
   - Marvel Cinematic Universe
   - Studio Ghibli
   - Best Picture Winners
   - User-created playlists

### 🔐 Social Features

1. **Friends System**:
   - Add friends
   - Compare scores
   - Challenge friends to beat your score
   - Friend-only leaderboards

2. **Sharing**:
   - Share results on Twitter/Facebook
   - Generate shareable image with stats
   - Daily challenge results

### 💰 Monetization (Optional)

1. **Premium Features**:
   - Ad-free experience
   - Unlimited hint usage
   - Access to premium movie collections
   - Early access to new features

2. **Cosmetics**:
   - Custom themes
   - Avatar frames
   - Unique trophies
   - Profile badges

---

## Deployment Guide

### Prerequisites

- GitHub account
- Vercel account (free)
- Supabase project (production)

### Steps

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Complete game implementation"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `TMDB_API_KEY`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Configure Supabase for Production**:
   - Go to Supabase Dashboard
   - Authentication → URL Configuration
   - Add your Vercel domain to redirect URLs

4. **Test Production Build**:
   - Visit your deployed URL
   - Test complete game flow
   - Check all features work

5. **Monitor**:
   - Vercel Analytics for performance
   - Supabase Logs for database issues
   - Error tracking with Sentry (optional)

---

## Conclusion

🎉 **Congratulations!** You've implemented a complete movie guessing game with:

✅ Multiple difficulty levels with different mechanics  
✅ 4 types of hints with scoring penalties  
✅ Progressive image blur reveal system  
✅ Fuzzy string matching for answers  
✅ Time tracking and bonuses/penalties  
✅ Database persistence with Row Level Security  
✅ Global leaderboard with filtering  
✅ Multi-language support (English/Spanish)  
✅ Responsive, polished UI  

### What You Learned

- **Next.js App Router**: Server/client components, routing, server actions
- **React Hooks**: useState, useEffect, useCallback, useMemo
- **TypeScript**: Type safety, interfaces, generics, union types
- **Supabase**: Database design, RLS policies, server-side auth
- **API Integration**: TMDB API, rate limiting, error handling
- **Game Development**: State machines, scoring systems, game loops
- **UI/UX**: Loading states, feedback, animations, accessibility

### Final Reminders

- **Keep learning**: Game development is iterative
- **Get feedback**: Show it to friends, watch them play
- **Iterate**: Add features based on user feedback
- **Performance**: Monitor and optimize as you scale
- **Security**: Never trust client input, always validate on server
- **Fun**: Make the game YOU want to play!

**Happy coding! 🚀**
