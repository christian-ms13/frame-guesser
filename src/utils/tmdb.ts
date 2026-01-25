const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = process.env.TMDB_API_KEY
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original"

const DEFAULT_LANGUAGE = "en-US"
const TMDB_LANGUAGE_MAP: Record<string, string> = {
  en: "en-US",
  "en-us": "en-US",
  es: "es-ES",
  "es-es": "es-ES"
}

function resolveTmdbLanguage(locale?: string) {
  if (!locale) return DEFAULT_LANGUAGE
  const normalized = locale.toLowerCase()
  return TMDB_LANGUAGE_MAP[normalized] || DEFAULT_LANGUAGE
}

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

async function fetchMovieDetails(movieId: number, locale?: string): Promise<GameMovie | null> {
  try {
    // Always fetch in English to get original titles
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=${DEFAULT_LANGUAGE}`
    )

    if (!response.ok) return null

    const movie = await response.json()

    if (!movie.backdrop_path || !movie.title) return null

    let tagline = movie.tagline || ""

    // Fetch tagline in user's locale if different from English
    if (locale && locale !== "en") {
      const language = resolveTmdbLanguage(locale)
      if (language !== DEFAULT_LANGUAGE) {
        try {
          const localeResponse = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=${language}`
          )

          if (localeResponse.ok) {
            const localeMovie = await localeResponse.json()
            if (localeMovie.tagline) {
              tagline = localeMovie.tagline
            }
          }
        } catch (error) {
          // Silently fall back to English tagline
        }
      }
    }

    return {
      id: movie.id,
      title: movie.title,
      backdrop_path: `${IMAGE_BASE_URL}${movie.backdrop_path}`,
      poster_path: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
      overview: movie.overview || "No overview available.",
      release_date: movie.release_date || "",
      genres: movie.genres?.map((g: { name: string }) => g.name) || [],
      vote_average: movie.vote_average || 0,
      tagline,
      runtime: movie.runtime || 0,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0
    }
  } catch (error) {
    console.error(`Error fetching movie ${movieId}:`, error)
    return null
  }
}

export async function fetchMultipleMovies(count: number = 10, locale?: string): Promise<GameMovie[]> {
  const movies: GameMovie[] = []
  const usedIds = new Set<number>()

  const categories = ["popular", "top_rated", "now_playing"]

  let attempts = 0
  const maxAttempts = count * 5 // Increased max attempts to ensure uniqueness

  while (movies.length < count && attempts < maxAttempts) {
    attempts++

    const category = categories[Math.floor(Math.random() * categories.length)]

    const randomPage = Math.floor(Math.random() * 100) + 1

    try {
      // Always fetch in English for consistent original titles
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${category}?api_key=${API_KEY}&language=${DEFAULT_LANGUAGE}&page=${randomPage}`
      )

      if (!response.ok) continue

      const data = await response.json()
      const results = data.results || []

      if (results.length === 0) continue

      const randomMovie = results[Math.floor(Math.random() * results.length)]

      if (usedIds.has(randomMovie.id)) continue

      const detailedMovie = await fetchMovieDetails(randomMovie.id, locale)

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

export async function fetchRandomMovie(locale?: string) {
  const movies = await fetchMultipleMovies(1, locale)
  return movies[0] || null
}
