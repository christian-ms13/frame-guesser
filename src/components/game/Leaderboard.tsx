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
        ) : entries.length === 0 ? (
          <div className = "flex items-center justify-center py-16">
            <div className = "text-center">
              <IconTrophy className = "w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
              <p className = "text-lg text-neutral-600 dark:text-neutral-400 font-robotoslab-medium">
                No entries yet for this difficulty
              </p>
            </div>
          </div>
        ) : (
          <div className = "bg-neutral-100 dark:bg-[#1b1b1d] rounded-3xl shadow-xl shadow-black/40 dark:shadow-black/70 border-2 border-neutral-200 dark:border-[#2d2d30] overflow-hidden">
            <div className = "overflow-x-auto">
              <table className = "w-full">
                <thead className = "bg-neutral-200 dark:bg-[#232326] border-b-2 border-neutral-300 dark:border-[#2e2e32]">
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
                      className = {`border-b border-neutral-300 dark:border-[#2a2a2f] transition-colors duration-150 ${
                        index < 3
                          ? "bg-neutral-50 hover:bg-neutral-100 dark:bg-[#222224] dark:hover:bg-[#1d1d20]"
                          : "bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1a1a1c] dark:hover:bg-[#222226]"
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
                          px-3 py-1 rounded-full text-xs font-play-bold uppercase tracking-wide shadow-sm
                          ${entry.difficulty === "easy"
                            ? "bg-red-200 dark:bg-red-500/25 dark:border dark:border-red-400/70 text-red-700 dark:text-red-200"
                            : entry.difficulty === "medium"
                            ? "bg-amber-200 dark:bg-amber-500/25 dark:border dark:border-amber-400/70 text-amber-700 dark:text-amber-200"
                            : "bg-emerald-200 dark:bg-emerald-500/25 dark:border dark:border-emerald-400/70 text-emerald-700 dark:text-emerald-200"
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
