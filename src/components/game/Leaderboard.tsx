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
    <div className = "max-w-4xl mx-auto p-4">
      <h1 className = "text-4xl font-bold text-center mb-8 bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        {translations("title")}
      </h1>

      <div className = "flex gap-2 mb-6 justify-center flex-wrap">
        {["all", "easy", "medium", "hard"].map((diff) => (
          <button
            key = {diff}
            onClick = {() => setDifficulty(diff as DifficultyLevel | "all")}
            className = {`
              px-4 py-2 rounded-lg font-semibold transition-colors
              ${
                difficulty === diff
                  ? "bg-purple-600 text-white"
                  : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              }
            `}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className = "text-center py-8">
          {translations("loading")}
        </div>
      ) : (
        <div className = "bg-white rounded-xl shadow-lg overflow-hidden">
          <table className = "w-full">
            <thead className = "bg-linear-to-r from-purple-600 to-pink-600 text-white">
              <tr>
                <th className = "px-6 py-3 text-left">{translations("table.rank")}</th>
                <th className = "px-6 py-3 text-left">{translations("table.player")}</th>
                <th className = "px-6 py-3 text-center">{translations("table.difficulty")}</th>
                <th className = "px-6 py-3 text-center">{translations("table.score")}</th>
                <th className = "px-6 py-3 text-center">{translations("table.rounds")}</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key = {entry.id}
                  className = {`border-b ${index < 3 ? "bg-yellow-50" : "hover:bg-neutral-50"}`}
                >
                  <td className = "px-6 py-4">
                    <div className = "flex items-center gap-2">
                      {index === 0 && <IconTrophy className = "w-6 h-6 text-yellow-400" />}
                      {index === 1 && <IconTrophy className = "w-6 h-6 text-gray-400" />}
                      {index === 2 && <IconTrophy className = "w-6 h-6 text-orange-600" />}

                      <span className = "font-bold">{index + 1}</span>
                    </div>
                  </td>

                  <td className = "px-6 py-4 font-semibold">
                    {entry.username || translations("table.anonymous")}
                  </td>

                  <td className = "px-6 py-4 text-center">
                    <span className = {`
                      px-2 py-1 rounded-full text-xs font-semibold
                      ${entry.difficulty === "easy"
                        ? "bg-green-100 text-red-500"
                        : entry.difficulty === "medium"
                        ? "bg-yellow-100 text-yellow-500"
                        : "bg-red-100 text-green-500"
                      }
                    `}>
                      {entry.difficulty}
                    </span>
                  </td>

                  <td className = "px-6 py-4 text-center font-bold text-purple-600">
                    {entry.score}
                  </td>

                  <td className = "px-6 py-4 text-center">
                    {entry.roundsCompleted}/5
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
