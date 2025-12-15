const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = process.env.TMDB_API_KEY

export default async function fetchRandomMovie() {
  const randomPage = Math.floor(Math.random() * 50) + 1
  const url = `${TMDB_BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${randomPage}`

  try {
    const res = await fetch(url)
    const data = await res.json()
    const moviesFetched = data.results

    const randomIndex = Math.floor(Math.random() * moviesFetched.length)
    const randomMovie = moviesFetched[randomIndex]
    return randomMovie
  } catch (error) {
    console.error(error)
  }
}
