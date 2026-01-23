"use client"

import { useLocale, useTranslations } from "next-intl"

import { useEffect, useState } from "react"
import { getPersonalRecords, type LeaderboardEntry } from "../../app/game/actions"
import type { DifficultyLevel } from "../../types/game"
import { IconTrophy } from "./GameIcons"

interface PersonalRecordsProps {
  userId: string
}

export default function PersonalRecords({ userId }: PersonalRecordsProps) {
  const locale = useLocale()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [difficulty, setDifficulty] = useState<DifficultyLevel | "all">("all")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<"score" | "date">("score")
  const entriesPerPage = 20

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
      setCurrentPage(1)
    }

    fetchPersonalRecords()
  }, [difficulty, userId])

  const sortedEntries = [...entries].sort((a, b) => {
    if (sortBy === "score") {
      return b.score - a.score
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const top3Ids = [...entries]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(entry => entry.id)

  const totalPages = Math.ceil(sortedEntries.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const currentEntries = sortedEntries.slice(startIndex, endIndex)

  return (
    <>
      <div className = "w-full max-w-5xl px-6">
        <div className = "mb-10">
          <h1 className = "text-5xl font-courierprime-bold text-neutral-900 dark:text-white text-center mb-2">
            {translations("title")}
          </h1>
          <p className = "text-center text-neutral-600 dark:text-neutral-400 font-robotoslab-medium">
            {translations("subtitle")}
          </p>
        </div>

        <div className = "flex gap-3 mb-8 justify-center flex-wrap items-center">
          <div className = "flex gap-3">
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

          <button
            onClick = {() => {
              setSortBy(prev => prev === "score" ? "date" : "score")
              setCurrentPage(1)
            }}
            className = "cursor-pointer px-6 py-3 rounded-2xl font-play-bold transition-all duration-150 hover:scale-105 active:scale-100 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600 shadow-md"
          >
            {translations(sortBy === "score" ? "sortByScore" : "sortByDate")}
          </button>
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
                {translations("noRecords")}
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
                    <th className = "px-6 py-4 text-center text-sm font-courierprime-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                      {translations("table.difficulty")}
                    </th>
                    <th className = "px-6 py-4 text-center text-sm font-courierprime-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                      {translations("table.score")}
                    </th>
                    <th className = "px-6 py-4 text-center text-sm font-courierprime-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                      {translations("table.rounds")}
                    </th>
                    <th className = "px-6 py-4 text-right text-sm font-courierprime-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                      {translations("table.date")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((entry, index) => {
                    const globalIndex = startIndex + index
                    return (
                      <tr
                        key = {entry.id}
                        className = {`border-b border-neutral-300 dark:border-[#2a2a2f] transition-colors duration-150 ${
                          globalIndex < 3
                            ? "bg-neutral-50 hover:bg-neutral-100 dark:bg-[#222224] dark:hover:bg-[#1d1d20]"
                            : "bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1a1a1c] dark:hover:bg-[#222226]"
                        }`}
                      >
                        <td className = "px-6 py-4">
                          <div className = "flex items-center gap-3">
                          {top3Ids[0] === entry.id && <IconTrophy className = "w-5 h-5 text-yellow-500" />}
                          {top3Ids[1] === entry.id && <IconTrophy className = "w-5 h-5 text-gray-400" />}
                          {top3Ids[2] === entry.id && <IconTrophy className = "w-5 h-5 text-orange-500" />}

                            <span className = "font-courierprime-bold text-lg text-neutral-900 dark:text-white">
                              {globalIndex + 1}
                          </span>
                        </div>
                      </td>

                      <td className = "px-6 py-4 text-center">
                        <span className = {`
                          px-3 py-1 rounded-full text-xs font-play-bold uppercase tracking-wide shadow-sm
                          ${entry.difficulty === "easy"
                            ? "bg-red-200 text-red-700 dark:bg-red-500/25 dark:border dark:border-red-400/70 dark:text-red-200"
                            : entry.difficulty === "medium"
                            ? "bg-amber-200 text-amber-700 dark:bg-amber-500/25 dark:border dark:border-amber-400/70 dark:text-amber-200"
                            : "bg-emerald-200 text-emerald-700 dark:bg-emerald-500/25 dark:border dark:border-emerald-400/70 dark:text-emerald-200"
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

                      <td className = "px-6 py-4 text-right text-sm text-neutral-600 dark:text-neutral-400 font-robotoslab-medium">
                        {new Date(entry.createdAt).toLocaleString(locale === "es" ? "es-ES" : "en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && entries.length > entriesPerPage && (
          <div className = "flex items-center justify-center gap-2 mt-8">
            <button
              onClick = {() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled = {currentPage === 1}
              className = "px-4 py-2 rounded-xl font-play-bold text-neutral-900 dark:text-white bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
            >
              ‹
            </button>

            <div className = "flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key = {pageNum}
                      onClick = {() => setCurrentPage(pageNum)}
                      className = {`
                        cursor-pointer px-4 py-2 rounded-xl font-play-bold transition-all duration-150
                        ${
                          currentPage === pageNum
                            ? "bg-[#121212] text-[#e3e3e1] dark:bg-[#e3e3e1] dark:text-[#121212]"
                            : "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600"
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  )
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return (
                    <span key = {pageNum} className = "px-2 py-2 text-neutral-600 dark:text-neutral-400">
                      …
                    </span>
                  )
                }
                return null
              })}
            </div>

            <button
              onClick = {() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled = {currentPage === totalPages}
              className = "px-4 py-2 rounded-xl font-play-bold text-neutral-900 dark:text-white bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </>
  )
}
