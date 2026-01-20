"use server"

import type { DifficultyLevel } from "../../types/game"
import { createClient } from "../../utils/supabase/server"

export interface GameResult {
  userId: string
  difficulty: DifficultyLevel
  score: number
  roundsCompleted: number
  livesRemaining: number
}

export interface LeaderboardEntry {
  id: string
  username: string | null
  difficulty: DifficultyLevel
  score: number
  roundsCompleted: number
  livesRemaining: number
  createdAt: string
}

export interface UserStats {
  totalGames: number
  averageScore: number
  bestScore: number
  gamesWon: number
}

interface GameSession {
  score: number
  lives_remaining: number
}

export async function saveGameResult(result: GameResult) {
  const supabase = await createClient()

  const { data: profile } = (await supabase
    .from("profiles")
    .select("username")
    .eq("id", result.userId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .single()) as any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: leaderboardError } = await (supabase as any)
    .from("leaderboard")
    .insert([
      {
        user_id: result.userId,
        username: profile?.username ?? null,
        difficulty: result.difficulty as "easy" | "medium" | "hard",
        score: result.score,
        rounds_completed: result.roundsCompleted,
        lives_remaining: result.livesRemaining
      }
    ])

  if (leaderboardError) {
    console.error("Error saving to leaderboard:", leaderboardError)
    throw new Error("Failed to save game result to leaderboard.")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: sessionError } = await (supabase as any)
    .from("game_sessions")
    .insert([
      {
        user_id: result.userId,
        difficulty: result.difficulty as "easy" | "medium" | "hard",
        score: result.score,
        rounds_completed: result.roundsCompleted,
        lives_remaining: result.livesRemaining,
        completed_at: new Date().toISOString()
      }
    ])

  if (sessionError) {
    console.error("Error saving game session:", sessionError)
    throw new Error("Failed to save game session.")
  }

  return { success: true }
}

export async function getLeaderboard(
  difficulty?: DifficultyLevel,
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  const supabase = await createClient()

  let query = supabase
    .from("leaderboard")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit)

  if (difficulty) {
    query = query.eq("difficulty", difficulty)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.map((entry: any) => ({
      id: entry.id,
      username: entry.username,
      difficulty: entry.difficulty,
      score: entry.score,
      roundsCompleted: entry.rounds_completed,
      livesRemaining: entry.lives_remaining,
      createdAt: entry.created_at
    })) || []
  )
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("game_sessions")
    .select("score, lives_remaining")
    .eq("user_id", userId)

  if (error || !data) {
    console.error("Error fetching user stats:", error)
    return null
  }

  const typedData = data as GameSession[]

  const totalGames = typedData.length
  const averageScore = typedData.reduce((sum, game) => sum + game.score, 0) / totalGames
  const bestScore = Math.max(...typedData.map((game) => game.score), 0)
  const gamesWon = typedData.filter((game) => game.lives_remaining > 0).length

  return {
    totalGames,
    averageScore: Math.round(averageScore),
    bestScore,
    gamesWon
  }
}

export async function getUserRank(
  userId: string,
  difficulty?: DifficultyLevel
): Promise<number | null> {
  const supabase = await createClient()

  let userQuery = supabase
    .from("leaderboard")
    .select("score")
    .eq("user_id", userId)
    .order("score", { ascending: false })
    .limit(1)

  if (difficulty) {
    userQuery = userQuery.eq("difficulty", difficulty)
  }

  const { data: userData, error: userError } = await userQuery.single()

  if (userError || !userData) return null

  const typedUserData = userData as { score: number }

  let rankQuery = supabase
    .from("leaderboard")
    .select("score", { count: "exact", head: true })
    .gt("score", typedUserData.score)

  if (difficulty) {
    rankQuery = rankQuery.eq("difficulty", difficulty)
  }

  const { count, error: rankError } = await rankQuery

  if (rankError) return null

  return (count || 0) + 1
}
