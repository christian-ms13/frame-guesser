"use client"

import { useTranslations } from "next-intl"

import { useEffect, useState } from "react"
import { getLeaderboard, type LeaderboardEntry } from "../../app/game/actions"
import type { DifficultyLevel } from "../../types/game"
import { IconTrophy } from "./GameIcons"

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [difficulty, setDifficulty] = useState<DifficultyLevel | "all">("all")
  const [loading, setLoading] = useState(true)

  const translations = useTranslations("leaderboard")

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true)

      const data = await getLeaderboard(
        difficulty === "all" ? undefined : difficulty
      )

      setEntries(data)
      setLoading(false)
    }

    fetchLeaderboard()
  }, [difficulty])

  return (
    <>
      <div className = "w-full max-w-5xl px-6">
        <div className = "mb-10">
          <h1 className = "text-5xl font-courierprime-bold text-neutral-900 dark:text-white text-center mb-2">
            {translations("title")}
          </h1>
        </div>

        <div className = "flex gap-3 mb-8 justify-center flex-wrap">
          {["all", "easy", "medium", "hard"].map((diff) => (
            <button
              key = {diff}
              onClick = {() => setDifficulty(diff as DifficultyLevel | "all")}
              className = {`
                cursor-pointer px-6 py-3 rounded-2xl font-play-bold transition-all duration-150 hover:scale-105 active:scale-100
                ${
                  difficulty === diff
                    ? "bg-[#121212] text-[#e3e3e1] dark:bg-[#e3e3e1] dark:text-[#121212] shadow-lg shadow-black/50 dark:shadow-white/20"
                    : "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600 shadow-md"
                }
              `}
            >
              {diff === "all" ? "All" : translations(`difficulty.${diff}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className = "flex items-center justify-center py-16">
            <div className = "text-center">
              <div className = "mb-4 inline-block">
                <div className = "animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-white"></div>
              </div>
              <p className = "text-neutral-600 dark:text-neutral-400 font-robotoslab-medium">
                {translations("loading")}
              </p>
            </div>
          </div>
        ) : (
          <div className = "bg-neutral-100 dark:bg-neutral-800 rounded-3xl shadow-xl shadow-black/40 dark:shadow-black/70 border-2 border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className = "overflow-x-auto">
              <table className = "w-full">
                <thead className = "bg-neutral-200 dark:bg-neutral-700 border-b-2 border-neutral-300 dark:border-neutral-600">
                  <tr>
                    <th className = "px-6 py-4 text-left text-sm font-courierprime-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                      {translations("table.rank")}
                    </th>
                    <th className = "px-6 py-4 text-left text-sm font-courierprime-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                      {translations("table.player")}
                    </th>
                    <th className = "px-6 py-4 text-center text-sm font-courierprime-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                      {translations("table.difficulty")}
                    </th>
                    <th className = "px-6 py-4 text-center text-sm font-courierprime-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                      {translations("table.score")}
                    </th>
                    <th className = "px-6 py-4 text-center text-sm font-courierprime-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                      {translations("table.rounds")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {entries.map((entry, index) => (
                    <tr
                      key = {entry.id}
                      className = {`border-b border-neutral-300 dark:border-neutral-600 transition-colors duration-150 ${
                        index < 3
                          ? "bg-neutral-50 dark:bg-neutral-700/50"
                          : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-150 dark:hover:bg-neutral-750"
                      }`}
                    >
                      <td className = "px-6 py-4">
                        <div className = "flex items-center gap-3">
                          {index === 0 && <IconTrophy className = "w-5 h-5 text-yellow-500" />}
                          {index === 1 && <IconTrophy className = "w-5 h-5 text-gray-400" />}
                          {index === 2 && <IconTrophy className = "w-5 h-5 text-orange-500" />}

                          <span className = "font-courierprime-bold text-lg text-neutral-900 dark:text-white">
                            {index + 1}
                          </span>
                        </div>
                      </td>

                      <td className = "px-6 py-4 text-left">
                        <span className = "font-robotoslab-bold text-neutral-900 dark:text-white">
                          {entry.username || translations("table.anonymous")}
                        </span>
                      </td>

                      <td className = "px-6 py-4 text-center">
                        <span className = {`
                          px-3 py-1 rounded-full text-xs font-play-bold uppercase tracking-wide
                          ${entry.difficulty === "easy"
                            ? "bg-red-200 dark:bg-red-900 text-red-600 dark:text-red-100"
                            : entry.difficulty === "medium"
                            ? "bg-yellow-200 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-100"
                            : "bg-green-200 dark:bg-green-900 text-green-600 dark:text-green-100"
                          }
                        `}>
                          {translations(`difficulty.${entry.difficulty}`)}
                        </span>
                      </td>

                      <td className = "px-6 py-4 text-center">
                        <span className = "font-courierprime-bold text-lg text-neutral-900 dark:text-white">
                          {entry.score}
                        </span>
                      </td>

                      <td className = "px-6 py-4 text-center text-neutral-700 dark:text-neutral-300 font-robotoslab-medium">
                        {entry.roundsCompleted}/5
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
