const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = process.env.TMDB_API_KEY
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original"

export interface GameMovie {
  id: number
  title: string
  backdrop_path: string
  poster_path: string | null
  overview: string
  release_date: string
  genres: string[]
  vote_average: number
  tagline: string
  runtime: number
  year: number
}

async function fetchMovieDetails(movieId: number): Promise<GameMovie | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`
    )

    if (!response.ok) return null

    const movie = await response.json()

    if (!movie.backdrop_path || !movie.title) return null

    return {
      id: movie.id,
      title: movie.title,
      backdrop_path: `${IMAGE_BASE_URL}${movie.backdrop_path}`,
      poster_path: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
      overview: movie.overview || "No overview available.",
      release_date: movie.release_date || "",
      genres: movie.genres?.map((g: { name: string }) => g.name) || [],
      vote_average: movie.vote_average || 0,
      tagline: movie.tagline || "",
      runtime: movie.runtime || 0,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0
    }
  } catch (error) {
    console.error(`Error fetching movie ${movieId}:`, error)
    return null
  }
}

export async function fetchMultipleMovies(count: number = 10): Promise<GameMovie[]> {
  const movies: GameMovie[] = []
  const usedIds = new Set<number>()

  const categories = ["popular", "top_rated", "now_playing"]

  let attempts = 0
  const maxAttempts = count * 5 // Increased max attempts to ensure uniqueness

  while (movies.length < count && attempts < maxAttempts) {
    attempts++

    const category = categories[Math.floor(Math.random() * categories.length)]

    // Increased page range for more variety
    const randomPage = Math.floor(Math.random() * 100) + 1

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${category}?api_key=${API_KEY}&language=en-US&page=${randomPage}`
      )

      if (!response.ok) continue

      const data = await response.json()
      const results = data.results || []

      if (results.length === 0) continue

      const randomMovie = results[Math.floor(Math.random() * results.length)]

      if (usedIds.has(randomMovie.id)) continue

      const detailedMovie = await fetchMovieDetails(randomMovie.id)

      if (detailedMovie) {
        movies.push(detailedMovie)
        usedIds.add(randomMovie.id)
      }
    } catch (error) {
      console.error("Error fetching from category:", category, error)
    }
  }

  return movies
}

export async function fetchRandomMovie() {
  const movies = await fetchMultipleMovies(1)
  return movies[0] || null
}
