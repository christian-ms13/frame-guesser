"use client"

import { useTranslations } from "next-intl"

import { useEffect, useState } from "react"
import { getPersonalRecords, type LeaderboardEntry } from "../../app/game/actions"
import type { DifficultyLevel } from "../../types/game"
import { IconTrophy } from "./GameIcons"

interface PersonalRecordsProps {
  userId: string
}

export default function PersonalRecords({ userId }: PersonalRecordsProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [difficulty, setDifficulty] = useState<DifficultyLevel | "all">("all")
  const [loading, setLoading] = useState(true)

  const translations = useTranslations("personalRecords")

  useEffect(() => {
    async function fetchPersonalRecords() {
      setLoading(true)

      const data = await getPersonalRecords(
        userId,
        difficulty === "all" ? undefined : difficulty
      )

      setEntries(data)
      setLoading(false)
    }

    fetchPersonalRecords()
  }, [difficulty, userId])

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
      ) : entries.length === 0 ? (
        <div className = "text-center py-8 text-neutral-500">
          {translations("noRecords")}
        </div>
      ) : (
        <div className = "bg-white rounded-xl shadow-lg overflow-hidden">
          <table className = "w-full">
            <thead className = "bg-linear-to-r from-purple-600 to-pink-600 text-white">
              <tr>
                <th className = "px-6 py-3 text-left">{translations("table.rank")}</th>
                <th className = "px-6 py-3 text-center">{translations("table.difficulty")}</th>
                <th className = "px-6 py-3 text-center">{translations("table.score")}</th>
                <th className = "px-6 py-3 text-center">{translations("table.rounds")}</th>
                <th className = "px-6 py-3 text-center">{translations("table.date")}</th>
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

                  <td className = "px-6 py-4 text-center">
                    <span className = {`
                      px-2 py-1 rounded-full text-xs font-semibold
                      ${entry.difficulty === "easy"
                        ? "bg-green-100 text-green-600"
                        : entry.difficulty === "medium"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
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

                  <td className = "px-6 py-4 text-center text-sm text-neutral-600">
                    {new Date(entry.createdAt).toLocaleDateString()}
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
