// npx tsx --env-file=.env.local tests/test-tmdb.ts

import { fetchMultipleMovies } from "../src/utils/tmdb"

async function test() {
  console.log("Fetching 5 random movies from TMDB...")
  const movies = await fetchMultipleMovies(5)

  console.log(`Got ${movies.length} movies:`)
  movies.forEach((movie, index) => {
    console.log(`${index + 1}. ${movie.title} (${movie.year})`)
    console.log(`   Genres: ${movie.genres.join(", ")}`)
    console.log(`   Rating: ${movie.vote_average}/10`)
    console.log(`   Tagline: ${movie.tagline || "N/A"}`)
  })
}

test()
