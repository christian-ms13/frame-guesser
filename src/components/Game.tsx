import Image from "next/image"

import fetchRandomMovie from "@/utils/tmdb"

export default async function Game() {
  const randomMovie = await fetchRandomMovie()

  return (
    <></>
  )
}
