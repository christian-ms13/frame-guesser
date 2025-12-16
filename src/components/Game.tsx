"use client"

import { useState } from "react"
import Image from "next/image"

interface Movie {
  id: number,
  title: string,
  backdrop_path: string
}

interface GameProps {
  movie: Movie
}

export default function Game({ movie }: GameProps) {
  const [isGuessed, setIsGuessed] = useState(false)

  return (
    <div className = "flex flex-col items-center justify-center">
      <h2>Guess the movie!</h2>

      <Image
        src = {`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
        alt = "Movie Backdrop"
        width = {1000}
        height = {300}
        className = {`rounded-lg shadow-lg mt-4 ${isGuessed ? "" : "blur-sm"} transition-blur duration-300`}
      />

      <button
        onClick = {() => setIsGuessed(!isGuessed)}
        className = "mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
      >
        {isGuessed ? "Hide Answer" : "Reveal Answer"}
      </button>
    </div>
  )
}
