export default function LoginForm() {
  return (
    <form>
      <input
        type = "email"
        placeholder = "Email"
        className = "mb-4 p-2 border border-gray-300 rounded w-full"
      />

      <input
        type = "password"
        placeholder = "Password"
        className = "mb-4 p-2 border border-gray-300 rounded w-full"
      />

      <button
        type = "submit"
        className = "bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition"
      >
        Log In
      </button>
    </form>
  )
}
